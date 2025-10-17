/**
 * Generated Exports
 * This file is auto-generated. DO NOT EDIT UNLESS YOU KNOW WHAT YOU'RE DOING.
 */

// Define lazy getters so requiring the CJS root does not eagerly load all ABIs
function __defineLazy(target, key, getter) {
  Object.defineProperty(target, key, { enumerable: true, configurable: true, get: getter });
}

const __exports = {};

__defineLazy(__exports, "datil", () => require("./prod/datil.cjs"));
__defineLazy(__exports, "datilDev", () => require("./prod/datil-dev.cjs"));
__defineLazy(__exports, "datilTest", () => require("./prod/datil-test.cjs"));
__defineLazy(__exports, "nagaDev", () => require("./prod/naga-dev.cjs"));
__defineLazy(__exports, "nagaTest", () => require("./prod/naga-test.cjs"));
__defineLazy(__exports, "nagaStaging", () => require("./prod/naga-staging.cjs"));
__defineLazy(__exports, "develop", () => require("./dev/develop.cjs"));

__defineLazy(__exports, "datilSignatures", () => require("./signatures/datil.cjs").signatures);
__defineLazy(__exports, "datilDevSignatures", () => require("./signatures/datil-dev.cjs").signatures);
__defineLazy(__exports, "datilTestSignatures", () => require("./signatures/datil-test.cjs").signatures);
__defineLazy(__exports, "nagaDevSignatures", () => require("./signatures/naga-dev.cjs").signatures);
__defineLazy(__exports, "nagaTestSignatures", () => require("./signatures/naga-test.cjs").signatures);
__defineLazy(__exports, "nagaStagingSignatures", () => require("./signatures/naga-staging.cjs").signatures);
__defineLazy(__exports, "developSignatures", () => require("./signatures/develop.cjs").signatures);

module.exports = __exports;
