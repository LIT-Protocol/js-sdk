/* eslint-disable */
export default {
  "displayName": "uint8arrays",
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
  "coverageDirectory": "../../coverage/packages/uint8arrays",
  "setupFilesAfterEnv": [
    "../../jest.setup.js"
  ]
}