/* eslint-disable */
export default {
  "displayName": "constants",
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
  "coverageDirectory": "../../coverage/packages/constants",
  "setupFilesAfterEnv": [
    "../../jest.setup.js"
  ]
}