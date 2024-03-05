"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uint8arrayToString = exports.uint8arrayFromString = exports.blobToBase64String = exports.base64StringToBlob = exports.humanizeAccessControlConditions = exports.hashResourceIdForSigning = exports.zipAndEncryptString = exports.zipAndEncryptFiles = exports.verifyJwt = exports.encryptZip = exports.encryptToIpfs = exports.encryptString = exports.encryptFileAndZipWithMetadata = exports.encryptFile = exports.decryptFromIpfs = exports.decryptZipFileWithMetadata = exports.decryptToZip = exports.decryptToString = exports.decryptToFile = void 0;
const tslib_1 = require("tslib");
const misc_1 = require("@lit-protocol/misc");
const _LitNodeClientNodeJs = require("./lib/lit-node-client-nodejs");
// ==================== Environment ====================
if ((0, misc_1.isNode)()) {
    (0, misc_1.log)('Oh hey you are running in Node.js!');
    const fetch = require('node-fetch');
    globalThis.fetch = fetch;
}
const LitNodeClientNodeJs = _LitNodeClientNodeJs.LitNodeClientNodeJs;
if (!globalThis.LitNodeClientNodeJs) {
    globalThis.LitNodeClientNodeJs = LitNodeClientNodeJs;
}
// ==================== Exports ====================
tslib_1.__exportStar(require("./lib/lit-node-client-nodejs"), exports);
var encryption_1 = require("@lit-protocol/encryption");
Object.defineProperty(exports, "decryptToFile", { enumerable: true, get: function () { return encryption_1.decryptToFile; } });
Object.defineProperty(exports, "decryptToString", { enumerable: true, get: function () { return encryption_1.decryptToString; } });
Object.defineProperty(exports, "decryptToZip", { enumerable: true, get: function () { return encryption_1.decryptToZip; } });
Object.defineProperty(exports, "decryptZipFileWithMetadata", { enumerable: true, get: function () { return encryption_1.decryptZipFileWithMetadata; } });
Object.defineProperty(exports, "decryptFromIpfs", { enumerable: true, get: function () { return encryption_1.decryptFromIpfs; } });
Object.defineProperty(exports, "encryptFile", { enumerable: true, get: function () { return encryption_1.encryptFile; } });
Object.defineProperty(exports, "encryptFileAndZipWithMetadata", { enumerable: true, get: function () { return encryption_1.encryptFileAndZipWithMetadata; } });
Object.defineProperty(exports, "encryptString", { enumerable: true, get: function () { return encryption_1.encryptString; } });
Object.defineProperty(exports, "encryptToIpfs", { enumerable: true, get: function () { return encryption_1.encryptToIpfs; } });
Object.defineProperty(exports, "encryptZip", { enumerable: true, get: function () { return encryption_1.encryptZip; } });
Object.defineProperty(exports, "verifyJwt", { enumerable: true, get: function () { return encryption_1.verifyJwt; } });
Object.defineProperty(exports, "zipAndEncryptFiles", { enumerable: true, get: function () { return encryption_1.zipAndEncryptFiles; } });
Object.defineProperty(exports, "zipAndEncryptString", { enumerable: true, get: function () { return encryption_1.zipAndEncryptString; } });
var access_control_conditions_1 = require("@lit-protocol/access-control-conditions");
Object.defineProperty(exports, "hashResourceIdForSigning", { enumerable: true, get: function () { return access_control_conditions_1.hashResourceIdForSigning; } });
Object.defineProperty(exports, "humanizeAccessControlConditions", { enumerable: true, get: function () { return access_control_conditions_1.humanizeAccessControlConditions; } });
var misc_browser_1 = require("@lit-protocol/misc-browser");
Object.defineProperty(exports, "base64StringToBlob", { enumerable: true, get: function () { return misc_browser_1.base64StringToBlob; } });
Object.defineProperty(exports, "blobToBase64String", { enumerable: true, get: function () { return misc_browser_1.blobToBase64String; } });
var uint8arrays_1 = require("@lit-protocol/uint8arrays");
Object.defineProperty(exports, "uint8arrayFromString", { enumerable: true, get: function () { return uint8arrays_1.uint8arrayFromString; } });
Object.defineProperty(exports, "uint8arrayToString", { enumerable: true, get: function () { return uint8arrays_1.uint8arrayToString; } });
// ----- autogen:polyfills:start  -----
//
// ----- autogen:polyfills:end  -----
//# sourceMappingURL=index.js.map