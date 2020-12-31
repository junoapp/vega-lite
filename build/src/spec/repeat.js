"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLayerRepeatSpec = exports.isRepeatSpec = void 0;
const vega_util_1 = require("vega-util");
function isRepeatSpec(spec) {
    return 'repeat' in spec;
}
exports.isRepeatSpec = isRepeatSpec;
function isLayerRepeatSpec(spec) {
    return !vega_util_1.isArray(spec.repeat) && spec.repeat['layer'];
}
exports.isLayerRepeatSpec = isLayerRepeatSpec;
//# sourceMappingURL=repeat.js.map