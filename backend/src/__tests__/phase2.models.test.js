import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../models/User.js';
import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';
import ProjectFile from '../models/ProjectFile.js';
import Document from '../models/Document.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import Activity from '../models/Activity.js';

jest.setTimeout(30000);

describe('phase 2 database foundation models', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: 'devflowai-phase2-test' });
    await WorkspaceMember.collection.createIndex({ workspace: 1, user: 1 }, { unique: true });
    await ProjectMember.collection.createIndex({ project: 1, user: 1 }, { unique: true });
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
      ProjectMember.deleteMany({}),
      ProjectFile.deleteMany({}),
      Document.deleteMany({}),
      Task.deleteMany({}),
      Notification.deleteMany({}),
      Activity.deleteMany({})
    ]);
  });

  it('creates valid workspace, project, task, and document records', async () => {
    const user = await User.create({
      name: 'Alice Admin',
      email: 'alice@example.com',
      password: 'StrongPass123!',
      isVerified: true
    });

    const workspace = await Workspace.create({
      name: 'Platform Team',
      slug: 'platform-team',
      owner: user._id,
      description: 'Main workspace for product delivery.'
    });

    await WorkspaceMember.create({
      workspace: workspace._id,
      user: user._id,
      role: 'owner'
    });

    const project = await Project.create({
      name: 'API Gateway',
      slug: 'api-gateway',
      workspace: workspace._id,
      owner: user._id,
      visibility: 'private'
    });

    const task = await Task.create({
      title: 'Ship onboarding flow',
      description: 'Prepare backlog and docs',
      project: project._id,
      workspace: workspace._id,
      createdBy: user._id,
      assignee: user._id,
      status: 'in_progress',
      priority: 'high',
      labels: ['product', 'backend']
    });

    const document = await Document.create({
      project: project._id,
      workspace: workspace._id,
      createdBy: user._id,
      title: 'Architecture Notes',
      slug: 'architecture-notes',
      content: '# Notes\n\n- Use MongoDB documents for workspace data.',
      contentFormat: 'markdown'
    });

    const file = await ProjectFile.create({
      project: project._id,
      workspace: workspace._id,
      uploadedBy: user._id,
      name: 'diagram.png',
      originalName: 'diagram.png',
      storageKey: 'projects/api-gateway/diagram.png',
      mimeType: 'image/png',
      size: 51200,
      url: 'https://example.com/diagram.png'
    });

    expect(workspace.createdAt).toBeTruthy();
    expect(project.workspace.toString()).toBe(workspace._id.toString());
    expect(task.status).toBe('in_progress');
    expect(document.contentFormat).toBe('markdown');
    expect(file.storageProvider).toBe('imagekit');
  });

  it('rejects invalid enum values and required fields', () => {
    const invalidWorkspace = new Workspace({ name: 'Bad', slug: 'Bad Slug', owner: new mongoose.Types.ObjectId() });
    const workspaceError = invalidWorkspace.validateSync();
    expect(workspaceError.errors.slug).toBeTruthy();

    const invalidProject = new Project({
      name: 'Bad project',
      slug: 'bad-project',
      workspace: new mongoose.Types.ObjectId(),
      owner: new mongoose.Types.ObjectId(),
      status: 'unknown'
    });
    const projectError = invalidProject.validateSync();
    expect(projectError.errors.status).toBeTruthy();

    const invalidNotification = new Notification({
      recipient: new mongoose.Types.ObjectId(),
      title: 'Notice',
      message: 'Message',
      type: 'invalid-type'
    });
    const notificationError = invalidNotification.validateSync();
    expect(notificationError.errors.type).toBeTruthy();
  });

  it('enforces unique membership constraints', async () => {
    const user = await User.create({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'StrongPass123!',
      isVerified: true
    });

    const workspace = await Workspace.create({ name: 'Ops', slug: 'ops', owner: user._id });
    await WorkspaceMember.create({ workspace: workspace._id, user: user._id, role: 'member' });

    await expect(
      WorkspaceMember.create({ workspace: workspace._id, user: user._id, role: 'admin' })
    ).rejects.toMatchObject({ code: 11000 });

    const project = await Project.create({ name: 'Web', slug: 'web', workspace: workspace._id, owner: user._id });
    await ProjectMember.create({ project: project._id, user: user._id, role: 'editor' });

    await expect(
      ProjectMember.create({ project: project._id, user: user._id, role: 'viewer' })
    ).rejects.toMatchObject({ code: 11000 });
  });

  it('stores read state and activity metadata as expected', async () => {
    const user = await User.create({
      name: 'Charlie',
      email: 'charlie@example.com',
      password: 'StrongPass123!',
      isVerified: true
    });

    const workspace = await Workspace.create({ name: 'Research', slug: 'research', owner: user._id });
    const project = await Project.create({ name: 'Docs', slug: 'docs', workspace: workspace._id, owner: user._id });

    const notification = await Notification.create({
      recipient: user._id,
      workspace: workspace._id,
      project: project._id,
      type: 'project',
      title: 'Project updated',
      message: 'The docs project was updated.',
      metadata: { source: 'phase-2' }
    });

    expect(notification.readAt).toBeNull();

    const readNotification = await Notification.findByIdAndUpdate(
      notification._id,
      { readAt: new Date() },
      { new: true }
    );
    expect(readNotification.readAt).toBeInstanceOf(Date);

    const activity = await Activity.create({
      actor: user._id,
      workspace: workspace._id,
      project: project._id,
      entityType: 'project',
      entityId: project._id.toString(),
      action: 'created',
      metadata: { version: 1 }
    });

    expect(activity.metadata.version).toBe(1);
    expect(activity.createdAt).toBeTruthy();
  });
});
