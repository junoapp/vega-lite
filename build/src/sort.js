"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSortArray = exports.isSortField = exports.isSortByEncoding = exports.isSortByChannel = exports.DEFAULT_SORT_OP = void 0;
const vega_util_1 = require("vega-util");
exports.DEFAULT_SORT_OP = 'min';
const SORT_BY_CHANNEL_INDEX = {
    x: 1,
    y: 1,
    color: 1,
    fill: 1,
    stroke: 1,
    strokeWidth: 1,
    size: 1,
    shape: 1,
    fillOpacity: 1,
    strokeOpacity: 1,
    opacity: 1,
    text: 1
};
function isSortByChannel(c) {
    return c in SORT_BY_CHANNEL_INDEX;
}
exports.isSortByChannel = isSortByChannel;
function isSortByEncoding(sort) {
    return !!sort && !!sort['encoding'];
}
exports.isSortByEncoding = isSortByEncoding;
function isSortField(sort) {
    return !!sort && (sort['op'] === 'count' || !!sort['field']);
}
exports.isSortField = isSortField;
function isSortArray(sort) {
    return !!sort && vega_util_1.isArray(sort);
}
exports.isSortArray = isSortArray;
//# sourceMappingURL=sort.js.map