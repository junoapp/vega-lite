"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHARED_DOMAIN_OP_INDEX = exports.SHARED_DOMAIN_OPS = exports.SUM_OPS = exports.isMinMaxOp = exports.isCountingAggregateOp = exports.COUNTING_OPS = exports.isAggregateOp = exports.AGGREGATE_OPS = exports.isArgmaxDef = exports.isArgminDef = exports.MULTIDOMAIN_SORT_OP_INDEX = void 0;
const vega_util_1 = require("vega-util");
const util_1 = require("./util");
const AGGREGATE_OP_INDEX = {
    argmax: 1,
    argmin: 1,
    average: 1,
    count: 1,
    distinct: 1,
    product: 1,
    max: 1,
    mean: 1,
    median: 1,
    min: 1,
    missing: 1,
    q1: 1,
    q3: 1,
    ci0: 1,
    ci1: 1,
    stderr: 1,
    stdev: 1,
    stdevp: 1,
    sum: 1,
    valid: 1,
    values: 1,
    variance: 1,
    variancep: 1
};
exports.MULTIDOMAIN_SORT_OP_INDEX = {
    count: 1,
    min: 1,
    max: 1
};
function isArgminDef(a) {
    return !!a && !!a['argmin'];
}
exports.isArgminDef = isArgminDef;
function isArgmaxDef(a) {
    return !!a && !!a['argmax'];
}
exports.isArgmaxDef = isArgmaxDef;
exports.AGGREGATE_OPS = util_1.keys(AGGREGATE_OP_INDEX);
function isAggregateOp(a) {
    return vega_util_1.isString(a) && !!AGGREGATE_OP_INDEX[a];
}
exports.isAggregateOp = isAggregateOp;
exports.COUNTING_OPS = ['count', 'valid', 'missing', 'distinct'];
function isCountingAggregateOp(aggregate) {
    return vega_util_1.isString(aggregate) && util_1.contains(exports.COUNTING_OPS, aggregate);
}
exports.isCountingAggregateOp = isCountingAggregateOp;
function isMinMaxOp(aggregate) {
    return vega_util_1.isString(aggregate) && util_1.contains(['min', 'max'], aggregate);
}
exports.isMinMaxOp = isMinMaxOp;
/** Additive-based aggregation operations. These can be applied to stack. */
exports.SUM_OPS = ['count', 'sum', 'distinct', 'valid', 'missing'];
/**
 * Aggregation operators that always produce values within the range [domainMin, domainMax].
 */
exports.SHARED_DOMAIN_OPS = ['mean', 'average', 'median', 'q1', 'q3', 'min', 'max'];
exports.SHARED_DOMAIN_OP_INDEX = vega_util_1.toSet(exports.SHARED_DOMAIN_OPS);
//# sourceMappingURL=aggregate.js.map