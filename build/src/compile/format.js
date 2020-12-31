"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeFormatExpression = exports.binFormatExpression = exports.timeFormat = exports.numberFormat = exports.guideFormatType = exports.guideFormat = exports.formatCustomType = exports.formatSignalRef = exports.BIN_RANGE_DELIMITER = exports.isCustomFormatType = void 0;
const vega_util_1 = require("vega-util");
const bin_1 = require("../bin");
const channeldef_1 = require("../channeldef");
const predicate_1 = require("../predicate");
const scale_1 = require("../scale");
const timeunit_1 = require("../timeunit");
const type_1 = require("../type");
const util_1 = require("../util");
const vega_schema_1 = require("../vega.schema");
const valueref_1 = require("./mark/encode/valueref");
function isCustomFormatType(formatType) {
    return formatType && formatType !== 'number' && formatType !== 'time';
}
exports.isCustomFormatType = isCustomFormatType;
function customFormatExpr(formatType, field, format) {
    return `${formatType}(${field}${format ? `, ${util_1.stringify(format)}` : ''})`;
}
exports.BIN_RANGE_DELIMITER = ' \u2013 ';
function formatSignalRef({ fieldOrDatumDef, format, formatType, expr, normalizeStack, config }) {
    var _a, _b;
    if (isCustomFormatType(formatType)) {
        return formatCustomType({
            fieldOrDatumDef,
            format,
            formatType,
            expr,
            config
        });
    }
    const field = fieldToFormat(fieldOrDatumDef, expr, normalizeStack);
    if (channeldef_1.isFieldOrDatumDefForTimeFormat(fieldOrDatumDef)) {
        const signal = timeFormatExpression(field, channeldef_1.isFieldDef(fieldOrDatumDef) ? (_a = timeunit_1.normalizeTimeUnit(fieldOrDatumDef.timeUnit)) === null || _a === void 0 ? void 0 : _a.unit : undefined, format, config.timeFormat, channeldef_1.isScaleFieldDef(fieldOrDatumDef) && ((_b = fieldOrDatumDef.scale) === null || _b === void 0 ? void 0 : _b.type) === scale_1.ScaleType.UTC);
        return signal ? { signal } : undefined;
    }
    format = numberFormat(channeldef_1.channelDefType(fieldOrDatumDef), format, config);
    if (channeldef_1.isFieldDef(fieldOrDatumDef) && bin_1.isBinning(fieldOrDatumDef.bin)) {
        const endField = channeldef_1.vgField(fieldOrDatumDef, { expr, binSuffix: 'end' });
        return {
            signal: binFormatExpression(field, endField, format, formatType, config)
        };
    }
    else if (format || channeldef_1.channelDefType(fieldOrDatumDef) === 'quantitative') {
        return {
            signal: `${formatExpr(field, format)}`
        };
    }
    else {
        return { signal: `isValid(${field}) ? ${field} : ""+${field}` };
    }
}
exports.formatSignalRef = formatSignalRef;
function fieldToFormat(fieldOrDatumDef, expr, normalizeStack) {
    if (channeldef_1.isFieldDef(fieldOrDatumDef)) {
        if (normalizeStack) {
            return `${channeldef_1.vgField(fieldOrDatumDef, { expr, suffix: 'end' })}-${channeldef_1.vgField(fieldOrDatumDef, {
                expr,
                suffix: 'start'
            })}`;
        }
        else {
            return channeldef_1.vgField(fieldOrDatumDef, { expr });
        }
    }
    else {
        return valueref_1.datumDefToExpr(fieldOrDatumDef);
    }
}
function formatCustomType({ fieldOrDatumDef, format, formatType, expr, normalizeStack, config, field }) {
    field = field !== null && field !== void 0 ? field : fieldToFormat(fieldOrDatumDef, expr, normalizeStack);
    if (channeldef_1.isFieldDef(fieldOrDatumDef) && bin_1.isBinning(fieldOrDatumDef.bin)) {
        const endField = channeldef_1.vgField(fieldOrDatumDef, { expr, binSuffix: 'end' });
        return {
            signal: binFormatExpression(field, endField, format, formatType, config)
        };
    }
    return { signal: customFormatExpr(formatType, field, format) };
}
exports.formatCustomType = formatCustomType;
function guideFormat(fieldOrDatumDef, type, format, formatType, config, omitTimeFormatConfig // axis doesn't use config.timeFormat
) {
    var _a;
    if (isCustomFormatType(formatType)) {
        return undefined; // handled in encode block
    }
    if (channeldef_1.isFieldOrDatumDefForTimeFormat(fieldOrDatumDef)) {
        const timeUnit = channeldef_1.isFieldDef(fieldOrDatumDef) ? (_a = timeunit_1.normalizeTimeUnit(fieldOrDatumDef.timeUnit)) === null || _a === void 0 ? void 0 : _a.unit : undefined;
        return timeFormat(format, timeUnit, config, omitTimeFormatConfig);
    }
    return numberFormat(type, format, config);
}
exports.guideFormat = guideFormat;
function guideFormatType(formatType, fieldOrDatumDef, scaleType) {
    if (formatType && (vega_schema_1.isSignalRef(formatType) || formatType === 'number' || formatType === 'time')) {
        return formatType;
    }
    if (channeldef_1.isFieldOrDatumDefForTimeFormat(fieldOrDatumDef) && scaleType !== 'time' && scaleType !== 'utc') {
        return 'time';
    }
    return undefined;
}
exports.guideFormatType = guideFormatType;
/**
 * Returns number format for a fieldDef.
 */
function numberFormat(type, specifiedFormat, config) {
    // Specified format in axis/legend has higher precedence than fieldDef.format
    if (vega_util_1.isString(specifiedFormat)) {
        return specifiedFormat;
    }
    if (type === type_1.QUANTITATIVE) {
        // we only apply the default if the field is quantitative
        return config.numberFormat;
    }
    return undefined;
}
exports.numberFormat = numberFormat;
/**
 * Returns time format for a fieldDef for use in guides.
 */
function timeFormat(specifiedFormat, timeUnit, config, omitTimeFormatConfig) {
    if (specifiedFormat) {
        return specifiedFormat;
    }
    if (timeUnit) {
        return {
            signal: timeunit_1.timeUnitSpecifierExpression(timeUnit)
        };
    }
    return omitTimeFormatConfig ? undefined : config.timeFormat;
}
exports.timeFormat = timeFormat;
function formatExpr(field, format) {
    return `format(${field}, "${format || ''}")`;
}
function binNumberFormatExpr(field, format, formatType, config) {
    var _a;
    if (isCustomFormatType(formatType)) {
        return customFormatExpr(formatType, field, format);
    }
    return formatExpr(field, (_a = (vega_util_1.isString(format) ? format : undefined)) !== null && _a !== void 0 ? _a : config.numberFormat);
}
function binFormatExpression(startField, endField, format, formatType, config) {
    const start = binNumberFormatExpr(startField, format, formatType, config);
    const end = binNumberFormatExpr(endField, format, formatType, config);
    return `${predicate_1.fieldValidPredicate(startField, false)} ? "null" : ${start} + "${exports.BIN_RANGE_DELIMITER}" + ${end}`;
}
exports.binFormatExpression = binFormatExpression;
/**
 * Returns the time expression used for axis/legend labels or text mark for a temporal field
 */
function timeFormatExpression(field, timeUnit, format, rawTimeFormat, // should be provided only for actual text and headers, not axis/legend labels
isUTCScale) {
    if (!timeUnit || format) {
        // If there is no time unit, or if user explicitly specifies format for axis/legend/text.
        format = vega_util_1.isString(format) ? format : rawTimeFormat; // only use provided timeFormat if there is no timeUnit.
        return `${isUTCScale ? 'utc' : 'time'}Format(${field}, '${format}')`;
    }
    else {
        return timeunit_1.formatExpression(timeUnit, field, isUTCScale);
    }
}
exports.timeFormatExpression = timeFormatExpression;
//# sourceMappingURL=format.js.map