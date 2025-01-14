"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isText = exports.extractTitleConfig = void 0;
const vega_util_1 = require("vega-util");
const util_1 = require("./util");
function extractTitleConfig(titleConfig) {
    const { 
    // These are non-mark title config that need to be hardcoded
    anchor, frame, offset, orient, 
    // color needs to be redirect to fill
    color, 
    // subtitle properties
    subtitleColor, subtitleFont, subtitleFontSize, subtitleFontStyle, subtitleFontWeight, subtitleLineHeight, subtitlePadding } = titleConfig, 
    // The rest are mark config.
    rest = __rest(titleConfig, ["anchor", "frame", "offset", "orient", "color", "subtitleColor", "subtitleFont", "subtitleFontSize", "subtitleFontStyle", "subtitleFontWeight", "subtitleLineHeight", "subtitlePadding"]);
    const titleMarkConfig = Object.assign(Object.assign({}, rest), (color ? { fill: color } : {}));
    // These are non-mark title config that need to be hardcoded
    const nonMark = Object.assign(Object.assign(Object.assign(Object.assign({}, (anchor ? { anchor } : {})), (frame ? { frame } : {})), (offset ? { offset } : {})), (orient ? { orient } : {}));
    // subtitle part can stay in config.title since header titles do not use subtitle
    const subtitle = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (subtitleColor ? { subtitleColor } : {})), (subtitleFont ? { subtitleFont } : {})), (subtitleFontSize ? { subtitleFontSize } : {})), (subtitleFontStyle ? { subtitleFontStyle } : {})), (subtitleFontWeight ? { subtitleFontWeight } : {})), (subtitleLineHeight ? { subtitleLineHeight } : {})), (subtitlePadding ? { subtitlePadding } : {}));
    const subtitleMarkConfig = util_1.pick(titleMarkConfig, ['align', 'baseline', 'dx', 'dy', 'limit']);
    return { titleMarkConfig, subtitleMarkConfig, nonMark, subtitle };
}
exports.extractTitleConfig = extractTitleConfig;
function isText(v) {
    return vega_util_1.isString(v) || (vega_util_1.isArray(v) && vega_util_1.isString(v[0]));
}
exports.isText = isText;
//# sourceMappingURL=title.js.map