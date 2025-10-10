#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PACKAGES_DIR = path.join(ROOT, 'packages');

function resolveDocsChangelogPaths() {
  const arg = process.argv.find((value) => value.startsWith('--docs='));
  const argPath = arg ? valueFromFlag(arg, '--docs=') : null;
  const envDirectPath = process.env.DOCS_CHANGELOG_PATH || null;
  const envRepoPath = process.env.DOCS_REPO_PATH || null;

  const candidates = [];

  if (argPath) {
    candidates.push({ path: argPath, allowCreate: true });
  }

  if (envDirectPath) {
    candidates.push({ path: envDirectPath, allowCreate: true });
  }

  if (envRepoPath) {
    candidates.push({ path: path.join(envRepoPath, 'changelog.mdx'), allowCreate: false });
  }

  candidates.push({ path: path.resolve(ROOT, 'docs', 'changelog.mdx'), allowCreate: false });
  candidates.push({ path: path.resolve(ROOT, '..', 'docs-v2', 'changelog.mdx'), allowCreate: false });
  candidates.push({ path: path.resolve(ROOT, '..', 'naga-doc', 'changelog.mdx'), allowCreate: false });

  const resolved = [];
  const seen = new Set();

  for (const candidate of candidates) {
    if (!candidate || !candidate.path) {
      continue;
    }

    const absolute = path.isAbsolute(candidate.path) ? candidate.path : path.resolve(ROOT, candidate.path);
    if (seen.has(absolute)) {
      continue;
    }

    resolved.push({
      path: absolute,
      allowCreate: Boolean(candidate.allowCreate),
    });
    seen.add(absolute);
  }

  return resolved;
}

function valueFromFlag(flag, prefix) {
  return flag.slice(prefix.length);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function readLatestRelease(changelogPath) {
  const raw = await fs.readFile(changelogPath, 'utf8');
  const lines = raw.split(/\r?\n/);

  let version = null;
  const contentLines = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (version === null) {
      const match = line.match(/^##\s+([0-9][^\s]*)/);
      if (match) {
        version = match[1];
      }
      continue;
    }

    if (/^##\s+/.test(line)) {
      break;
    }

    contentLines.push(line);
  }

  if (!version) {
    return null;
  }

  while (contentLines.length && contentLines[0].trim() === '') {
    contentLines.shift();
  }
  while (contentLines.length && contentLines[contentLines.length - 1].trim() === '') {
    contentLines.pop();
  }

  return {
    version,
    content: contentLines.join('\n'),
  };
}

function escapeAttribute(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function sanitizeDescriptionText(text) {
  const commitPrefix = text.match(/^[a-f0-9]{7,}:\s+(.*)$/i);
  if (commitPrefix) {
    return commitPrefix[1].trim();
  }

  return text.trim();
}

function deriveDescription(content) {
  if (!content) {
    return null;
  }

  const lines = content.split('\n');

  for (const line of lines) {
    if (/^###\s+/.test(line.trim())) {
      continue;
    }

    const match = line.match(/^\s*-\s+(.*)$/);
    if (match) {
      const candidate = sanitizeDescriptionText(match[1].replace(/\s*\[[^\]]+\]\s*$/, ''));
      if (candidate) {
        return candidate;
      }
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^###\s+/.test(trimmed)) {
      continue;
    }

    if (trimmed) {
      return sanitizeDescriptionText(trimmed.replace(/\s*\[[^\]]+\]\s*$/, ''));
    }
  }

  return null;
}

function normalizeBulletContent(text) {
  let normalized = text.trim();
  normalized = normalized.replace(/^[a-f0-9]{7,}:\s*/i, '');
  normalized = normalized.replace(/\s*\[[a-f0-9-]{7,}\]\s*/gi, ' ');
  normalized = normalized.replace(/\s{2,}/g, ' ');
  return normalized.trim();
}

function parseReleaseSections(content) {
  if (!content) {
    return [];
  }

  const sections = [];
  let current = null;

  const flushSection = () => {
    if (current && current.items.length > 0) {
      sections.push(current);
    }
    current = null;
  };

  const lines = content.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      continue;
    }

    const headingMatch = line.match(/^###\s+(.*)$/);
    if (headingMatch) {
      flushSection();
      current = { title: headingMatch[1].trim(), items: [] };
      continue;
    }

    const bulletMatch = line.match(/^\s*-\s+(.*)$/);
    if (bulletMatch) {
      if (!current) {
        current = { title: 'Highlights', items: [] };
      }

      current.items.push(normalizeBulletContent(bulletMatch[1]));
      continue;
    }

    const text = normalizeBulletContent(line);
    if (text) {
      if (!current) {
        current = { title: 'Highlights', items: [] };
      }
      current.items.push(text);
    }
  }

  flushSection();

  return sections;
}

function buildUpdateBody(sections) {
  const lines = [];

  for (const section of sections) {
    if (!section.items.length) {
      continue;
    }

    lines.push(`  ## ${section.title}`);
    lines.push('');
    for (const item of section.items) {
      lines.push(`  - ${item}`);
    }
    lines.push('');
  }

  while (lines.length && lines[lines.length - 1] === '') {
    lines.pop();
  }

  if (!lines.length) {
    return '  No release notes available.';
  }

  return lines.join('\n');
}

function buildTagsLiteral(sections) {
  const tags = [];

  for (const section of sections) {
    if (section.items.length && !tags.includes(section.title)) {
      tags.push(section.title);
    }
  }

  if (!tags.length) {
    tags.push('Release');
  }

  const literal = `[${tags.map((tag) => JSON.stringify(tag)).join(', ')}]`;
  return literal;
}

function buildUpdateId(packageName) {
  const trimmed = packageName.replace(/^@lit-protocol\//, '');
  return slugify(trimmed);
}

function escapeTableCell(value) {
  return value.replace(/\|/g, '\\|');
}

function buildSummaryTable(updates) {
  const header = '| Package | Latest version | Summary |';
  const separator = '| ------- | -------------- | ------- |';

  if (!updates.length) {
    return [header, separator, '| _No packages found_ | - | - |'].join('\n');
  }

  const rows = updates.map((update) => {
    const summary = update.summary || '-';
    const npmUrl = `https://www.npmjs.com/package/${encodeURIComponent(update.packageName)}`;
    const packageLink = `[${update.packageName}](#${update.anchorId})`;
    const versionLink = `[${escapeTableCell(update.version)}](${npmUrl})`;
    return `| ${packageLink} | ${versionLink} | ${escapeTableCell(summary)} |`;
  });

  return [header, separator, ...rows].join('\n');
}

async function main() {
  const candidateDocsPaths = resolveDocsChangelogPaths();
  let target = null;

  const preferredCandidate = candidateDocsPaths.find((candidate) => candidate.allowCreate) || null;
  if (preferredCandidate) {
    target = preferredCandidate;
    if (!(await fileExists(target.path))) {
      await fs.mkdir(path.dirname(target.path), { recursive: true });
    }
  } else {
    for (const candidate of candidateDocsPaths) {
      if (await fileExists(candidate.path)) {
        target = candidate;
        break;
      }
    }
  }

  if (!target) {
    console.error('Unable to locate docs changelog. Checked:');
    for (const candidate of candidateDocsPaths) {
      console.error(` - ${candidate.path}`);
    }
    process.exit(1);
  }
  const targetPath = target.path;

  const packageEntries = await fs.readdir(PACKAGES_DIR, { withFileTypes: true });
  const packageDirs = packageEntries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();

  const updates = [];

  for (const pkgDir of packageDirs) {
    const changelogPath = path.join(PACKAGES_DIR, pkgDir, 'CHANGELOG.md');
    if (!(await fileExists(changelogPath))) {
      continue;
    }

    const latest = await readLatestRelease(changelogPath);
    if (!latest) {
      continue;
    }

    const packageJsonPath = path.join(PACKAGES_DIR, pkgDir, 'package.json');
    let packageName = pkgDir;
    if (await fileExists(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
        if (typeof packageJson.name === 'string' && packageJson.name.trim()) {
          packageName = packageJson.name.trim();
        }
      } catch (error) {
        console.warn(`Unable to read package name from ${packageJsonPath}: ${error.message}`);
      }
    }

    const sections = parseReleaseSections(latest.content);
    const labelText = `${packageName.replace('@lit-protocol/', '')}`;
    const label = escapeAttribute(labelText);
    let descriptionText = null;
    for (const section of sections) {
      if (section.items.length) {
        descriptionText = section.items[0];
        break;
      }
    }

    if (!descriptionText) {
      descriptionText = deriveDescription(latest.content);
    }

    const summary = descriptionText || '-';
    const rssTitleLiteral = JSON.stringify(labelText);
    const rssDescriptionLiteral = JSON.stringify(descriptionText || 'No release notes provided yet.');
    const descriptionLiteral = JSON.stringify(`v${latest.version}`);
    const id = buildUpdateId(packageName);
    const bodyContent = buildUpdateBody(sections);
    const tagsLiteral = buildTagsLiteral(sections);

    const block = [
      '<Update',
      `  label="${label}"`,
      `  description=${descriptionLiteral}`,
      `  tags={${tagsLiteral}}`,
      `  rss={{ title: ${rssTitleLiteral}, description: ${rssDescriptionLiteral} }}`,
      `  id="${id}"`,
      '>',
      '',
      bodyContent,
      '</Update>',
    ].join('\n');

    updates.push({
      packageName,
      packageDir: pkgDir,
      version: latest.version,
      summary,
      anchorId: id,
      block,
    });
  }

  const priorityNames = [
    '@lit-protocol/lit-client',
    '@lit-protocol/auth',
    '@lit-protocol/networks',
    '@lit-protocol/auth-services',
  ];
  const priorityDirs = ['lit-client', 'auth', 'networks', 'auth-services'];

  const getPriorityIndex = (pkgName, pkgDir) => {
    const byName = priorityNames.indexOf(pkgName);
    if (byName !== -1) {
      return byName;
    }
    const byDir = priorityDirs.indexOf(pkgDir);
    if (byDir !== -1) {
      return byDir;
    }
    return priorityNames.length + priorityDirs.length;
  };

  updates.sort((a, b) => {
    const aPriority = getPriorityIndex(a.packageName, a.packageDir);
    const bPriority = getPriorityIndex(b.packageName, b.packageDir);
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    return a.packageName.localeCompare(b.packageName);
  });

  const frontMatter = [
    '---',
    'title: "Changelog"',
    'description: "Keep track of changes and updates across the Lit JS SDK packages"',
    'rss: true',
    '---',
  ].join('\n');

  let body = '*No release notes available.*';
  if (updates.length > 0) {
    body = updates.map((item) => item.block).join('\n\n');
  }

  const summaryTable = buildSummaryTable(updates);
  const output = `${frontMatter}\n\n${summaryTable}\n\n${body}\n`;

  await fs.writeFile(targetPath, output, 'utf8');
  console.log(`Updated docs changelog at ${targetPath} with ${updates.length} package releases.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
