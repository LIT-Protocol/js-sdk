/* eslint-disable */
export default {
  "displayName": "pkp-cosmos",
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
  "coverageDirectory": "../../coverage/packages/pkp-cosmos",
  "setupFilesAfterEnv": [
    "../../jest.setup.js"
  ]
}