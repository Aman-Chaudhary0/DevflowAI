import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';
import {
  createProjectForUser,
  deleteProjectForUser,
  getDashboardSummaryForUser,
  getProjectForUser,
  listProjectsForUser,
  updateProjectForUser
} from '../services/project.service.js';

jest.setTimeout(30000);

describe('project lifecycle and access controls', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: 'devflowai-project-lifecycle-test' });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      Workspace.deleteMany({}),
      WorkspaceMember.deleteMany({}),
      Project.deleteMany({}),
      ProjectMember.deleteMany({})
    ]);
  });

  it('creates, lists, updates, archives, restores, and deletes a project for its owner', async () => {
    const owner = await User.create({
      name: 'Project Owner',
      email: 'owner@example.com',
      password: 'StrongPass123!',
      isVerified: true
    });

    const created = await createProjectForUser(owner, {
      name: 'Alpha Project',
      slug: 'alpha-project',
      description: 'Launch-ready workspace',
      visibility: 'private',
      settings: { color: '#3b82f6', techStack: ['Next.js', 'MongoDB'] }
    });

    expect(created.name).toBe('Alpha Project');
    expect(created.slug).toBe('alpha-project');

    const listResult = await listProjectsForUser(owner, { page: 1, limit: 20 });
    expect(listResult.total).toBe(1);
    expect(listResult.projects[0]._id.toString()).toBe(created._id.toString());

    const detail = await getProjectForUser(owner._id, created._id.toString());
    expect(detail.name).toBe('Alpha Project');

    const updated = await updateProjectForUser(owner, created._id.toString(), {
      status: 'archived',
      description: 'Archived by owner'
    });
    expect(updated.status).toBe('archived');
    expect(updated.description).toBe('Archived by owner');

    const restored = await updateProjectForUser(owner, created._id.toString(), { status: 'active' });
    expect(restored.status).toBe('active');

    const summary = await getDashboardSummaryForUser(owner._id);
    expect(summary.totalProjects).toBe(1);
    expect(summary.activeProjects).toBe(1);
    expect(summary.archivedProjects).toBe(0);

    const deleted = await deleteProjectForUser(owner, created._id.toString());
    expect(deleted.deleted).toBe(true);
    expect(await Project.countDocuments()).toBe(0);
  });

  it('blocks duplicate slugs and unauthorized reads across users', async () => {
    const owner = await User.create({
      name: 'Primary User',
      email: 'primary@example.com',
      password: 'StrongPass123!',
      isVerified: true
    });

    const outsider = await User.create({
      name: 'Outside User',
      email: 'outsider@example.com',
      password: 'StrongPass123!',
      isVerified: true
    });

    await createProjectForUser(owner, { name: 'Shared Project', slug: 'shared-project' });

    await expect(
      createProjectForUser(owner, { name: 'Shared Project', slug: 'shared-project' })
    ).rejects.toMatchObject({ statusCode: 409 });

    const project = await Project.findOne({ slug: 'shared-project' });
    await expect(getProjectForUser(outsider._id, project._id.toString())).rejects.toMatchObject({ statusCode: 404 });
  });
});
