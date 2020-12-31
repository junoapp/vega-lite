"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeUnitToString = exports.normalizeTimeUnit = exports.formatExpression = exports.timeUnitSpecifierExpression = exports.fieldExpr = exports.containsTimeUnit = exports.getTimeUnitParts = exports.VEGALITE_TIMEFORMAT = exports.getLocalTimeUnit = exports.isUTCTimeUnit = exports.UTC_MULTI_TIMEUNIT_INDEX = exports.LOCAL_MULTI_TIMEUNIT_INDEX = exports.UTC_SINGLE_TIMEUNIT_INDEX = exports.isLocalSingleTimeUnit = exports.TIMEUNIT_PARTS = exports.LOCAL_SINGLE_TIMEUNIT_INDEX = void 0;
const vega_util_1 = require("vega-util");
const datetime_1 = require("./datetime");
const util_1 = require("./util");
/** Time Unit that only corresponds to only one part of Date objects. */
exports.LOCAL_SINGLE_TIMEUNIT_INDEX = {
    year: 1,
    quarter: 1,
    month: 1,
    week: 1,
    day: 1,
    dayofyear: 1,
    date: 1,
    hours: 1,
    minutes: 1,
    seconds: 1,
    milliseconds: 1
};
exports.TIMEUNIT_PARTS = util_1.keys(exports.LOCAL_SINGLE_TIMEUNIT_INDEX);
function isLocalSingleTimeUnit(timeUnit) {
    return !!exports.LOCAL_SINGLE_TIMEUNIT_INDEX[timeUnit];
}
exports.isLocalSingleTimeUnit = isLocalSingleTimeUnit;
exports.UTC_SINGLE_TIMEUNIT_INDEX = {
    utcyear: 1,
    utcquarter: 1,
    utcmonth: 1,
    utcweek: 1,
    utcday: 1,
    utcdayofyear: 1,
    utcdate: 1,
    utchours: 1,
    utcminutes: 1,
    utcseconds: 1,
    utcmilliseconds: 1
};
exports.LOCAL_MULTI_TIMEUNIT_INDEX = {
    yearquarter: 1,
    yearquartermonth: 1,
    yearmonth: 1,
    yearmonthdate: 1,
    yearmonthdatehours: 1,
    yearmonthdatehoursminutes: 1,
    yearmonthdatehoursminutesseconds: 1,
    yearweek: 1,
    yearweekday: 1,
    yearweekdayhours: 1,
    yearweekdayhoursminutes: 1,
    yearweekdayhoursminutesseconds: 1,
    yeardayofyear: 1,
    quartermonth: 1,
    monthdate: 1,
    monthdatehours: 1,
    monthdatehoursminutes: 1,
    monthdatehoursminutesseconds: 1,
    weekday: 1,
    weeksdayhours: 1,
    weekdayhoursminutes: 1,
    weekdayhoursminutesseconds: 1,
    dayhours: 1,
    dayhoursminutes: 1,
    dayhoursminutesseconds: 1,
    hoursminutes: 1,
    hoursminutesseconds: 1,
    minutesseconds: 1,
    secondsmilliseconds: 1
};
exports.UTC_MULTI_TIMEUNIT_INDEX = {
    utcyearquarter: 1,
    utcyearquartermonth: 1,
    utcyearmonth: 1,
    utcyearmonthdate: 1,
    utcyearmonthdatehours: 1,
    utcyearmonthdatehoursminutes: 1,
    utcyearmonthdatehoursminutesseconds: 1,
    utcyearweek: 1,
    utcyearweekday: 1,
    utcyearweekdayhours: 1,
    utcyearweekdayhoursminutes: 1,
    utcyearweekdayhoursminutesseconds: 1,
    utcyeardayofyear: 1,
    utcquartermonth: 1,
    utcmonthdate: 1,
    utcmonthdatehours: 1,
    utcmonthdatehoursminutes: 1,
    utcmonthdatehoursminutesseconds: 1,
    utcweekday: 1,
    utcweeksdayhours: 1,
    utcweekdayhoursminutes: 1,
    utcweekdayhoursminutesseconds: 1,
    utcdayhours: 1,
    utcdayhoursminutes: 1,
    utcdayhoursminutesseconds: 1,
    utchoursminutes: 1,
    utchoursminutesseconds: 1,
    utcminutesseconds: 1,
    utcsecondsmilliseconds: 1
};
function isUTCTimeUnit(t) {
    return t.startsWith('utc');
}
exports.isUTCTimeUnit = isUTCTimeUnit;
function getLocalTimeUnit(t) {
    return t.substr(3);
}
exports.getLocalTimeUnit = getLocalTimeUnit;
// In order of increasing specificity
exports.VEGALITE_TIMEFORMAT = {
    'year-month': '%b %Y ',
    'year-month-date': '%b %d, %Y '
};
function getTimeUnitParts(timeUnit) {
    return exports.TIMEUNIT_PARTS.filter(part => containsTimeUnit(timeUnit, part));
}
exports.getTimeUnitParts = getTimeUnitParts;
/** Returns true if fullTimeUnit contains the timeUnit, false otherwise. */
function containsTimeUnit(fullTimeUnit, timeUnit) {
    const index = fullTimeUnit.indexOf(timeUnit);
    if (index < 0) {
        return false;
    }
    // exclude milliseconds
    if (index > 0 && timeUnit === 'seconds' && fullTimeUnit.charAt(index - 1) === 'i') {
        return false;
    }
    // exclude dayofyear
    if (fullTimeUnit.length > index + 3 && timeUnit === 'day' && fullTimeUnit.charAt(index + 3) === 'o') {
        return false;
    }
    if (index > 0 && timeUnit === 'year' && fullTimeUnit.charAt(index - 1) === 'f') {
        return false;
    }
    return true;
}
exports.containsTimeUnit = containsTimeUnit;
/**
 * Returns Vega expression for a given timeUnit and fieldRef
 */
function fieldExpr(fullTimeUnit, field, { end } = { end: false }) {
    const fieldRef = util_1.accessPathWithDatum(field);
    const utc = isUTCTimeUnit(fullTimeUnit) ? 'utc' : '';
    function func(timeUnit) {
        if (timeUnit === 'quarter') {
            // quarter starting at 0 (0,3,6,9).
            return `(${utc}quarter(${fieldRef})-1)`;
        }
        else {
            return `${utc}${timeUnit}(${fieldRef})`;
        }
    }
    let lastTimeUnit;
    const dateExpr = {};
    for (const part of exports.TIMEUNIT_PARTS) {
        if (containsTimeUnit(fullTimeUnit, part)) {
            dateExpr[part] = func(part);
            lastTimeUnit = part;
        }
    }
    if (end) {
        dateExpr[lastTimeUnit] += '+1';
    }
    return datetime_1.dateTimeExprToExpr(dateExpr);
}
exports.fieldExpr = fieldExpr;
function timeUnitSpecifierExpression(timeUnit) {
    if (!timeUnit) {
        return undefined;
    }
    const timeUnitParts = getTimeUnitParts(timeUnit);
    return `timeUnitSpecifier(${util_1.stringify(timeUnitParts)}, ${util_1.stringify(exports.VEGALITE_TIMEFORMAT)})`;
}
exports.timeUnitSpecifierExpression = timeUnitSpecifierExpression;
/**
 * Returns the signal expression used for axis labels for a time unit.
 */
function formatExpression(timeUnit, field, isUTCScale) {
    if (!timeUnit) {
        return undefined;
    }
    const expr = timeUnitSpecifierExpression(timeUnit);
    // We only use utcFormat for utc scale
    // For utc time units, the data is already converted as a part of timeUnit transform.
    // Thus, utc time units should use timeFormat to avoid shifting the time twice.
    const utc = isUTCScale || isUTCTimeUnit(timeUnit);
    return `${utc ? 'utc' : 'time'}Format(${field}, ${expr})`;
}
exports.formatExpression = formatExpression;
function normalizeTimeUnit(timeUnit) {
    if (!timeUnit) {
        return undefined;
    }
    let params;
    if (vega_util_1.isString(timeUnit)) {
        params = {
            unit: timeUnit
        };
    }
    else if (vega_util_1.isObject(timeUnit)) {
        params = Object.assign(Object.assign({}, timeUnit), (timeUnit.unit ? { unit: timeUnit.unit } : {}));
    }
    if (isUTCTimeUnit(params.unit)) {
        params.utc = true;
        params.unit = getLocalTimeUnit(params.unit);
    }
    return params;
}
exports.normalizeTimeUnit = normalizeTimeUnit;
function timeUnitToString(tu) {
    const _a = normalizeTimeUnit(tu), { utc } = _a, rest = __rest(_a, ["utc"]);
    if (rest.unit) {
        return ((utc ? 'utc' : '') +
            util_1.keys(rest)
                .map(p => util_1.varName(`${p === 'unit' ? '' : `_${p}_`}${rest[p]}`))
                .join(''));
    }
    else {
        // when maxbins is specified instead of units
        return ((utc ? 'utc' : '') +
            'timeunit' +
            util_1.keys(rest)
                .map(p => util_1.varName(`_${p}_${rest[p]}`))
                .join(''));
    }
}
exports.timeUnitToString = timeUnitToString;
//# sourceMappingURL=timeunit.js.map