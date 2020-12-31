"use strict";
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
exports.binRequiresRange = exports.valueArray = exports.valueExpr = exports.isTimeFieldDef = exports.isFieldOrDatumDefForTimeFormat = exports.channelCompatibility = exports.normalizeBin = exports.initFieldDef = exports.initFieldOrDatumDef = exports.initChannelDef = exports.getFieldOrDatumDef = exports.getFieldDef = exports.defaultType = exports.getFormatMixins = exports.defaultTitle = exports.getGuide = exports.title = exports.resetTitleFormatter = exports.setTitleFormatter = exports.defaultTitleFormatter = exports.functionalTitleFormatter = exports.verbalTitleFormatter = exports.isCount = exports.isContinuous = exports.isDiscrete = exports.vgField = exports.toStringFieldDef = exports.isStringFieldOrDatumDef = exports.isMarkPropFieldOrDatumDef = exports.isPositionFieldOrDatumDef = exports.isScaleFieldDef = exports.isValueDef = exports.isTypedFieldDef = exports.isFieldOrDatumDef = exports.isNumericDataDef = exports.isQuantitativeFieldOrDatumDef = exports.isContinuousFieldOrDatumDef = exports.isDatumDef = exports.channelDefType = exports.isFieldDef = exports.hasConditionalValueDef = exports.hasConditionalFieldOrDatumDef = exports.hasConditionalFieldDef = exports.isConditionalDef = exports.hasBand = exports.getBand = exports.isSortableFieldDef = exports.toFieldDefBase = exports.isRepeatRef = exports.isConditionalSelection = void 0;
const vega_util_1 = require("vega-util");
const aggregate_1 = require("./aggregate");
const bin_1 = require("./bin");
const channel_1 = require("./channel");
const common_1 = require("./compile/common");
const format_1 = require("./compile/format");
const datetime_1 = require("./datetime");
const expr_1 = require("./expr");
const log = __importStar(require("./log"));
const mark_1 = require("./mark");
const scale_1 = require("./scale");
const sort_1 = require("./sort");
const facet_1 = require("./spec/facet");
const timeunit_1 = require("./timeunit");
const type_1 = require("./type");
const util_1 = require("./util");
const vega_schema_1 = require("./vega.schema");
function isConditionalSelection(c) {
    return c['selection'];
}
exports.isConditionalSelection = isConditionalSelection;
function isRepeatRef(field) {
    return field && !vega_util_1.isString(field) && 'repeat' in field;
}
exports.isRepeatRef = isRepeatRef;
function toFieldDefBase(fieldDef) {
    const { field, timeUnit, bin, aggregate } = fieldDef;
    return Object.assign(Object.assign(Object.assign(Object.assign({}, (timeUnit ? { timeUnit } : {})), (bin ? { bin } : {})), (aggregate ? { aggregate } : {})), { field });
}
exports.toFieldDefBase = toFieldDefBase;
function isSortableFieldDef(fieldDef) {
    return 'sort' in fieldDef;
}
exports.isSortableFieldDef = isSortableFieldDef;
function getBand({ channel, fieldDef, fieldDef2, markDef: mark, stack, config, isMidPoint }) {
    if (isFieldOrDatumDef(fieldDef) && fieldDef.band !== undefined) {
        return fieldDef.band;
    }
    if (isFieldDef(fieldDef)) {
        const { timeUnit, bin } = fieldDef;
        if (timeUnit && !fieldDef2) {
            if (isMidPoint) {
                return common_1.getMarkConfig('timeUnitBandPosition', mark, config);
            }
            else {
                return mark_1.isRectBasedMark(mark.type) ? common_1.getMarkConfig('timeUnitBand', mark, config) : 0;
            }
        }
        else if (bin_1.isBinning(bin)) {
            return mark_1.isRectBasedMark(mark.type) && !isMidPoint ? 1 : 0.5;
        }
    }
    if ((stack === null || stack === void 0 ? void 0 : stack.fieldChannel) === channel && isMidPoint) {
        return 0.5;
    }
    return undefined;
}
exports.getBand = getBand;
function hasBand(channel, fieldDef, fieldDef2, stack, markDef, config) {
    if (bin_1.isBinning(fieldDef.bin) || (fieldDef.timeUnit && isTypedFieldDef(fieldDef) && fieldDef.type === 'temporal')) {
        return !!getBand({ channel, fieldDef, fieldDef2, stack, markDef, config });
    }
    return false;
}
exports.hasBand = hasBand;
function isConditionalDef(channelDef) {
    return !!channelDef && 'condition' in channelDef;
}
exports.isConditionalDef = isConditionalDef;
/**
 * Return if a channelDef is a ConditionalValueDef with ConditionFieldDef
 */
function hasConditionalFieldDef(channelDef) {
    const condition = channelDef && channelDef['condition'];
    return !!condition && !vega_util_1.isArray(condition) && isFieldDef(condition);
}
exports.hasConditionalFieldDef = hasConditionalFieldDef;
function hasConditionalFieldOrDatumDef(channelDef) {
    const condition = channelDef && channelDef['condition'];
    return !!condition && !vega_util_1.isArray(condition) && isFieldOrDatumDef(condition);
}
exports.hasConditionalFieldOrDatumDef = hasConditionalFieldOrDatumDef;
function hasConditionalValueDef(channelDef) {
    const condition = channelDef && channelDef['condition'];
    return !!condition && (vega_util_1.isArray(condition) || isValueDef(condition));
}
exports.hasConditionalValueDef = hasConditionalValueDef;
function isFieldDef(channelDef) {
    // TODO: we can't use field in channelDef here as it's somehow failing runtime test
    return !!channelDef && (!!channelDef['field'] || channelDef['aggregate'] === 'count');
}
exports.isFieldDef = isFieldDef;
function channelDefType(channelDef) {
    return channelDef && channelDef['type'];
}
exports.channelDefType = channelDefType;
function isDatumDef(channelDef) {
    return !!channelDef && 'datum' in channelDef;
}
exports.isDatumDef = isDatumDef;
function isContinuousFieldOrDatumDef(cd) {
    // TODO: make datum support DateTime object
    return (isTypedFieldDef(cd) && isContinuous(cd)) || isNumericDataDef(cd);
}
exports.isContinuousFieldOrDatumDef = isContinuousFieldOrDatumDef;
function isQuantitativeFieldOrDatumDef(cd) {
    // TODO: make datum support DateTime object
    return channelDefType(cd) === 'quantitative' || isNumericDataDef(cd);
}
exports.isQuantitativeFieldOrDatumDef = isQuantitativeFieldOrDatumDef;
function isNumericDataDef(cd) {
    return isDatumDef(cd) && vega_util_1.isNumber(cd.datum);
}
exports.isNumericDataDef = isNumericDataDef;
function isFieldOrDatumDef(channelDef) {
    return isFieldDef(channelDef) || isDatumDef(channelDef);
}
exports.isFieldOrDatumDef = isFieldOrDatumDef;
function isTypedFieldDef(channelDef) {
    return !!channelDef && ('field' in channelDef || channelDef['aggregate'] === 'count') && 'type' in channelDef;
}
exports.isTypedFieldDef = isTypedFieldDef;
function isValueDef(channelDef) {
    return channelDef && 'value' in channelDef && 'value' in channelDef;
}
exports.isValueDef = isValueDef;
function isScaleFieldDef(channelDef) {
    return !!channelDef && ('scale' in channelDef || 'sort' in channelDef);
}
exports.isScaleFieldDef = isScaleFieldDef;
function isPositionFieldOrDatumDef(channelDef) {
    return channelDef && ('axis' in channelDef || 'stack' in channelDef || 'impute' in channelDef);
}
exports.isPositionFieldOrDatumDef = isPositionFieldOrDatumDef;
function isMarkPropFieldOrDatumDef(channelDef) {
    return !!channelDef && 'legend' in channelDef;
}
exports.isMarkPropFieldOrDatumDef = isMarkPropFieldOrDatumDef;
function isStringFieldOrDatumDef(channelDef) {
    return !!channelDef && ('format' in channelDef || 'formatType' in channelDef);
}
exports.isStringFieldOrDatumDef = isStringFieldOrDatumDef;
function toStringFieldDef(fieldDef) {
    // omit properties that don't exist in string field defs
    return util_1.omit(fieldDef, ['legend', 'axis', 'header', 'scale']);
}
exports.toStringFieldDef = toStringFieldDef;
function isOpFieldDef(fieldDef) {
    return 'op' in fieldDef;
}
/**
 * Get a Vega field reference from a Vega-Lite field def.
 */
function vgField(fieldDef, opt = {}) {
    var _a, _b, _c;
    let field = fieldDef.field;
    const prefix = opt.prefix;
    let suffix = opt.suffix;
    let argAccessor = ''; // for accessing argmin/argmax field at the end without getting escaped
    if (isCount(fieldDef)) {
        field = util_1.internalField('count');
    }
    else {
        let fn;
        if (!opt.nofn) {
            if (isOpFieldDef(fieldDef)) {
                fn = fieldDef.op;
            }
            else {
                const { bin, aggregate, timeUnit } = fieldDef;
                if (bin_1.isBinning(bin)) {
                    fn = bin_1.binToString(bin);
                    suffix = ((_a = opt.binSuffix) !== null && _a !== void 0 ? _a : '') + ((_b = opt.suffix) !== null && _b !== void 0 ? _b : '');
                }
                else if (aggregate) {
                    if (aggregate_1.isArgmaxDef(aggregate)) {
                        argAccessor = `["${field}"]`;
                        field = `argmax_${aggregate.argmax}`;
                    }
                    else if (aggregate_1.isArgminDef(aggregate)) {
                        argAccessor = `["${field}"]`;
                        field = `argmin_${aggregate.argmin}`;
                    }
                    else {
                        fn = String(aggregate);
                    }
                }
                else if (timeUnit) {
                    fn = timeunit_1.timeUnitToString(timeUnit);
                    suffix = ((!['range', 'mid'].includes(opt.binSuffix) && opt.binSuffix) || '') + ((_c = opt.suffix) !== null && _c !== void 0 ? _c : '');
                }
            }
        }
        if (fn) {
            field = field ? `${fn}_${field}` : fn;
        }
    }
    if (suffix) {
        field = `${field}_${suffix}`;
    }
    if (prefix) {
        field = `${prefix}_${field}`;
    }
    if (opt.forAs) {
        return util_1.removePathFromField(field);
    }
    else if (opt.expr) {
        // Expression to access flattened field. No need to escape dots.
        return util_1.flatAccessWithDatum(field, opt.expr) + argAccessor;
    }
    else {
        // We flattened all fields so paths should have become dot.
        return util_1.replacePathInField(field) + argAccessor;
    }
}
exports.vgField = vgField;
function isDiscrete(def) {
    switch (def.type) {
        case 'nominal':
        case 'ordinal':
        case 'geojson':
            return true;
        case 'quantitative':
            return isFieldDef(def) && !!def.bin;
        case 'temporal':
            return false;
    }
    throw new Error(log.message.invalidFieldType(def.type));
}
exports.isDiscrete = isDiscrete;
function isContinuous(fieldDef) {
    return !isDiscrete(fieldDef);
}
exports.isContinuous = isContinuous;
function isCount(fieldDef) {
    return fieldDef.aggregate === 'count';
}
exports.isCount = isCount;
function verbalTitleFormatter(fieldDef, config) {
    var _a;
    const { field, bin, timeUnit, aggregate } = fieldDef;
    if (aggregate === 'count') {
        return config.countTitle;
    }
    else if (bin_1.isBinning(bin)) {
        return `${field} (binned)`;
    }
    else if (timeUnit) {
        const unit = (_a = timeunit_1.normalizeTimeUnit(timeUnit)) === null || _a === void 0 ? void 0 : _a.unit;
        if (unit) {
            return `${field} (${timeunit_1.getTimeUnitParts(unit).join('-')})`;
        }
    }
    else if (aggregate) {
        if (aggregate_1.isArgmaxDef(aggregate)) {
            return `${field} for max ${aggregate.argmax}`;
        }
        else if (aggregate_1.isArgminDef(aggregate)) {
            return `${field} for min ${aggregate.argmin}`;
        }
        else {
            return `${util_1.titleCase(aggregate)} of ${field}`;
        }
    }
    return field;
}
exports.verbalTitleFormatter = verbalTitleFormatter;
function functionalTitleFormatter(fieldDef) {
    const { aggregate, bin, timeUnit, field } = fieldDef;
    if (aggregate_1.isArgmaxDef(aggregate)) {
        return `${field} for argmax(${aggregate.argmax})`;
    }
    else if (aggregate_1.isArgminDef(aggregate)) {
        return `${field} for argmin(${aggregate.argmin})`;
    }
    const timeUnitParams = timeunit_1.normalizeTimeUnit(timeUnit);
    const fn = aggregate || (timeUnitParams === null || timeUnitParams === void 0 ? void 0 : timeUnitParams.unit) || ((timeUnitParams === null || timeUnitParams === void 0 ? void 0 : timeUnitParams.maxbins) && 'timeunit') || (bin_1.isBinning(bin) && 'bin');
    if (fn) {
        return `${fn.toUpperCase()}(${field})`;
    }
    else {
        return field;
    }
}
exports.functionalTitleFormatter = functionalTitleFormatter;
const defaultTitleFormatter = (fieldDef, config) => {
    switch (config.fieldTitle) {
        case 'plain':
            return fieldDef.field;
        case 'functional':
            return functionalTitleFormatter(fieldDef);
        default:
            return verbalTitleFormatter(fieldDef, config);
    }
};
exports.defaultTitleFormatter = defaultTitleFormatter;
let titleFormatter = exports.defaultTitleFormatter;
function setTitleFormatter(formatter) {
    titleFormatter = formatter;
}
exports.setTitleFormatter = setTitleFormatter;
function resetTitleFormatter() {
    setTitleFormatter(exports.defaultTitleFormatter);
}
exports.resetTitleFormatter = resetTitleFormatter;
function title(fieldOrDatumDef, config, { allowDisabling, includeDefault = true }) {
    var _a, _b;
    const guideTitle = (_a = getGuide(fieldOrDatumDef)) === null || _a === void 0 ? void 0 : _a.title;
    if (!isFieldDef(fieldOrDatumDef)) {
        return guideTitle;
    }
    const fieldDef = fieldOrDatumDef;
    const def = includeDefault ? defaultTitle(fieldDef, config) : undefined;
    if (allowDisabling) {
        return util_1.getFirstDefined(guideTitle, fieldDef.title, def);
    }
    else {
        return (_b = guideTitle !== null && guideTitle !== void 0 ? guideTitle : fieldDef.title) !== null && _b !== void 0 ? _b : def;
    }
}
exports.title = title;
function getGuide(fieldDef) {
    if (isPositionFieldOrDatumDef(fieldDef) && fieldDef.axis) {
        return fieldDef.axis;
    }
    else if (isMarkPropFieldOrDatumDef(fieldDef) && fieldDef.legend) {
        return fieldDef.legend;
    }
    else if (facet_1.isFacetFieldDef(fieldDef) && fieldDef.header) {
        return fieldDef.header;
    }
    return undefined;
}
exports.getGuide = getGuide;
function defaultTitle(fieldDef, config) {
    return titleFormatter(fieldDef, config);
}
exports.defaultTitle = defaultTitle;
function getFormatMixins(fieldDef) {
    var _a;
    if (isStringFieldOrDatumDef(fieldDef)) {
        const { format, formatType } = fieldDef;
        return { format, formatType };
    }
    else {
        const guide = (_a = getGuide(fieldDef)) !== null && _a !== void 0 ? _a : {};
        const { format, formatType } = guide;
        return { format, formatType };
    }
}
exports.getFormatMixins = getFormatMixins;
function defaultType(fieldDef, channel) {
    var _a;
    switch (channel) {
        case 'latitude':
        case 'longitude':
            return 'quantitative';
        case 'row':
        case 'column':
        case 'facet':
        case 'shape':
        case 'strokeDash':
            return 'nominal';
        case 'order':
            return 'ordinal';
    }
    if (isSortableFieldDef(fieldDef) && vega_util_1.isArray(fieldDef.sort)) {
        return 'ordinal';
    }
    const { aggregate, bin, timeUnit } = fieldDef;
    if (timeUnit) {
        return 'temporal';
    }
    if (bin || (aggregate && !aggregate_1.isArgmaxDef(aggregate) && !aggregate_1.isArgminDef(aggregate))) {
        return 'quantitative';
    }
    if (isScaleFieldDef(fieldDef) && ((_a = fieldDef.scale) === null || _a === void 0 ? void 0 : _a.type)) {
        switch (scale_1.SCALE_CATEGORY_INDEX[fieldDef.scale.type]) {
            case 'numeric':
            case 'discretizing':
                return 'quantitative';
            case 'time':
                return 'temporal';
        }
    }
    return 'nominal';
}
exports.defaultType = defaultType;
/**
 * Returns the fieldDef -- either from the outer channelDef or from the condition of channelDef.
 * @param channelDef
 */
function getFieldDef(channelDef) {
    if (isFieldDef(channelDef)) {
        return channelDef;
    }
    else if (hasConditionalFieldDef(channelDef)) {
        return channelDef.condition;
    }
    return undefined;
}
exports.getFieldDef = getFieldDef;
function getFieldOrDatumDef(channelDef) {
    if (isFieldOrDatumDef(channelDef)) {
        return channelDef;
    }
    else if (hasConditionalFieldOrDatumDef(channelDef)) {
        return channelDef.condition;
    }
    return undefined;
}
exports.getFieldOrDatumDef = getFieldOrDatumDef;
/**
 * Convert type to full, lowercase type, or augment the fieldDef with a default type if missing.
 */
function initChannelDef(channelDef, channel, config, opt = {}) {
    if (vega_util_1.isString(channelDef) || vega_util_1.isNumber(channelDef) || vega_util_1.isBoolean(channelDef)) {
        const primitiveType = vega_util_1.isString(channelDef) ? 'string' : vega_util_1.isNumber(channelDef) ? 'number' : 'boolean';
        log.warn(log.message.primitiveChannelDef(channel, primitiveType, channelDef));
        return { value: channelDef };
    }
    // If a fieldDef contains a field, we need type.
    if (isFieldOrDatumDef(channelDef)) {
        return initFieldOrDatumDef(channelDef, channel, config, opt);
    }
    else if (hasConditionalFieldOrDatumDef(channelDef)) {
        return Object.assign(Object.assign({}, channelDef), { 
            // Need to cast as normalizeFieldDef normally return FieldDef, but here we know that it is definitely Condition<FieldDef>
            condition: initFieldOrDatumDef(channelDef.condition, channel, config, opt) });
    }
    return channelDef;
}
exports.initChannelDef = initChannelDef;
function initFieldOrDatumDef(fd, channel, config, opt) {
    if (isStringFieldOrDatumDef(fd)) {
        const { format, formatType } = fd, rest = __rest(fd, ["format", "formatType"]);
        if (format_1.isCustomFormatType(formatType) && !config.customFormatTypes) {
            log.warn(log.message.customFormatTypeNotAllowed(channel));
            return initFieldOrDatumDef(rest, channel, config, opt);
        }
    }
    else {
        const guideType = isPositionFieldOrDatumDef(fd)
            ? 'axis'
            : isMarkPropFieldOrDatumDef(fd)
                ? 'legend'
                : facet_1.isFacetFieldDef(fd)
                    ? 'header'
                    : null;
        if (guideType && fd[guideType]) {
            const _a = fd[guideType], { format, formatType } = _a, newGuide = __rest(_a, ["format", "formatType"]);
            if (format_1.isCustomFormatType(formatType) && !config.customFormatTypes) {
                log.warn(log.message.customFormatTypeNotAllowed(channel));
                return initFieldOrDatumDef(Object.assign(Object.assign({}, fd), { [guideType]: newGuide }), channel, config, opt);
            }
        }
    }
    if (isFieldDef(fd)) {
        return initFieldDef(fd, channel, opt);
    }
    return initDatumDef(fd);
}
exports.initFieldOrDatumDef = initFieldOrDatumDef;
function initDatumDef(datumDef) {
    let type = datumDef['type'];
    if (type) {
        return datumDef;
    }
    const { datum } = datumDef;
    type = vega_util_1.isNumber(datum) ? 'quantitative' : vega_util_1.isString(datum) ? 'nominal' : datetime_1.isDateTime(datum) ? 'temporal' : undefined;
    return Object.assign(Object.assign({}, datumDef), { type });
}
function initFieldDef(fd, channel, { compositeMark = false } = {}) {
    const { aggregate, timeUnit, bin, field } = fd;
    const fieldDef = Object.assign({}, fd);
    // Drop invalid aggregate
    if (!compositeMark && aggregate && !aggregate_1.isAggregateOp(aggregate) && !aggregate_1.isArgmaxDef(aggregate) && !aggregate_1.isArgminDef(aggregate)) {
        log.warn(log.message.invalidAggregate(aggregate));
        delete fieldDef.aggregate;
    }
    // Normalize Time Unit
    if (timeUnit) {
        fieldDef.timeUnit = timeunit_1.normalizeTimeUnit(timeUnit);
    }
    if (field) {
        fieldDef.field = `${field}`;
    }
    // Normalize bin
    if (bin_1.isBinning(bin)) {
        fieldDef.bin = normalizeBin(bin, channel);
    }
    if (bin_1.isBinned(bin) && !channel_1.isXorY(channel)) {
        log.warn(log.message.channelShouldNotBeUsedForBinned(channel));
    }
    // Normalize Type
    if (isTypedFieldDef(fieldDef)) {
        const { type } = fieldDef;
        const fullType = type_1.getFullName(type);
        if (type !== fullType) {
            // convert short type to full type
            fieldDef.type = fullType;
        }
        if (type !== 'quantitative') {
            if (aggregate_1.isCountingAggregateOp(aggregate)) {
                log.warn(log.message.invalidFieldTypeForCountAggregate(type, aggregate));
                fieldDef.type = 'quantitative';
            }
        }
    }
    else if (!channel_1.isSecondaryRangeChannel(channel)) {
        // If type is empty / invalid, then augment with default type
        const newType = defaultType(fieldDef, channel);
        fieldDef['type'] = newType;
    }
    if (isTypedFieldDef(fieldDef)) {
        const { compatible, warning } = channelCompatibility(fieldDef, channel) || {};
        if (compatible === false) {
            log.warn(warning);
        }
    }
    if (isSortableFieldDef(fieldDef) && vega_util_1.isString(fieldDef.sort)) {
        const { sort } = fieldDef;
        if (sort_1.isSortByChannel(sort)) {
            return Object.assign(Object.assign({}, fieldDef), { sort: { encoding: sort } });
        }
        const sub = sort.substr(1);
        if (sort.charAt(0) === '-' && sort_1.isSortByChannel(sub)) {
            return Object.assign(Object.assign({}, fieldDef), { sort: { encoding: sub, order: 'descending' } });
        }
    }
    if (facet_1.isFacetFieldDef(fieldDef)) {
        const { header } = fieldDef;
        const { orient } = header, rest = __rest(header, ["orient"]);
        if (orient) {
            return Object.assign(Object.assign({}, fieldDef), { header: Object.assign(Object.assign({}, rest), { labelOrient: header.labelOrient || orient, titleOrient: header.titleOrient || orient }) });
        }
    }
    return fieldDef;
}
exports.initFieldDef = initFieldDef;
function normalizeBin(bin, channel) {
    if (vega_util_1.isBoolean(bin)) {
        return { maxbins: bin_1.autoMaxBins(channel) };
    }
    else if (bin === 'binned') {
        return {
            binned: true
        };
    }
    else if (!bin.maxbins && !bin.step) {
        return Object.assign(Object.assign({}, bin), { maxbins: bin_1.autoMaxBins(channel) });
    }
    else {
        return bin;
    }
}
exports.normalizeBin = normalizeBin;
const COMPATIBLE = { compatible: true };
function channelCompatibility(fieldDef, channel) {
    const type = fieldDef.type;
    if (type === 'geojson' && channel !== 'shape') {
        return {
            compatible: false,
            warning: `Channel ${channel} should not be used with a geojson data.`
        };
    }
    switch (channel) {
        case channel_1.ROW:
        case channel_1.COLUMN:
        case channel_1.FACET:
            if (isContinuous(fieldDef)) {
                return {
                    compatible: false,
                    warning: log.message.facetChannelShouldBeDiscrete(channel)
                };
            }
            return COMPATIBLE;
        case channel_1.X:
        case channel_1.Y:
        case channel_1.COLOR:
        case channel_1.FILL:
        case channel_1.STROKE:
        case channel_1.TEXT:
        case channel_1.DETAIL:
        case channel_1.KEY:
        case channel_1.TOOLTIP:
        case channel_1.HREF:
        case channel_1.URL:
        case channel_1.ANGLE:
        case channel_1.THETA:
        case channel_1.RADIUS:
        case channel_1.DESCRIPTION:
            return COMPATIBLE;
        case channel_1.LONGITUDE:
        case channel_1.LONGITUDE2:
        case channel_1.LATITUDE:
        case channel_1.LATITUDE2:
            if (type !== type_1.QUANTITATIVE) {
                return {
                    compatible: false,
                    warning: `Channel ${channel} should be used with a quantitative field only, not ${fieldDef.type} field.`
                };
            }
            return COMPATIBLE;
        case channel_1.OPACITY:
        case channel_1.FILLOPACITY:
        case channel_1.STROKEOPACITY:
        case channel_1.STROKEWIDTH:
        case channel_1.SIZE:
        case channel_1.THETA2:
        case channel_1.RADIUS2:
        case channel_1.X2:
        case channel_1.Y2:
            if (type === 'nominal' && !fieldDef['sort']) {
                return {
                    compatible: false,
                    warning: `Channel ${channel} should not be used with an unsorted discrete field.`
                };
            }
            return COMPATIBLE;
        case channel_1.STROKEDASH:
            if (!['ordinal', 'nominal'].includes(fieldDef.type)) {
                return {
                    compatible: false,
                    warning: 'StrokeDash channel should be used with only discrete data.'
                };
            }
            return COMPATIBLE;
        case channel_1.SHAPE:
            if (!['ordinal', 'nominal', 'geojson'].includes(fieldDef.type)) {
                return {
                    compatible: false,
                    warning: 'Shape channel should be used with only either discrete or geojson data.'
                };
            }
            return COMPATIBLE;
        case channel_1.ORDER:
            if (fieldDef.type === 'nominal' && !('sort' in fieldDef)) {
                return {
                    compatible: false,
                    warning: `Channel order is inappropriate for nominal field, which has no inherent order.`
                };
            }
            return COMPATIBLE;
    }
}
exports.channelCompatibility = channelCompatibility;
/**
 * Check if the field def uses a time format or does not use any format but is temporal
 * (this does not cover field defs that are temporal but use a number format).
 */
function isFieldOrDatumDefForTimeFormat(fieldOrDatumDef) {
    const { formatType } = getFormatMixins(fieldOrDatumDef);
    return formatType === 'time' || (!formatType && isTimeFieldDef(fieldOrDatumDef));
}
exports.isFieldOrDatumDefForTimeFormat = isFieldOrDatumDefForTimeFormat;
/**
 * Check if field def has type `temporal`. If you want to also cover field defs that use a time format, use `isTimeFormatFieldDef`.
 */
function isTimeFieldDef(def) {
    return def && (def['type'] === 'temporal' || (isFieldDef(def) && !!def.timeUnit));
}
exports.isTimeFieldDef = isTimeFieldDef;
/**
 * Getting a value associated with a fielddef.
 * Convert the value to Vega expression if applicable (for datetime object, or string if the field def is temporal or has timeUnit)
 */
function valueExpr(v, { timeUnit, type, wrapTime, undefinedIfExprNotRequired }) {
    var _a;
    const unit = timeUnit && ((_a = timeunit_1.normalizeTimeUnit(timeUnit)) === null || _a === void 0 ? void 0 : _a.unit);
    let isTime = unit || type === 'temporal';
    let expr;
    if (expr_1.isExprRef(v)) {
        expr = v.expr;
    }
    else if (vega_schema_1.isSignalRef(v)) {
        expr = v.signal;
    }
    else if (datetime_1.isDateTime(v)) {
        isTime = true;
        expr = datetime_1.dateTimeToExpr(v);
    }
    else if (vega_util_1.isString(v) || vega_util_1.isNumber(v)) {
        if (isTime) {
            expr = `datetime(${util_1.stringify(v)})`;
            if (timeunit_1.isLocalSingleTimeUnit(unit)) {
                // for single timeUnit, we will use dateTimeToExpr to convert number/string to match the timeUnit
                if ((vega_util_1.isNumber(v) && v < 10000) || (vega_util_1.isString(v) && isNaN(Date.parse(v)))) {
                    expr = datetime_1.dateTimeToExpr({ [unit]: v });
                }
            }
        }
    }
    if (expr) {
        return wrapTime && isTime ? `time(${expr})` : expr;
    }
    // number or boolean or normal string
    return undefinedIfExprNotRequired ? undefined : util_1.stringify(v);
}
exports.valueExpr = valueExpr;
/**
 * Standardize value array -- convert each value to Vega expression if applicable
 */
function valueArray(fieldOrDatumDef, values) {
    const { type } = fieldOrDatumDef;
    return values.map(v => {
        const expr = valueExpr(v, {
            timeUnit: isFieldDef(fieldOrDatumDef) ? fieldOrDatumDef.timeUnit : undefined,
            type,
            undefinedIfExprNotRequired: true
        });
        // return signal for the expression if we need an expression
        if (expr !== undefined) {
            return { signal: expr };
        }
        // otherwise just return the original value
        return v;
    });
}
exports.valueArray = valueArray;
/**
 * Checks whether a fieldDef for a particular channel requires a computed bin range.
 */
function binRequiresRange(fieldDef, channel) {
    if (!bin_1.isBinning(fieldDef.bin)) {
        console.warn('Only call this method for binned field defs.');
        return false;
    }
    // We need the range only when the user explicitly forces a binned field to be use discrete scale. In this case, bin range is used in axis and legend labels.
    // We could check whether the axis or legend exists (not disabled) but that seems overkill.
    return channel_1.isScaleChannel(channel) && ['ordinal', 'nominal'].includes(fieldDef.type);
}
exports.binRequiresRange = binRequiresRange;
//# sourceMappingURL=channeldef.js.map