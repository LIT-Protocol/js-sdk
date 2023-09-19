/* eslint-disable */
export default {
  "displayName": "crypto",
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
  "coverageDirectory": "../../coverage/packages/crypto",
  "setupFilesAfterEnv": [
    "../../jest.setup.js"
  ]
}