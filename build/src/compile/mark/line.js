"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trail = exports.line = void 0;
const encode = __importStar(require("./encode"));
exports.line = {
    vgMark: 'line',
    encodeEntry: (model) => {
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, encode.baseEncodeEntry(model, {
            align: 'ignore',
            baseline: 'ignore',
            color: 'include',
            size: 'ignore',
            orient: 'ignore',
            theta: 'ignore'
        })), encode.pointPosition('x', model, { defaultPos: 'mid' })), encode.pointPosition('y', model, { defaultPos: 'mid' })), encode.nonPosition('size', model, {
            vgChannel: 'strokeWidth' // VL's line size is strokeWidth
        })), encode.defined(model));
    }
};
exports.trail = {
    vgMark: 'trail',
    encodeEntry: (model) => {
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, encode.baseEncodeEntry(model, {
            align: 'ignore',
            baseline: 'ignore',
            color: 'include',
            size: 'include',
            orient: 'ignore',
            theta: 'ignore'
        })), encode.pointPosition('x', model, { defaultPos: 'mid' })), encode.pointPosition('y', model, { defaultPos: 'mid' })), encode.nonPosition('size', model)), encode.defined(model));
    }
};
//# sourceMappingURL=line.js.map