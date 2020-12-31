"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePredicate = exports.fieldValidPredicate = exports.fieldFilterExpression = exports.isFieldPredicate = exports.isFieldValidPredicate = exports.isFieldOneOfPredicate = exports.isFieldRangePredicate = exports.isFieldGTEPredicate = exports.isFieldGTPredicate = exports.isFieldLTEPredicate = exports.isFieldLTPredicate = exports.isFieldEqualPredicate = exports.isSelectionPredicate = void 0;
const vega_util_1 = require("vega-util");
const channeldef_1 = require("./channeldef");
const timeunit_1 = require("./timeunit");
const util_1 = require("./util");
const vega_schema_1 = require("./vega.schema");
function isSelectionPredicate(predicate) {
    return predicate === null || predicate === void 0 ? void 0 : predicate['selection'];
}
exports.isSelectionPredicate = isSelectionPredicate;
function isFieldEqualPredicate(predicate) {
    return predicate && !!predicate.field && predicate.equal !== undefined;
}
exports.isFieldEqualPredicate = isFieldEqualPredicate;
function isFieldLTPredicate(predicate) {
    return predicate && !!predicate.field && predicate.lt !== undefined;
}
exports.isFieldLTPredicate = isFieldLTPredicate;
function isFieldLTEPredicate(predicate) {
    return predicate && !!predicate.field && predicate.lte !== undefined;
}
exports.isFieldLTEPredicate = isFieldLTEPredicate;
function isFieldGTPredicate(predicate) {
    return predicate && !!predicate.field && predicate.gt !== undefined;
}
exports.isFieldGTPredicate = isFieldGTPredicate;
function isFieldGTEPredicate(predicate) {
    return predicate && !!predicate.field && predicate.gte !== undefined;
}
exports.isFieldGTEPredicate = isFieldGTEPredicate;
function isFieldRangePredicate(predicate) {
    if (predicate && predicate.field) {
        if (vega_util_1.isArray(predicate.range) && predicate.range.length === 2) {
            return true;
        }
        else if (vega_schema_1.isSignalRef(predicate.range)) {
            return true;
        }
    }
    return false;
}
exports.isFieldRangePredicate = isFieldRangePredicate;
function isFieldOneOfPredicate(predicate) {
    return (predicate && !!predicate.field && (vega_util_1.isArray(predicate.oneOf) || vega_util_1.isArray(predicate.in)) // backward compatibility
    );
}
exports.isFieldOneOfPredicate = isFieldOneOfPredicate;
function isFieldValidPredicate(predicate) {
    return predicate && !!predicate.field && predicate.valid !== undefined;
}
exports.isFieldValidPredicate = isFieldValidPredicate;
function isFieldPredicate(predicate) {
    return (isFieldOneOfPredicate(predicate) ||
        isFieldEqualPredicate(predicate) ||
        isFieldRangePredicate(predicate) ||
        isFieldLTPredicate(predicate) ||
        isFieldGTPredicate(predicate) ||
        isFieldLTEPredicate(predicate) ||
        isFieldGTEPredicate(predicate));
}
exports.isFieldPredicate = isFieldPredicate;
function predicateValueExpr(v, timeUnit) {
    return channeldef_1.valueExpr(v, { timeUnit, wrapTime: true });
}
function predicateValuesExpr(vals, timeUnit) {
    return vals.map(v => predicateValueExpr(v, timeUnit));
}
// This method is used by Voyager. Do not change its behavior without changing Voyager.
function fieldFilterExpression(predicate, useInRange = true) {
    var _a;
    const { field } = predicate;
    const timeUnit = (_a = timeunit_1.normalizeTimeUnit(predicate.timeUnit)) === null || _a === void 0 ? void 0 : _a.unit;
    const fieldExpr = timeUnit
        ? // For timeUnit, cast into integer with time() so we can use ===, inrange, indexOf to compare values directly.
            // TODO: We calculate timeUnit on the fly here. Consider if we would like to consolidate this with timeUnit pipeline
            // TODO: support utc
            `time(${timeunit_1.fieldExpr(timeUnit, field)})`
        : channeldef_1.vgField(predicate, { expr: 'datum' });
    if (isFieldEqualPredicate(predicate)) {
        return `${fieldExpr}===${predicateValueExpr(predicate.equal, timeUnit)}`;
    }
    else if (isFieldLTPredicate(predicate)) {
        const upper = predicate.lt;
        return `${fieldExpr}<${predicateValueExpr(upper, timeUnit)}`;
    }
    else if (isFieldGTPredicate(predicate)) {
        const lower = predicate.gt;
        return `${fieldExpr}>${predicateValueExpr(lower, timeUnit)}`;
    }
    else if (isFieldLTEPredicate(predicate)) {
        const upper = predicate.lte;
        return `${fieldExpr}<=${predicateValueExpr(upper, timeUnit)}`;
    }
    else if (isFieldGTEPredicate(predicate)) {
        const lower = predicate.gte;
        return `${fieldExpr}>=${predicateValueExpr(lower, timeUnit)}`;
    }
    else if (isFieldOneOfPredicate(predicate)) {
        return `indexof([${predicateValuesExpr(predicate.oneOf, timeUnit).join(',')}], ${fieldExpr}) !== -1`;
    }
    else if (isFieldValidPredicate(predicate)) {
        return fieldValidPredicate(fieldExpr, predicate.valid);
    }
    else if (isFieldRangePredicate(predicate)) {
        const { range } = predicate;
        const lower = vega_schema_1.isSignalRef(range) ? { signal: `${range.signal}[0]` } : range[0];
        const upper = vega_schema_1.isSignalRef(range) ? { signal: `${range.signal}[1]` } : range[1];
        if (lower !== null && upper !== null && useInRange) {
            return ('inrange(' +
                fieldExpr +
                ', [' +
                predicateValueExpr(lower, timeUnit) +
                ', ' +
                predicateValueExpr(upper, timeUnit) +
                '])');
        }
        const exprs = [];
        if (lower !== null) {
            exprs.push(`${fieldExpr} >= ${predicateValueExpr(lower, timeUnit)}`);
        }
        if (upper !== null) {
            exprs.push(`${fieldExpr} <= ${predicateValueExpr(upper, timeUnit)}`);
        }
        return exprs.length > 0 ? exprs.join(' && ') : 'true';
    }
    /* istanbul ignore next: it should never reach here */
    throw new Error(`Invalid field predicate: ${util_1.stringify(predicate)}`);
}
exports.fieldFilterExpression = fieldFilterExpression;
function fieldValidPredicate(fieldExpr, valid = true) {
    if (valid) {
        return `isValid(${fieldExpr}) && isFinite(+${fieldExpr})`;
    }
    else {
        return `!isValid(${fieldExpr}) || !isFinite(+${fieldExpr})`;
    }
}
exports.fieldValidPredicate = fieldValidPredicate;
function normalizePredicate(f) {
    var _a;
    if (isFieldPredicate(f) && f.timeUnit) {
        return Object.assign(Object.assign({}, f), { timeUnit: (_a = timeunit_1.normalizeTimeUnit(f.timeUnit)) === null || _a === void 0 ? void 0 : _a.unit });
    }
    return f;
}
exports.normalizePredicate = normalizePredicate;
//# sourceMappingURL=predicate.js.map