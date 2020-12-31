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
exports.rule = void 0;
const encode = __importStar(require("./encode"));
exports.rule = {
    vgMark: 'rule',
    encodeEntry: (model) => {
        const { markDef } = model;
        const orient = markDef.orient;
        if (!model.encoding.x && !model.encoding.y && !model.encoding.latitude && !model.encoding.longitude) {
            // Show nothing if we have none of x, y, lat, and long.
            return {};
        }
        return Object.assign(Object.assign(Object.assign(Object.assign({}, encode.baseEncodeEntry(model, {
            align: 'ignore',
            baseline: 'ignore',
            color: 'include',
            orient: 'ignore',
            size: 'ignore',
            theta: 'ignore'
        })), encode.pointOrRangePosition('x', model, {
            defaultPos: orient === 'horizontal' ? 'zeroOrMax' : 'mid',
            defaultPos2: 'zeroOrMin',
            range: orient !== 'vertical' // include x2 for horizontal or line segment rule
        })), encode.pointOrRangePosition('y', model, {
            defaultPos: orient === 'vertical' ? 'zeroOrMax' : 'mid',
            defaultPos2: 'zeroOrMin',
            range: orient !== 'horizontal' // include y2 for vertical or line segment rule
        })), encode.nonPosition('size', model, {
            vgChannel: 'strokeWidth' // VL's rule size is strokeWidth
        }));
    }
};
//# sourceMappingURL=rule.js.map