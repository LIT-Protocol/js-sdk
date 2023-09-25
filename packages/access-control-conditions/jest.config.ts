/* eslint-disable */
export default {
  "displayName": "access-control-conditions",
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
  "coverageDirectory": "../../coverage/packages/access-control-conditions",
  "setupFilesAfterEnv": [
    "../../jest.setup.js"
  ]
}