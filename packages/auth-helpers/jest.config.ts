/* eslint-disable */
export default {
  "displayName": "auth-helpers",
  "preset": "ts-jest",
  "globals": {
    "ts-jest": {
      "tsconfig": "<rootDir>/tsconfig.spec.json"
    }
  },
  "transform": {
    "^.+\\.[tj]s$": "ts-jest"
  },
  "moduleFileExtensions": [
    "ts",
    "js",
    "html"
  ],
  "coverageDirectory": "../../coverage/packages/auth-helpers",
  "setupFilesAfterEnv": [
    "../../jest.setup.js"
  ]
}