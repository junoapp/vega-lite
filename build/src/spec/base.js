"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCompositionLayout = exports.DEFAULT_SPACING = exports.isFrameMixins = exports.isStep = void 0;
const vega_util_1 = require("vega-util");
const util_1 = require("../util");
const concat_1 = require("./concat");
const facet_1 = require("./facet");
function isStep(size) {
    return vega_util_1.isObject(size) && size['step'] !== undefined;
}
exports.isStep = isStep;
function isFrameMixins(o) {
    return o['view'] || o['width'] || o['height'];
}
exports.isFrameMixins = isFrameMixins;
exports.DEFAULT_SPACING = 20;
const COMPOSITION_LAYOUT_INDEX = {
    align: 1,
    bounds: 1,
    center: 1,
    columns: 1,
    spacing: 1
};
const COMPOSITION_LAYOUT_PROPERTIES = util_1.keys(COMPOSITION_LAYOUT_INDEX);
function extractCompositionLayout(spec, specType, config) {
    var _a, _b;
    const compositionConfig = config[specType];
    const layout = {};
    // Apply config first
    const { spacing: spacingConfig, columns } = compositionConfig;
    if (spacingConfig !== undefined) {
        layout.spacing = spacingConfig;
    }
    if (columns !== undefined) {
        if ((facet_1.isFacetSpec(spec) && !facet_1.isFacetMapping(spec.facet)) || concat_1.isConcatSpec(spec)) {
            layout.columns = columns;
        }
    }
    if (concat_1.isVConcatSpec(spec)) {
        layout.columns = 1;
    }
    // Then copy properties from the spec
    for (const prop of COMPOSITION_LAYOUT_PROPERTIES) {
        if (spec[prop] !== undefined) {
            if (prop === 'spacing') {
                const spacing = spec[prop];
                layout[prop] = vega_util_1.isNumber(spacing)
                    ? spacing
                    : {
                        row: (_a = spacing.row) !== null && _a !== void 0 ? _a : spacingConfig,
                        column: (_b = spacing.column) !== null && _b !== void 0 ? _b : spacingConfig
                    };
            }
            else {
                layout[prop] = spec[prop];
            }
        }
    }
    return layout;
}
exports.extractCompositionLayout = extractCompositionLayout;
//# sourceMappingURL=base.js.map