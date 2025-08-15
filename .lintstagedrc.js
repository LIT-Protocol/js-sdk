module.exports = {
  '*.{ts,tsx,cjs,js}': (files) => {
    const filteredFiles = files.filter((file) => !file.includes('generated'));
    return filteredFiles.length > 0
      ? [
          `prettier --write ${filteredFiles.join(' ')}`,
          `eslint --fix ${filteredFiles.join(' ')}`,
        ]
      : [];
  },
  '*.{json,md}': (files) => {
    const filteredFiles = files.filter((file) => !file.includes('generated'));
    return filteredFiles.length > 0
      ? `prettier --write ${filteredFiles.join(' ')}`
      : [];
  },
};
