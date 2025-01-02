import fs from 'fs';
import path from 'path';

describe('Version Check', () => {
  it('checks @lit-protocol/uint8arrays version is 8.0.0', () => {
    const distPkgPath = path.join(
      __dirname,
      '../../dist/packages/uint8arrays/package.json'
    );
    const distPkg = JSON.parse(fs.readFileSync(distPkgPath, 'utf8'));
    expect(distPkg.version).toBe('8.0.0');
  });

  it('verifies other packages maintain their versions', () => {
    const uint8arraysPath = path.join(
      __dirname,
      '../../dist/packages/uint8arrays/package.json'
    );
    const uint8arraysPkg = JSON.parse(fs.readFileSync(uint8arraysPath, 'utf8'));

    // Check that dependencies maintain their original versions
    expect(uint8arraysPkg.dependencies['@lit-protocol/constants']).toBe(
      '7.0.4'
    );
    expect(uint8arraysPkg.dependencies['@lit-protocol/types']).toBe('7.0.4');
  });
});
