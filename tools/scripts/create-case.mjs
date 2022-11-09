import fs from 'fs';
import { exit } from 'process';
import { getArgs, getFiles, redLog } from './utils.mjs';

// ---------- Configuration ----------
const TARGET_DIR = './apps/example-nextjs-js/pages/cases/';
const TEMPLATE_FILE = TARGET_DIR + 'CASE_XXX_TEMPLATE.ts';
const OUTPUT_FILE = './apps/example-nextjs-js/pages/test-cases.ts';

const args = getArgs();

if (args.length < 1) {
    redLog('Usage: node tools/scripts/create-case.mjs <case-name> <flag>');
    exit();
}

const flag = args[1];

const files = await getFiles(TARGET_DIR);

let nextCase;

files.forEach((file, i) => {
    if ( file.includes('CASE') && ! file.includes('XXX') ) {

        const caseNumber = file.split('_');
        const caseNumberInt = parseInt(caseNumber[1]);

        if ( files.length >= i - 1 ) {
            nextCase = caseNumberInt + 1;
        }
    }
})

let nextCaseString;

// prepend one zero to the case number if it's less than 100, or prepend two zeros to the case number if it's less than 10
if ( nextCase < 10 ) {
    nextCaseString = '00' + nextCase;
} else if ( nextCase < 100 ) {
    nextCaseString = '0' + nextCase;
} else {
    nextCaseString = nextCase;
}

// prepend nextcase string with "CASE_"
nextCaseString = 'CASE_' + nextCaseString + '_';

let caseName = nextCaseString + args[0];
// turn caename to uppercase and replace spaces with underscores
caseName = caseName.toUpperCase().replace(/ /g, '_');

// console.log(caseName);
// exit();
// read the template file
const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

// replace the case name in the template
const newCase = template.replace(/CASE_XXX_TEMPLATE/g, caseName);

// write the new case file
if ( flag === '--dry-run' ) {
    console.log(newCase);
}else{
    fs.writeFileSync(TARGET_DIR + caseName + '.ts', newCase);
}

const newFiles = await getFiles(TARGET_DIR);

// const importTemplate = `import ${caseName} from './cases/${caseName}';`;

const importTemplates = [];

newFiles.forEach((file) => {
    if ( file.includes('CASE') && ! file.includes('XXX') ) {
        importTemplates.push(`import {\n ${file.split('.')[0] }\n} from './cases/${file.split('.')[0]}'`);
    }
})

const exportTemplates = [];

newFiles.forEach((file) => {
    if ( file.includes('CASE') && ! file.includes('XXX') ) {
        exportTemplates.push(`...${file.split('.')[0]}`);
    }
})
const exportTemplate = `\n\nexport const testCases = [
${exportTemplates.join(',\n')}
]`;

// join import templates
const importTemplate = importTemplates.join(';\n\n');
// console.log(importTemplate);
// console.log(exportTemplate)

// combine import and export templates
const indexFile = importTemplate + '' + exportTemplate;

// write the index file
if( flag === '--dry-run' ) {
    console.log(indexFile);
}else{
    fs.writeFileSync(OUTPUT_FILE, indexFile);
}

exit();