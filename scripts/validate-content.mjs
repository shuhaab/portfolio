import assert from 'node:assert/strict';
import { profile, experience, education, community } from '../src/data/profile.ts';
import { projects } from '../src/data/projects.ts';

function required(value) {
  assert.equal(typeof value, 'string');
  assert.ok(value.trim(), 'Content must not be empty');
  assert.ok(!/\b(TODO|TBD|lorem ipsum|placeholder)\b/i.test(value), 'Unfinished public copy');
}

function httpsLink(href) {
  assert.equal(new URL(href).protocol, 'https:', `Links must use HTTPS: ${href}`);
}

Object.values(profile).flat().forEach(required);
assert.equal(profile.email, 'shuhaabbhat@gmail.com');
for (const link of [profile.github, profile.linkedIn]) httpsLink(link);
for (const entry of [...experience, ...education, ...community]) Object.values(entry).forEach(required);
assert.equal(projects.length, 5);
assert.equal(new Set(projects.map(project => project.id)).size, projects.length);
for (const { links, note, ...project } of projects) {
  Object.values(project).flat().forEach(required);
  assert.ok(project.contributions.length && project.technologies.length);
  // Every project either links to something public or says why it cannot.
  assert.ok(links.length || note, `${project.title} needs a link or a note`);
  if (note) required(note);
  for (const link of links) {
    required(link.label);
    httpsLink(link.href);
  }
}
console.log(`Curated content validated: profile, timelines, and ${projects.length} projects.`);
