// @ts-nocheck
import { LIT_ERROR } from './errors';

describe('Lit Errors have correct format', () => {
  it('returns correct format', () => {
    Object.entries(LIT_ERROR).forEach((entry) => {
      const errorPropName = entry[0];
      const errorName = entry[1].name;
      const errorCode = entry[1].code;

      let expectedErrorName = errorPropName.toLowerCase();
      let expectedErrorCode = errorPropName.toLowerCase();

      expectedErrorName = expectedErrorName.split('_').map((section) => {
        let chars = [];

        section = section.split('').forEach((c, i) => {
          if (i == 0) {
            chars.push(c.toUpperCase());
          } else {
            chars.push(c);
          }
        });

        return chars.join('', '');
      });

      expectedErrorName = expectedErrorName.join('');

      expect(errorName).toBe(expectedErrorName);
      // expect(errorCode).toBe(expectedErrorCode);
    });
  });
  it('returns correct format', () => {
    Object.entries(LIT_ERROR).forEach((entry) => {
      const errorPropName = entry[0];
      const errorName = entry[1].name;
      const errorCode = entry[1].code;

      let expectedErrorName = errorPropName.toLowerCase();
      let expectedErrorCode = errorPropName.toLowerCase();

      expectedErrorName = expectedErrorName.split('_').map((section) => {
        let chars = [];

        section = section.split('').forEach((c, i) => {
          if (i == 0) {
            chars.push(c.toUpperCase());
          } else {
            chars.push(c);
          }
        });

        return chars.join('', '');
      });

      expectedErrorName = expectedErrorName.join('');

      // expect(errorName).toBe(expectedErrorName)
      expect(errorCode).toBe(expectedErrorCode);
    });
  });
});
