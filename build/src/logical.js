"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeLogicalComposition = exports.forEachLeaf = exports.isLogicalNot = exports.isLogicalAnd = exports.isLogicalOr = void 0;
function isLogicalOr(op) {
    return !!op.or;
}
exports.isLogicalOr = isLogicalOr;
function isLogicalAnd(op) {
    return !!op.and;
}
exports.isLogicalAnd = isLogicalAnd;
function isLogicalNot(op) {
    return !!op.not;
}
exports.isLogicalNot = isLogicalNot;
function forEachLeaf(op, fn) {
    if (isLogicalNot(op)) {
        forEachLeaf(op.not, fn);
    }
    else if (isLogicalAnd(op)) {
        for (const subop of op.and) {
            forEachLeaf(subop, fn);
        }
    }
    else if (isLogicalOr(op)) {
        for (const subop of op.or) {
            forEachLeaf(subop, fn);
        }
    }
    else {
        fn(op);
    }
}
exports.forEachLeaf = forEachLeaf;
function normalizeLogicalComposition(op, normalizer) {
    if (isLogicalNot(op)) {
        return { not: normalizeLogicalComposition(op.not, normalizer) };
    }
    else if (isLogicalAnd(op)) {
        return { and: op.and.map(o => normalizeLogicalComposition(o, normalizer)) };
    }
    else if (isLogicalOr(op)) {
        return { or: op.or.map(o => normalizeLogicalComposition(o, normalizer)) };
    }
    else {
        return normalizer(op);
    }
}
exports.normalizeLogicalComposition = normalizeLogicalComposition;
//# sourceMappingURL=logical.js.map