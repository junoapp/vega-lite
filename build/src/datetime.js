"use strict";
// DateTime definition object
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateTimeToTimestamp = exports.dateTimeExprToExpr = exports.dateTimeToExpr = exports.SHORT_DAYS = exports.DAYS = exports.SHORT_MONTHS = exports.MONTHS = exports.isDateTime = void 0;
const vega_util_1 = require("vega-util");
const log = __importStar(require("./log"));
const timeunit_1 = require("./timeunit");
const util_1 = require("./util");
function isDateTime(o) {
    if (o && vega_util_1.isObject(o)) {
        for (const part of timeunit_1.TIMEUNIT_PARTS) {
            if (part in o) {
                return true;
            }
        }
    }
    return false;
}
exports.isDateTime = isDateTime;
exports.MONTHS = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december'
];
exports.SHORT_MONTHS = exports.MONTHS.map(m => m.substr(0, 3));
exports.DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
exports.SHORT_DAYS = exports.DAYS.map(d => d.substr(0, 3));
function normalizeQuarter(q) {
    if (util_1.isNumeric(q)) {
        q = +q;
    }
    if (vega_util_1.isNumber(q)) {
        if (q > 4) {
            log.warn(log.message.invalidTimeUnit('quarter', q));
        }
        // We accept 1-based quarter, so need to readjust to 0-based quarter
        return q - 1;
    }
    else {
        // Invalid quarter
        throw new Error(log.message.invalidTimeUnit('quarter', q));
    }
}
function normalizeMonth(m) {
    if (util_1.isNumeric(m)) {
        m = +m;
    }
    if (vega_util_1.isNumber(m)) {
        // We accept 1-based month, so need to readjust to 0-based month
        return m - 1;
    }
    else {
        const lowerM = m.toLowerCase();
        const monthIndex = exports.MONTHS.indexOf(lowerM);
        if (monthIndex !== -1) {
            return monthIndex; // 0 for january, ...
        }
        const shortM = lowerM.substr(0, 3);
        const shortMonthIndex = exports.SHORT_MONTHS.indexOf(shortM);
        if (shortMonthIndex !== -1) {
            return shortMonthIndex;
        }
        // Invalid month
        throw new Error(log.message.invalidTimeUnit('month', m));
    }
}
function normalizeDay(d) {
    if (util_1.isNumeric(d)) {
        d = +d;
    }
    if (vega_util_1.isNumber(d)) {
        // mod so that this can be both 0-based where 0 = sunday
        // and 1-based where 7=sunday
        return d % 7;
    }
    else {
        const lowerD = d.toLowerCase();
        const dayIndex = exports.DAYS.indexOf(lowerD);
        if (dayIndex !== -1) {
            return dayIndex; // 0 for january, ...
        }
        const shortD = lowerD.substr(0, 3);
        const shortDayIndex = exports.SHORT_DAYS.indexOf(shortD);
        if (shortDayIndex !== -1) {
            return shortDayIndex;
        }
        // Invalid day
        throw new Error(log.message.invalidTimeUnit('day', d));
    }
}
/**
 * @param d the date.
 * @param normalize whether to normalize quarter, month, day. This should probably be true if d is a DateTime.
 * @returns array of date time parts [year, month, day, hours, minutes, seconds, milliseconds]
 */
function dateTimeParts(d, normalize) {
    const parts = [];
    if (normalize && d.day !== undefined) {
        if (util_1.keys(d).length > 1) {
            log.warn(log.message.droppedDay(d));
            d = util_1.duplicate(d);
            delete d.day;
        }
    }
    if (d.year !== undefined) {
        parts.push(d.year);
    }
    else {
        // Just like Vega's timeunit transform, set default year to 2012, so domain conversion will be compatible with Vega
        // Note: 2012 is a leap year (and so the date February 29 is respected) that begins on a Sunday (and so days of the week will order properly at the beginning of the year).
        parts.push(2012);
    }
    if (d.month !== undefined) {
        const month = normalize ? normalizeMonth(d.month) : d.month;
        parts.push(month);
    }
    else if (d.quarter !== undefined) {
        const quarter = normalize ? normalizeQuarter(d.quarter) : d.quarter;
        parts.push(vega_util_1.isNumber(quarter) ? quarter * 3 : `${quarter}*3`);
    }
    else {
        parts.push(0); // months start at zero in JS
    }
    if (d.date !== undefined) {
        parts.push(d.date);
    }
    else if (d.day !== undefined) {
        // HACK: Day only works as a standalone unit
        // This is only correct because we always set year to 2006 for day
        const day = normalize ? normalizeDay(d.day) : d.day;
        parts.push(vega_util_1.isNumber(day) ? day + 1 : `${day}+1`);
    }
    else {
        parts.push(1); // Date starts at 1 in JS
    }
    // Note: can't use TimeUnit enum here as importing it will create
    // circular dependency problem!
    for (const timeUnit of ['hours', 'minutes', 'seconds', 'milliseconds']) {
        const unit = d[timeUnit];
        parts.push(typeof unit === 'undefined' ? 0 : unit);
    }
    return parts;
}
/**
 * Return Vega expression for a date time.
 *
 * @param d the date time.
 * @returns the Vega expression.
 */
function dateTimeToExpr(d) {
    const parts = dateTimeParts(d, true);
    const string = parts.join(', ');
    if (d.utc) {
        return `utc(${string})`;
    }
    else {
        return `datetime(${string})`;
    }
}
exports.dateTimeToExpr = dateTimeToExpr;
/**
 * Return Vega expression for a date time expression.
 *
 * @param d the internal date time object with expression.
 * @returns the Vega expression.
 */
function dateTimeExprToExpr(d) {
    const parts = dateTimeParts(d, false);
    const string = parts.join(', ');
    if (d.utc) {
        return `utc(${string})`;
    }
    else {
        return `datetime(${string})`;
    }
}
exports.dateTimeExprToExpr = dateTimeExprToExpr;
/**
 * @param d the date time.
 * @returns the timestamp.
 */
function dateTimeToTimestamp(d) {
    const parts = dateTimeParts(d, true);
    if (d.utc) {
        return +new Date(Date.UTC(...parts));
    }
    else {
        return +new Date(...parts);
    }
}
exports.dateTimeToTimestamp = dateTimeToTimestamp;
//# sourceMappingURL=datetime.js.map