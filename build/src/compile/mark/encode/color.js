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
exports.color = void 0;
const log = __importStar(require("../../../log"));
const util_1 = require("../../../util");
const common_1 = require("../../common");
const nonposition_1 = require("./nonposition");
function color(model, opt = { filled: undefined }) {
    var _a, _b, _c, _d;
    const { markDef, encoding, config } = model;
    const { type: markType } = markDef;
    // Allow filled to be overridden (for trail's "filled")
    const filled = (_a = opt.filled) !== null && _a !== void 0 ? _a : common_1.getMarkPropOrConfig('filled', markDef, config);
    const transparentIfNeeded = util_1.contains(['bar', 'point', 'circle', 'square', 'geoshape'], markType)
        ? 'transparent'
        : undefined;
    const defaultFill = (_c = (_b = common_1.getMarkPropOrConfig(filled === true ? 'color' : undefined, markDef, config, { vgChannel: 'fill' })) !== null && _b !== void 0 ? _b : 
    // need to add this manually as getMarkConfig normally drops config.mark[channel] if vgChannel is specified
    config.mark[filled === true && 'color']) !== null && _c !== void 0 ? _c : 
    // If there is no fill, always fill symbols, bar, geoshape
    // with transparent fills https://github.com/vega/vega-lite/issues/1316
    transparentIfNeeded;
    const defaultStroke = (_d = common_1.getMarkPropOrConfig(filled === false ? 'color' : undefined, markDef, config, { vgChannel: 'stroke' })) !== null && _d !== void 0 ? _d : 
    // need to add this manually as getMarkConfig normally drops config.mark[channel] if vgChannel is specified
    config.mark[filled === false && 'color'];
    const colorVgChannel = filled ? 'fill' : 'stroke';
    const fillStrokeMarkDefAndConfig = Object.assign(Object.assign({}, (defaultFill ? { fill: common_1.signalOrValueRef(defaultFill) } : {})), (defaultStroke ? { stroke: common_1.signalOrValueRef(defaultStroke) } : {}));
    if (markDef.color && (filled ? markDef.fill : markDef.stroke)) {
        log.warn(log.message.droppingColor('property', { fill: 'fill' in markDef, stroke: 'stroke' in markDef }));
    }
    return Object.assign(Object.assign(Object.assign(Object.assign({}, fillStrokeMarkDefAndConfig), nonposition_1.nonPosition('color', model, {
        vgChannel: colorVgChannel,
        defaultValue: filled ? defaultFill : defaultStroke
    })), nonposition_1.nonPosition('fill', model, {
        // if there is encoding.fill, include default fill just in case we have conditional-only fill encoding
        defaultValue: encoding.fill ? defaultFill : undefined
    })), nonposition_1.nonPosition('stroke', model, {
        // if there is encoding.stroke, include default fill just in case we have conditional-only stroke encoding
        defaultValue: encoding.stroke ? defaultStroke : undefined
    }));
}
exports.color = color;
//# sourceMappingURL=color.js.map