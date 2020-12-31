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
exports.text = void 0;
const common_1 = require("../common");
const encode = __importStar(require("./encode"));
exports.text = {
    vgMark: 'text',
    encodeEntry: (model) => {
        const { config, encoding } = model;
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, encode.baseEncodeEntry(model, {
            align: 'include',
            baseline: 'include',
            color: 'include',
            size: 'ignore',
            orient: 'ignore',
            theta: 'include'
        })), encode.pointPosition('x', model, { defaultPos: 'mid' })), encode.pointPosition('y', model, { defaultPos: 'mid' })), encode.text(model)), encode.nonPosition('size', model, {
            vgChannel: 'fontSize' // VL's text size is fontSize
        })), encode.nonPosition('angle', model)), encode.valueIfDefined('align', align(model.markDef, encoding, config))), encode.valueIfDefined('baseline', baseline(model.markDef, encoding, config))), encode.pointPosition('radius', model, { defaultPos: null, isMidPoint: true })), encode.pointPosition('theta', model, { defaultPos: null, isMidPoint: true }));
    }
};
function align(markDef, encoding, config) {
    const a = common_1.getMarkPropOrConfig('align', markDef, config);
    if (a === undefined) {
        return 'center';
    }
    // If there is a config, Vega-parser will process this already.
    return undefined;
}
function baseline(markDef, encoding, config) {
    const b = common_1.getMarkPropOrConfig('baseline', markDef, config);
    if (b === undefined) {
        return 'middle';
    }
    // If there is a config, Vega-parser will process this already.
    return undefined;
}
//# sourceMappingURL=text.js.map