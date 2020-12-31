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
exports.tick = void 0;
const vega_util_1 = require("vega-util");
const config_1 = require("../../config");
const vega_schema_1 = require("../../vega.schema");
const common_1 = require("../common");
const encode = __importStar(require("./encode"));
exports.tick = {
    vgMark: 'rect',
    encodeEntry: (model) => {
        const { config, markDef } = model;
        const orient = markDef.orient;
        const vgSizeChannel = orient === 'horizontal' ? 'width' : 'height';
        const vgThicknessChannel = orient === 'horizontal' ? 'height' : 'width';
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, encode.baseEncodeEntry(model, {
            align: 'ignore',
            baseline: 'ignore',
            color: 'include',
            orient: 'ignore',
            size: 'ignore',
            theta: 'ignore'
        })), encode.pointPosition('x', model, { defaultPos: 'mid', vgChannel: 'xc' })), encode.pointPosition('y', model, { defaultPos: 'mid', vgChannel: 'yc' })), encode.nonPosition('size', model, {
            defaultValue: defaultSize(model),
            vgChannel: vgSizeChannel
        })), { [vgThicknessChannel]: common_1.signalOrValueRef(common_1.getMarkPropOrConfig('thickness', markDef, config)) });
    }
};
function defaultSize(model) {
    var _a;
    const { config, markDef } = model;
    const { orient } = markDef;
    const vgSizeChannel = orient === 'horizontal' ? 'width' : 'height';
    const scale = model.getScaleComponent(orient === 'horizontal' ? 'x' : 'y');
    const markPropOrConfig = (_a = common_1.getMarkPropOrConfig('size', markDef, config, { vgChannel: vgSizeChannel })) !== null && _a !== void 0 ? _a : config.tick.bandSize;
    if (markPropOrConfig !== undefined) {
        return markPropOrConfig;
    }
    else {
        const scaleRange = scale ? scale.get('range') : undefined;
        if (scaleRange && vega_schema_1.isVgRangeStep(scaleRange) && vega_util_1.isNumber(scaleRange.step)) {
            return (scaleRange.step * 3) / 4;
        }
        const defaultViewStep = config_1.getViewConfigDiscreteStep(config.view, vgSizeChannel);
        return (defaultViewStep * 3) / 4;
    }
}
//# sourceMappingURL=tick.js.map