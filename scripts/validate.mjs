#!/usr/bin/env node
// Validates the exported Port OS docs tree: guide frontmatter, skills and relative links.
// Copied to scripts/validate.mjs in the public docs repository. Uses only Node built-ins.
//
//   guides/<group>/<guide-id>.md            plain guides (oauth, connect-ai, api)
//   skills/<category>/<name>/SKILL.md       skills (setup, general, devices): each is a website guide and an Agent Skill
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const authorships = ['HUMAN', 'AI', 'HUMAN_MIXED_WITH_AI'];
const groups = ['oauth', 'connect-ai', 'api'];
const categories = ['setup', 'general', 'devices'];
// Agent Skills top-level fields; the guide fields live in a string-valued metadata map.
const skillFields = ['name', 'description', 'license', 'compatibility', 'allowed-tools', 'metadata'];
const skillMetadata = ['title', 'guide-id', 'slug', 'capabilities', 'content-authorship', 'author', 'last modified'];
const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function files(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? files(full) : [full];
  });
}

const directories = directory => (existsSync(directory) ? readdirSync(directory, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name).sort() : []);

function scalar(text) {
  const value = text.trim();
  if (value.startsWith('"')) return JSON.parse(value);
  if (value.startsWith("'")) return value.slice(1, -1).replaceAll("''", "'");
  return value;
}

// Reads the small YAML subset the docs use: scalars, folded text, string lists and one level of nested maps.
export function frontmatter(source) {
  const match = source.replaceAll('\r\n', '\n').match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;
  const data = {};
  const lines = match[1].split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const field = lines[index].match(/^([A-Za-z][\w -]*?):(?:\s+(.*))?$/);
    if (!field) continue;
    const [, key, rest = ''] = field;
    if (/^[>|][-+]?$/.test(rest)) {
      const block = [];
      while (index + 1 < lines.length && /^\s+\S/.test(lines[index + 1])) block.push(lines[++index].trim());
      data[key] = block.join(' ');
    } else if (rest === '' && index + 1 < lines.length && /^\s+[A-Za-z][\w -]*?:(\s|$)/.test(lines[index + 1])) {
      const map = {};
      while (index + 1 < lines.length && /^\s+\S/.test(lines[index + 1])) {
        const entry = lines[++index].trim().match(/^([A-Za-z][\w -]*?):(?:\s+(.*))?$/);
        if (entry) map[entry[1]] = scalar(entry[2] ?? '');
      }
      data[key] = map;
    } else if (rest === '') {
      const items = [];
      while (index + 1 < lines.length && /^\s+- /.test(lines[index + 1])) items.push(scalar(lines[++index].replace(/^\s+- /, '')));
      data[key] = items;
    } else data[key] = scalar(rest);
  }
  return data;
}

// Relative Markdown links outside code fences.
export function relativeLinks(source) {
  const links = [];
  let fence = null;
  for (const line of source.replaceAll('\r\n', '\n').split('\n')) {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (marker) {
      if (!fence) fence = marker[1][0];
      else if (marker[1][0] === fence) fence = null;
      continue;
    }
    if (fence) continue;
    for (const match of line.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const target = match[1];
      if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('/') || target.startsWith('#')) continue;
      links.push(target.split('#')[0].split('?')[0]);
    }
  }
  return links.filter(Boolean);
}

function checkGuide(errors, relative, fields) {
  if (!fields.title) errors.push(`${relative}: missing title`);
  if (!fields.description) errors.push(`${relative}: missing description`);
  if (!authorships.includes(fields['content-authorship'])) errors.push(`${relative}: content-authorship must be one of ${authorships.join(', ')}`);
}

function validateGuides(root, errors, guideIds) {
  const guideRoot = path.join(root, 'guides');
  for (const file of files(guideRoot).filter(name => name.endsWith('.md'))) {
    const relative = path.relative(root, file).replaceAll('\\', '/');
    const group = path.relative(guideRoot, path.dirname(file)).replaceAll('\\', '/');
    const data = frontmatter(readFileSync(file, 'utf8'));
    if (!data) { errors.push(`${relative}: missing frontmatter`); continue; }
    const id = path.basename(file, '.md');
    if (!groups.includes(group)) errors.push(`${relative}: guides belong in one of ${groups.map(name => `guides/${name}`).join(', ')}; skills belong in skills/<category>/<name>/SKILL.md`);
    if (data['guide-id'] !== id) errors.push(`${relative}: guide-id must equal the file name (${id})`);
    if (data['skill-id'] !== undefined) errors.push(`${relative}: plain guides have no skill-id`);
    if (guideIds.has(id)) errors.push(`${relative}: duplicate guide-id ${id}`);
    guideIds.add(id);
    checkGuide(errors, relative, data);
  }
}

function validateSkill(errors, relative, name, category, data, guideIds) {
  const keys = Object.keys(data);
  if (keys[0] !== 'name' || keys[1] !== 'description') errors.push(`${relative}: frontmatter must start with name and description`);
  const extra = keys.filter(key => !skillFields.includes(key));
  if (extra.length) errors.push(`${relative}: fields Agent Skills do not allow: ${extra.join(', ')}`);
  if (data.name !== name) errors.push(`${relative}: name must equal the directory name (${name})`);
  const metadata = data.metadata;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) { errors.push(`${relative}: missing metadata map`); return; }
  for (const [key, value] of Object.entries(metadata)) {
    if (!skillMetadata.includes(key)) errors.push(`${relative}: unknown metadata field ${key}`);
    else if (typeof value !== 'string') errors.push(`${relative}: metadata ${key} must be a string`);
  }
  const id = metadata['guide-id'];
  if (!kebab.test(id ?? '')) errors.push(`${relative}: metadata guide-id must be kebab-case`);
  else if (guideIds.has(id)) errors.push(`${relative}: duplicate guide-id ${id}`);
  else guideIds.add(id);
  checkGuide(errors, relative, { ...metadata, description: data.description });
  const capabilities = typeof metadata.capabilities === 'string' ? metadata.capabilities.split(/\s+/).filter(Boolean) : [];
  if (new Set(capabilities).size !== capabilities.length) errors.push(`${relative}: capabilities must be unique`);
  if (category === 'devices' && !capabilities.length) errors.push(`${relative}: device skills must list capabilities`);
}

function validateSkills(root, errors, guideIds) {
  const skillRoot = path.join(root, 'skills');
  const names = new Set();
  for (const category of directories(skillRoot)) {
    if (!categories.includes(category)) { errors.push(`skills/${category}: skill categories are ${categories.join(', ')}`); continue; }
    for (const name of directories(path.join(skillRoot, category))) {
      const relative = `skills/${category}/${name}/SKILL.md`;
      const file = path.join(skillRoot, category, name, 'SKILL.md');
      if (!kebab.test(name)) errors.push(`${relative}: skill names are kebab-case`);
      if (names.has(name)) errors.push(`${relative}: duplicate skill name ${name}`);
      names.add(name);
      if (!existsSync(file)) { errors.push(`${relative}: missing`); continue; }
      const data = frontmatter(readFileSync(file, 'utf8'));
      if (!data) errors.push(`${relative}: missing frontmatter`);
      else validateSkill(errors, relative, name, category, data, guideIds);
    }
  }
}

export function validate(root) {
  const errors = [];
  for (const stale of ['agent-skills', 'guides/skills']) {
    if (existsSync(path.join(root, stale))) errors.push(`${stale}/: retired layout; skills live in skills/<category>/<name>/SKILL.md`);
  }
  const guideIds = new Set();
  validateGuides(root, errors, guideIds);
  validateSkills(root, errors, guideIds);
  for (const file of [...files(root).filter(name => name.endsWith('.md') && !name.includes(`${path.sep}.git${path.sep}`))]) {
    const relative = path.relative(root, file).replaceAll('\\', '/');
    for (const link of relativeLinks(readFileSync(file, 'utf8'))) {
      let decoded = link;
      try { decoded = decodeURIComponent(link); } catch { /* keep the raw link */ }
      if (!existsSync(path.resolve(path.dirname(file), decoded))) errors.push(`${relative}: broken relative link ${link}`);
    }
  }
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const errors = validate(root);
  for (const error of errors) process.stderr.write(`${error}\n`);
  process.stdout.write(errors.length ? `${errors.length} problem(s) found.\n` : 'Docs tree is valid.\n');
  process.exitCode = errors.length ? 1 : 0;
}
