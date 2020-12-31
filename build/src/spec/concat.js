"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHConcatSpec = exports.isVConcatSpec = exports.isConcatSpec = exports.isAnyConcatSpec = void 0;
function isAnyConcatSpec(spec) {
    return isVConcatSpec(spec) || isHConcatSpec(spec) || isConcatSpec(spec);
}
exports.isAnyConcatSpec = isAnyConcatSpec;
function isConcatSpec(spec) {
    return 'concat' in spec;
}
exports.isConcatSpec = isConcatSpec;
function isVConcatSpec(spec) {
    return 'vconcat' in spec;
}
exports.isVConcatSpec = isVConcatSpec;
function isHConcatSpec(spec) {
    return 'hconcat' in spec;
}
exports.isHConcatSpec = isHConcatSpec;
//# sourceMappingURL=concat.js.map