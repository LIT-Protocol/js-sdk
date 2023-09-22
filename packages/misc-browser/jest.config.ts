/* eslint-disable */
export default {
  "displayName": "misc-browser",
  "preset": "../../jest.preset.js",
  "globals": {
    "ts-jest": {
      "tsconfig": "<rootDir>/tsconfig.spec.json"
    }
  },
  "transform": {
    "^.+\\.[t]s$": "ts-jest"
  },
  "moduleFileExtensions": [
    "ts",
    "js",
    "html"
  ],
  "coverageDirectory": "../../coverage/packages/misc-browser",
  "setupFilesAfterEnv": [
    "../../jest.setup.js"
  ]
}