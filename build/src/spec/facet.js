"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFacetSpec = exports.isFacetFieldDef = exports.isFacetMapping = void 0;
function isFacetMapping(f) {
    return 'row' in f || 'column' in f;
}
exports.isFacetMapping = isFacetMapping;
function isFacetFieldDef(channelDef) {
    return !!channelDef && 'header' in channelDef;
}
exports.isFacetFieldDef = isFacetFieldDef;
function isFacetSpec(spec) {
    return 'facet' in spec;
}
exports.isFacetSpec = isFacetSpec;
//# sourceMappingURL=facet.js.map