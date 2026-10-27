import assert from 'node:assert/strict';
import { profile, experience, education, community } from '../src/data/profile.ts';
import { projects } from '../src/data/projects.ts';

function required(value) {
  assert.equal(typeof value, 'string');
  assert.ok(value.trim(), 'Content must not be empty');
  assert.ok(!/\b(TODO|TBD|lorem ipsum|placeholder)\b/i.test(value), 'Unfinished public copy');
}

Object.values(profile).flat().forEach(required);
assert.equal(profile.email, 'shuhaabbhat@gmail.com');
for (const link of [profile.github, profile.linkedIn]) assert.equal(new URL(link).protocol, 'https:');
for (const entry of [...experience, ...education, ...community]) Object.values(entry).forEach(required);
assert.equal(projects.length, 4);
assert.equal(new Set(projects.map(project => project.id)).size, 4);
for (const project of projects) {
  Object.values(project).flat().forEach(required);
  assert.ok(project.contributions.length && project.technologies.length);
}
console.log('Curated content validated: profile, timelines, and four projects.');
