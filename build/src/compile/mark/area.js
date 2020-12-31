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
exports.area = void 0;
const encode = __importStar(require("./encode"));
exports.area = {
    vgMark: 'area',
    encodeEntry: (model) => {
        return Object.assign(Object.assign(Object.assign(Object.assign({}, encode.baseEncodeEntry(model, {
            align: 'ignore',
            baseline: 'ignore',
            color: 'include',
            orient: 'include',
            size: 'ignore',
            theta: 'ignore'
        })), encode.pointOrRangePosition('x', model, {
            defaultPos: 'zeroOrMin',
            defaultPos2: 'zeroOrMin',
            range: model.markDef.orient === 'horizontal'
        })), encode.pointOrRangePosition('y', model, {
            defaultPos: 'zeroOrMin',
            defaultPos2: 'zeroOrMin',
            range: model.markDef.orient === 'vertical'
        })), encode.defined(model));
    }
};
//# sourceMappingURL=area.js.map