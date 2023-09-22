/* eslint-disable */
export default {
  "displayName": "bls-sdk",
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
  "coverageDirectory": "../../coverage/packages/bls-sdk",
  "setupFilesAfterEnv": [
    "../../jest.setup.js"
  ]
}