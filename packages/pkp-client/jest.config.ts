/* eslint-disable */
export default {
  "displayName": "pkp-client",
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
  "coverageDirectory": "../../coverage/packages/pkp-client",
  "setupFilesAfterEnv": [
    "../../jest.setup.js"
  ]
}