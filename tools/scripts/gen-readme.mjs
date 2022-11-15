// #Usage: node tools/scripts/gen-readme.mjs

// Read the file and replace between <!-- package:start -->
// and <!-- package:end --> with the package.json content
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { listDirsRelative } from './utils.mjs';

const readmePath = join('README.md');
const readme = readFileSync(readmePath, 'utf8');

const libs = (await listDirsRelative('packages', false)).map(lib => lib.replace('packages/', ''));

// create rows to array
const rows = libs.map(lib => {
    const pkg = JSON.parse(readFileSync(`packages/${lib}/package.json`, 'utf8'));
    const { name, description, version, tags } = pkg;
    return `| [${name}](packages/${lib}) | ${tags?.join(', ')} | ${version} |`;
});

const tables = {
    "headers": ["Package", "Tags", "Version"],
    "rows": rows
}

// make table to github markdown
const table = (tables) => {
    const { headers, rows } = tables;
    const header = headers.join(" | ");
    const divider = headers.map(() => "---").join(" | ");
    const body = rows.join('\n')
    return `
${header}
${divider}
${body}
`;
}


let content = table(tables);

// use regex to replace the content between the comments <!-- package:start --> and <!-- package:end -->
const newReadme = readme.replace(
    /<!-- package:start -->[\s\S]*<!-- package:end -->/m,
    `<!-- package:start -->\n${content}\n<!-- package:end -->`
);

// console.log(newReadme);

writeFileSync
    (readmePath, newReadme, 'utf8');
