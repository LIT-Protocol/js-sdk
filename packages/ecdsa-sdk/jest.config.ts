/* eslint-disable */
export default {
  "displayName": "ecdsa-sdk",
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
  "coverageDirectory": "../../coverage/packages/ecdsa-sdk",
  "setupFilesAfterEnv": [
    "../../jest.setup.js"
  ]
}