process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'devflow-ai-access-test-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'devflow-ai-refresh-test-secret';
process.env.TWO_FACTOR_ENCRYPTION_KEY = process.env.TWO_FACTOR_ENCRYPTION_KEY || 'devflow-ai-two-factor-test-key';

import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../models/User.js';
import { loginUser, startTwoFactorSetup, enableTwoFactorForUser, disableTwoFactorForUser, verifyTwoFactorChallenge } from '../services/auth/auth.service.js';
import { decryptValue } from '../utils/encryption.js';
import { TOTP } from 'otpauth';

jest.setTimeout(30000);

describe('2FA auth flows', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: 'devflowai-test' });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  const generateCodeForSecret = (secret) => {
    const totp = new TOTP({
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret
    });
    return totp.generate();
  };

  it('enables 2FA only after valid setup code', async () => {
    const user = await User.create({
      name: '2FA User',
      email: '2fa@example.com',
      password: 'StrongPass123!',
      isVerified: true
    });

    await startTwoFactorSetup(user._id);
    const storedUser = await User.findById(user._id).select('+twoFactorSetupSecret');
    const secret = decryptValue(storedUser.twoFactorSetupSecret);
    const validCode = generateCodeForSecret(secret);

    const enabled = await enableTwoFactorForUser(user._id, validCode);
    expect(enabled.user.twoFactorEnabled).toBe(true);
    expect(enabled.recoveryCodes.length).toBeGreaterThan(0);
  });

  it('rejects invalid 2FA codes during setup', async () => {
    const user = await User.create({
      name: 'Bad 2FA User',
      email: 'bad2fa@example.com',
      password: 'StrongPass123!',
      isVerified: true
    });

    await startTwoFactorSetup(user._id);
    await expect(enableTwoFactorForUser(user._id, '000000')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('requires 2FA during login when enabled', async () => {
    const user = await User.create({
      name: 'Login 2FA User',
      email: 'login2fa@example.com',
      password: 'StrongPass123!',
      isVerified: true
    });

    await startTwoFactorSetup(user._id);
    const storedUser = await User.findById(user._id).select('+twoFactorSetupSecret');
    const secret = decryptValue(storedUser.twoFactorSetupSecret);
    const code = generateCodeForSecret(secret);
    await enableTwoFactorForUser(user._id, code);

    const firstStep = await loginUser({ email: 'login2fa@example.com', password: 'StrongPass123!' });
    expect(firstStep.requiresTwoFactor).toBe(true);
    expect(firstStep.challengeToken).toBeTruthy();
    expect(firstStep.accessToken).toBeUndefined();
  });

  it('accepts a valid recovery code and allows disabling 2FA', async () => {
    const user = await User.create({
      name: 'Recovery User',
      email: 'recovery@example.com',
      password: 'StrongPass123!',
      isVerified: true
    });

    await startTwoFactorSetup(user._id);
    const storedUser = await User.findById(user._id).select('+twoFactorSetupSecret');
    const secret = decryptValue(storedUser.twoFactorSetupSecret);
    const code = generateCodeForSecret(secret);
    const enabled = await enableTwoFactorForUser(user._id, code);
    const recoveryCode = enabled.recoveryCodes[0];

    const disabled = await disableTwoFactorForUser(user._id, { recoveryCode });
    expect(disabled.user.twoFactorEnabled).toBe(false);
  });

  it('verifies a valid TOTP challenge and returns session tokens', async () => {
    const user = await User.create({
      name: 'Challenge User',
      email: 'challenge@example.com',
      password: 'StrongPass123!',
      isVerified: true
    });

    await startTwoFactorSetup(user._id);
    const storedUser = await User.findById(user._id).select('+twoFactorSetupSecret');
    const secret = decryptValue(storedUser.twoFactorSetupSecret);
    const code = generateCodeForSecret(secret);
    await enableTwoFactorForUser(user._id, code);

    const firstStep = await loginUser({ email: 'challenge@example.com', password: 'StrongPass123!' });
    const challenged = await verifyTwoFactorChallenge(user._id, firstStep.challengeToken, { code: generateCodeForSecret(secret) });

    expect(challenged.accessToken).toBeTruthy();
    expect(challenged.refreshToken).toBeTruthy();
  });
});
