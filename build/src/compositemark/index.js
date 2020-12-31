"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCompositeMarks = exports.remove = exports.add = void 0;
const util_1 = require("../util");
const base_1 = require("./base");
const boxplot_1 = require("./boxplot");
const errorband_1 = require("./errorband");
const errorbar_1 = require("./errorbar");
/**
 * Registry index for all composite mark's normalizer
 */
const compositeMarkRegistry = {};
function add(mark, run, parts) {
    const normalizer = new base_1.CompositeMarkNormalizer(mark, run);
    compositeMarkRegistry[mark] = { normalizer, parts };
}
exports.add = add;
function remove(mark) {
    delete compositeMarkRegistry[mark];
}
exports.remove = remove;
function getAllCompositeMarks() {
    return util_1.keys(compositeMarkRegistry);
}
exports.getAllCompositeMarks = getAllCompositeMarks;
add(boxplot_1.BOXPLOT, boxplot_1.normalizeBoxPlot, boxplot_1.BOXPLOT_PARTS);
add(errorbar_1.ERRORBAR, errorbar_1.normalizeErrorBar, errorbar_1.ERRORBAR_PARTS);
add(errorband_1.ERRORBAND, errorband_1.normalizeErrorBand, errorband_1.ERRORBAND_PARTS);
//# sourceMappingURL=index.js.map