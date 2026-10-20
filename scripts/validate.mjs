#!/usr/bin/env node
// Validates the exported Port OS docs tree: guide frontmatter, agent skills and relative links.
// Copied to scripts/validate.mjs in the public docs repository. Uses only Node built-ins.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const authorships = ['HUMAN', 'AI', 'HUMAN_MIXED_WITH_AI'];
const groups = ['skills/general', 'skills/devices', 'oauth', 'connect-ai', 'api'];
const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function files(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? files(full) : [full];
  });
}

function scalar(text) {
  const value = text.trim();
  if (value.startsWith('"')) return JSON.parse(value);
  if (value.startsWith("'")) return value.slice(1, -1).replaceAll("''", "'");
  return value;
}

// Reads the small YAML subset the docs use: scalars, folded text and string lists.
export function frontmatter(source) {
  const match = source.replaceAll('\r\n', '\n').match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;
  const data = {};
  const lines = match[1].split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const field = lines[index].match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!field) continue;
    const [, key, rest] = field;
    if (/^[>|][-+]?$/.test(rest)) {
      const block = [];
      while (index + 1 < lines.length && /^\s+\S/.test(lines[index + 1])) block.push(lines[++index].trim());
      data[key] = block.join(' ');
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

export function validate(root) {
  const errors = [];
  const guideIds = new Set();
  const skillIds = new Set();
  const guideRoot = path.join(root, 'guides');
  for (const file of files(guideRoot).filter(name => name.endsWith('.md'))) {
    const relative = path.relative(root, file).replaceAll('\\', '/');
    const group = path.relative(guideRoot, path.dirname(file)).replaceAll('\\', '/');
    const source = readFileSync(file, 'utf8');
    const data = frontmatter(source);
    if (!data) { errors.push(`${relative}: missing frontmatter`); continue; }
    const id = path.basename(file, '.md');
    if (!groups.includes(group)) errors.push(`${relative}: guides belong in one of ${groups.join(', ')}`);
    if (data['guide-id'] !== id) errors.push(`${relative}: guide-id must equal the file name (${id})`);
    if (guideIds.has(id)) errors.push(`${relative}: duplicate guide-id ${id}`);
    guideIds.add(id);
    if (!data.title) errors.push(`${relative}: missing title`);
    if (!data.description) errors.push(`${relative}: missing description`);
    if (!authorships.includes(data['content-authorship'])) errors.push(`${relative}: content-authorship must be one of ${authorships.join(', ')}`);
    if (group.startsWith('skills/')) {
      if (!kebab.test(data['skill-id'] ?? '')) errors.push(`${relative}: guides under skills/ need a kebab-case skill-id`);
      else if (skillIds.has(data['skill-id'])) errors.push(`${relative}: duplicate skill-id ${data['skill-id']}`);
      else skillIds.add(data['skill-id']);
    }
    if (group === 'skills/devices' && !(data.capabilities?.length > 0)) errors.push(`${relative}: device guides must list capabilities`);
    if (data.capabilities !== undefined && (!Array.isArray(data.capabilities) || new Set(data.capabilities).size !== data.capabilities.length)) errors.push(`${relative}: capabilities must be a list of unique names`);
  }
  for (const id of skillIds) {
    if (!existsSync(path.join(root, 'agent-skills', id, 'SKILL.md'))) errors.push(`agent-skills/${id}/SKILL.md: missing skill for a guide`);
  }
  const skillRoot = path.join(root, 'agent-skills');
  for (const entry of existsSync(skillRoot) ? readdirSync(skillRoot, { withFileTypes: true }).filter(item => item.isDirectory()) : []) {
    const relative = `agent-skills/${entry.name}/SKILL.md`;
    const file = path.join(skillRoot, entry.name, 'SKILL.md');
    if (!existsSync(file)) { errors.push(`${relative}: missing`); continue; }
    const data = frontmatter(readFileSync(file, 'utf8'));
    if (!data) errors.push(`${relative}: missing frontmatter`);
    else {
      if (data.name !== entry.name) errors.push(`${relative}: name must equal the directory name (${entry.name})`);
      if (!data.description) errors.push(`${relative}: missing description`);
    }
  }
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
