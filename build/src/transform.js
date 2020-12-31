"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeTransform = exports.isFold = exports.isStack = exports.isAggregate = exports.isTimeUnit = exports.isImpute = exports.isBin = exports.isCalculate = exports.isFlatten = exports.isJoinAggregate = exports.isWindow = exports.isSample = exports.isLoess = exports.isRegression = exports.isQuantile = exports.isDensity = exports.isPivot = exports.isLookupSelection = exports.isLookupData = exports.isLookup = exports.isImputeSequence = exports.isFilter = void 0;
const logical_1 = require("./logical");
const predicate_1 = require("./predicate");
function isFilter(t) {
    return 'filter' in t;
}
exports.isFilter = isFilter;
function isImputeSequence(t) {
    return (t === null || t === void 0 ? void 0 : t['stop']) !== undefined;
}
exports.isImputeSequence = isImputeSequence;
function isLookup(t) {
    return 'lookup' in t;
}
exports.isLookup = isLookup;
function isLookupData(from) {
    return 'data' in from;
}
exports.isLookupData = isLookupData;
function isLookupSelection(from) {
    return 'selection' in from;
}
exports.isLookupSelection = isLookupSelection;
function isPivot(t) {
    return 'pivot' in t;
}
exports.isPivot = isPivot;
function isDensity(t) {
    return 'density' in t;
}
exports.isDensity = isDensity;
function isQuantile(t) {
    return 'quantile' in t;
}
exports.isQuantile = isQuantile;
function isRegression(t) {
    return 'regression' in t;
}
exports.isRegression = isRegression;
function isLoess(t) {
    return 'loess' in t;
}
exports.isLoess = isLoess;
function isSample(t) {
    return 'sample' in t;
}
exports.isSample = isSample;
function isWindow(t) {
    return 'window' in t;
}
exports.isWindow = isWindow;
function isJoinAggregate(t) {
    return 'joinaggregate' in t;
}
exports.isJoinAggregate = isJoinAggregate;
function isFlatten(t) {
    return 'flatten' in t;
}
exports.isFlatten = isFlatten;
function isCalculate(t) {
    return 'calculate' in t;
}
exports.isCalculate = isCalculate;
function isBin(t) {
    return 'bin' in t;
}
exports.isBin = isBin;
function isImpute(t) {
    return 'impute' in t;
}
exports.isImpute = isImpute;
function isTimeUnit(t) {
    return 'timeUnit' in t;
}
exports.isTimeUnit = isTimeUnit;
function isAggregate(t) {
    return 'aggregate' in t;
}
exports.isAggregate = isAggregate;
function isStack(t) {
    return 'stack' in t;
}
exports.isStack = isStack;
function isFold(t) {
    return 'fold' in t;
}
exports.isFold = isFold;
function normalizeTransform(transform) {
    return transform.map(t => {
        if (isFilter(t)) {
            return {
                filter: logical_1.normalizeLogicalComposition(t.filter, predicate_1.normalizePredicate)
            };
        }
        return t;
    });
}
exports.normalizeTransform = normalizeTransform;
//# sourceMappingURL=transform.js.map