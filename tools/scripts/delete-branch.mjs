import readline from 'readline';
import { exec } from 'child_process';

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

let branches = [];
let currentIndex = 0;

const getBranches = () => {
  return new Promise((resolve, reject) => {
    exec('git branch', (err, stdout, stderr) => {
      if (err) {
        reject(stderr);
      } else {
        resolve(stdout.split('\n').filter(Boolean));
      }
    });
  });
};

const renderBranches = () => {
  console.clear();
  branches.forEach((branch, index) => {
    const prefix = index === currentIndex ? '> ' : '  ';
    console.log(`${prefix}${branch}`);
  });
};

const deleteBranch = (branchName) => {
  exec(`git branch -d ${branchName}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error: ${stderr}`);
    } else {
      console.log(`Deleted branch: ${branchName}`);
    }
  });
};

process.stdin.on('keypress', (str, key) => {
  if (key.name === 'up') {
    currentIndex = (currentIndex - 1 + branches.length) % branches.length;
    renderBranches();
  } else if (key.name === 'down') {
    currentIndex = (currentIndex + 1) % branches.length;
    renderBranches();
  } else if (key.name === 'space') {
    deleteBranch(branches[currentIndex].trim());
    branches.splice(currentIndex, 1);
    currentIndex %= branches.length;
    renderBranches();
  } else if (key.name === 'c' && key.ctrl) {
    process.exit();
  }
});

getBranches()
  .then((br) => {
    branches = br;
    renderBranches();
  })
  .catch((err) => console.error(err));
