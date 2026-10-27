import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { projects } from '../src/data/projects.ts';
import { profile } from '../src/data/profile.ts';

async function files(directory) {
  return (await Promise.all((await readdir(directory, { withFileTypes: true })).map(entry => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? files(path) : path;
  }))).flat();
}

test('build includes only intended public content and valid local assets', async () => {
  const paths = await files('dist');
  assert.ok(paths.includes('dist/404.html'));
  assert.ok(!paths.some(path => /\.(pdf|md|ts|map)$/i.test(path)));
  const info = await readFile('dist/index.html', 'utf8');
  const works = await readFile('dist/works/index.html', 'utf8');
  for (const html of [info, works]) {
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
    assert.ok(!/localhost|Downloads|\.pdf|tel:|set:html|lorem ipsum/i.test(html));
    assert.ok(!/\+?\d[\d ()-]{8,}\d/.test(html.replace(/<[^>]*>/g, '')), 'No phone-like public text');
    assert.ok(!/href="\/blog/.test(html));
    for (const match of html.matchAll(/(?:href|src)="(\/(?:fonts|_astro)\/[^"?#]+|\/favicon\.svg)"/g)) {
      assert.ok(paths.includes(`dist${match[1]}`), `Missing asset ${match[1]}`);
    }
  }
  assert.ok(info.includes(profile.email));
  for (const paragraph of profile.biography) assert.ok(info.replace(/<[^>]*>/g, '').includes(paragraph.replaceAll("'", '&#39;')) || info.replace(/<[^>]*>/g, '').includes(paragraph));
  assert.equal((works.match(/<article\b/g) || []).length, 4);
  for (const project of projects) assert.ok(works.includes(project.title));
  const jsPaths = paths.filter(path => path.endsWith('.js'));
  let jsSize = 0;
  for (const path of jsPaths) jsSize += gzipSync(await readFile(path)).length;
  const inlineSize = Math.max(...[info, works].map(html => gzipSync([...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n')).length));
  jsSize += inlineSize;
  assert.ok(jsSize <= 10_000, `JavaScript transfer: ${jsSize} bytes`);
  const assetPaths = paths.filter(path => /\.(woff2|css|js)$/.test(path));
  let size = Math.max(gzipSync(info).length, gzipSync(works).length);
  for (const path of assetPaths) size += gzipSync(await readFile(path)).length;
  assert.ok(size <= 250_000, `Conservative page transfer: ${size} bytes`);
  console.log(`Compressed first-party JS: ${jsSize} B; page plus all runtime assets: ${size} B.`);
});

test('publication origin rejects unsafe or incomplete canonical configuration', () => {
  const command = 'import config from "./astro.config.mjs"; console.log(config.site)';
  for (const origin of ['http://example.com', 'https://example.com/path', 'https://example.com/?q=1', 'https://user:secret@example.com', 'https://localhost', 'not-a-url']) {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', command], { env: { ...process.env, SITE_ORIGIN: origin } });
    assert.notEqual(result.status, 0, origin);
  }
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', command], { env: { ...process.env, SITE_ORIGIN: 'https://portfolio.example/' }, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), 'https://portfolio.example/');
});

test('sitemap uses the configured origin and excludes the not-found page', async () => {
  const { GET } = await import('../src/pages/sitemap.xml.ts');
  const configured = await (await GET({ site: new URL('https://portfolio.example/') })).text();
  assert.equal((configured.match(/<url>/g) || []).length, 2);
  assert.ok(configured.includes('<loc>https://portfolio.example/works/</loc>'));
  assert.ok(!configured.includes('404'));
  const local = await (await GET({ site: undefined })).text();
  assert.ok(!local.includes('<url>'));
});
