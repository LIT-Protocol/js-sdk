// #Usage: node tools/scripts/gen-readme.mjs

// Read the file and replace between <!-- autogen:package:start -->
// and <!-- autogen:package:end --> with the package.json content
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { exit } from 'process';
import { listDirsRelative } from './utils.mjs';

const readmePath = join('README.md');
const readme = readFileSync(readmePath, 'utf8');

const badge = (lib, text) => {

    let color = 'orange';

    if (text === 'universal') {
        color = '8A6496';
    }
    if (text === 'bundled') {
        color = '17224B';
    }
    if (text === 'browser') {
        color = 'E98869';
    }

    return `![${lib}](https://img.shields.io/badge/-${text}-${color} "${lib}")`;
}

const CDNLink = (lib) => {
    return `<a href="https://unpkg.com/${lib}-vanilla/${lib.split('/')[1]}.js">Vanilla JS</a>`;
    return `<a target="_blank" href="https://www.jsdelivr.com/package/npm/${lib}-vanilla">Vanilla JS</a>`;
    return `[![](https://data.jsdelivr.com/v1/package/npm/${lib}-vanilla/badge)](https://www.jsdelivr.com/package/npm/${lib}-vanilla)`;
}

const getSize = (lib) => {
    return `![](https://img.shields.io/bundlephobia/min/${lib})`;
};

const getNpm = (lib) => {
    return `<a target="_blank" href="https://www.npmjs.com/package/${lib}">npm</a>`;
    return `<a href="https://www.npmjs.com/package/${lib}"><img src="https://img.shields.io/npm/dw/${lib}?label=NPM"/></a>`;
}

const libs = (await listDirsRelative('packages', false)).map(lib => lib.replace('packages/', ''));

// create rows to array
let universals = [];
let browsers = [];
let bundled = [];

libs.map(lib => {
    const pkg = JSON.parse(readFileSync(`packages/${lib}/package.json`, 'utf8'));
    const { name, description, version, tags } = pkg;

    const _package = `[${name}](packages/${lib})`;
    const _vanillaJs = CDNLink(name);
    const _tag = badge(lib, tags[0]);
    const _version = version;
    // const _size = getSize(name);
    const _download = `${getNpm(name)}<br/>${_vanillaJs}`;

    const content = `| ${_package} | ${_tag} | ${_version} | ${_download}`;

    if (tags[0] === 'universal') {
        universals.push(content);
    }
    if (tags[0] === 'browser') {
        browsers.push(content);
    }
    if (tags[0] === 'bundled') {
        bundled.push(content);
    }
});

let rows = [...bundled, ...universals, ...browsers,];

const tables = {
    "headers": ["Package", "Category", "Version", "Download"],
    "rows": rows
}

console.log(rows);

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

// use regex to replace the content between the comments <!-- autogen:package:start --> and <!-- autogen:package:end -->
const newReadme = readme.replace(
    /<!-- autogen:package:start -->[\s\S]*<!-- autogen:package:end -->/m,
    `<!-- autogen:package:start -->\n${content}\n<!-- autogen:package:end -->`
);

// console.log(newReadme);

writeFileSync
    (readmePath, newReadme, 'utf8');

    exit();