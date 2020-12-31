"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalize = exports.compile = exports.version = void 0;
const package_json_1 = __importDefault(require("../package.json"));
exports.version = package_json_1.default.version;
var compile_1 = require("./compile/compile");
Object.defineProperty(exports, "compile", { enumerable: true, get: function () { return compile_1.compile; } });
var normalize_1 = require("./normalize");
Object.defineProperty(exports, "normalize", { enumerable: true, get: function () { return normalize_1.normalize; } });
__exportStar(require("./util"), exports);
//# sourceMappingURL=index.js.map