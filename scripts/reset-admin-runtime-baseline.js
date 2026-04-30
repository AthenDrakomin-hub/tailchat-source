#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const repoRoot = path.resolve(__dirname, '..');
const serverRoot = path.join(repoRoot, 'server');
const requireFromServer = createRequire(path.join(serverRoot, 'package.json'));

const dotenv = requireFromServer('dotenv');
const mongoose = requireFromServer('mongoose');
const bcrypt = requireFromServer('bcryptjs');

const envPath = path.join(serverRoot, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/tailchat';
const baselinePassword = process.env.BASELINE_PASSWORD || '123456789';

const baseline = {
  owner: {
    _id: '507f1f77bcf86cd799439011',
    username: 'owner',
    email: 'owner@example.com',
    nickname: 'Owner',
    discriminator: '0001',
    systemRole: 'teacher',
  },
  member: {
    _id: '507f191e810c19729de860ea',
    username: 'member',
    email: 'member@example.com',
    nickname: 'Member',
    discriminator: '0002',
    systemRole: 'student',
  },
  group: {
    _id: '507f191e810c19729de860eb',
    name: 'Test Group Full Main',
    description: 'Updated via admin resource API under full main service',
  },
};

async function main() {
  await mongoose.connect(mongoUrl);
  const db = mongoose.connection.db;

  const ownerId = new mongoose.Types.ObjectId(baseline.owner._id);
  const memberId = new mongoose.Types.ObjectId(baseline.member._id);
  const groupId = new mongoose.Types.ObjectId(baseline.group._id);
  const passwordHash = bcrypt.hashSync(baselinePassword, 10);
  const now = new Date();

  const users = db.collection('users');
  const groups = db.collection('groups');
  const invites = db.collection('groupinvites');

  await users.updateOne(
    { _id: ownerId },
    {
      $set: {
        username: baseline.owner.username,
        email: baseline.owner.email,
        password: passwordHash,
        nickname: baseline.owner.nickname,
        discriminator: baseline.owner.discriminator,
        temporary: false,
        avatar: '',
        type: 'normalUser',
        systemRole: baseline.owner.systemRole,
        emailVerified: true,
        banned: false,
        settings: {},
        updatedAt: now,
      },
      $setOnInsert: {
        _id: ownerId,
        createdAt: now,
      },
    },
    { upsert: true }
  );

  await users.updateOne(
    { _id: memberId },
    {
      $set: {
        username: baseline.member.username,
        email: baseline.member.email,
        password: passwordHash,
        nickname: baseline.member.nickname,
        discriminator: baseline.member.discriminator,
        temporary: false,
        avatar: '',
        type: 'normalUser',
        systemRole: baseline.member.systemRole,
        emailVerified: true,
        banned: false,
        settings: {},
        updatedAt: now,
      },
      $setOnInsert: {
        _id: memberId,
        createdAt: now,
      },
    },
    { upsert: true }
  );

  const existingGroup = await groups.findOne({ _id: groupId });

  if (existingGroup) {
    await groups.updateOne(
      { _id: groupId },
      {
        $set: {
          name: baseline.group.name,
          description: baseline.group.description,
          owner: ownerId,
          avatar: existingGroup.avatar ?? '',
          members: [
            { userId: ownerId, roles: [] },
            { userId: memberId, roles: [] },
          ],
          updatedAt: now,
        },
      }
    );
  } else {
    await groups.insertOne({
      _id: groupId,
      name: baseline.group.name,
      description: baseline.group.description,
      owner: ownerId,
      avatar: '',
      members: [
        { userId: ownerId, roles: [] },
        { userId: memberId, roles: [] },
      ],
      panels: [],
      roles: [],
      fallbackPermissions: [],
      config: {},
      createdAt: now,
      updatedAt: now,
    });
  }

  const inviteDeleteResult = await invites.deleteMany({ groupId });

  const finalGroup = await groups.findOne({ _id: groupId });
  const finalInvites = await invites
    .find({ groupId }, { projection: { code: 1, usage: 1, expiredAt: 1 } })
    .toArray();

  const summary = {
    ok: true,
    baselinePassword,
    owner: baseline.owner.email,
    member: baseline.member.email,
    group: {
      id: baseline.group._id,
      name: finalGroup?.name,
      description: finalGroup?.description,
      owner: String(finalGroup?.owner),
      memberCount: finalGroup?.members?.length ?? 0,
      members: (finalGroup?.members ?? []).map((m) => ({
        userId: String(m.userId),
        roles: m.roles ?? [],
      })),
    },
    invites: {
      deleted: inviteDeleteResult.deletedCount,
      remaining: finalInvites.length,
    },
  };

  console.log(JSON.stringify(summary, null, 2));
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch (disconnectErr) {}
  process.exit(1);
});
