"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoMaxBins = exports.isSelectionExtent = exports.isBinParams = exports.isBinned = exports.isBinning = exports.binToString = void 0;
const vega_util_1 = require("vega-util");
const channel_1 = require("./channel");
const channeldef_1 = require("./channeldef");
const util_1 = require("./util");
/**
 * Create a key for the bin configuration. Not for prebinned bin.
 */
function binToString(bin) {
    if (vega_util_1.isBoolean(bin)) {
        bin = channeldef_1.normalizeBin(bin, undefined);
    }
    return ('bin' +
        util_1.keys(bin)
            .map(p => (isSelectionExtent(bin[p]) ? util_1.varName(`_${p}_${util_1.entries(bin[p])}`) : util_1.varName(`_${p}_${bin[p]}`)))
            .join(''));
}
exports.binToString = binToString;
/**
 * Vega-Lite should bin the data.
 */
function isBinning(bin) {
    return bin === true || (isBinParams(bin) && !bin.binned);
}
exports.isBinning = isBinning;
/**
 * The data is already binned and so Vega-Lite should not bin it again.
 */
function isBinned(bin) {
    return bin === 'binned' || (isBinParams(bin) && bin.binned === true);
}
exports.isBinned = isBinned;
function isBinParams(bin) {
    return vega_util_1.isObject(bin);
}
exports.isBinParams = isBinParams;
function isSelectionExtent(extent) {
    return extent === null || extent === void 0 ? void 0 : extent['selection'];
}
exports.isSelectionExtent = isSelectionExtent;
function autoMaxBins(channel) {
    switch (channel) {
        case channel_1.ROW:
        case channel_1.COLUMN:
        case channel_1.SIZE:
        case channel_1.COLOR:
        case channel_1.FILL:
        case channel_1.STROKE:
        case channel_1.STROKEWIDTH:
        case channel_1.OPACITY:
        case channel_1.FILLOPACITY:
        case channel_1.STROKEOPACITY:
        // Facets and Size shouldn't have too many bins
        // We choose 6 like shape to simplify the rule [falls through]
        case channel_1.SHAPE:
            return 6; // Vega's "shape" has 6 distinct values
        case channel_1.STROKEDASH:
            return 4; // We only provide 5 different stroke dash values (but 4 is more effective)
        default:
            return 10;
    }
}
exports.autoMaxBins = autoMaxBins;
//# sourceMappingURL=bin.js.map