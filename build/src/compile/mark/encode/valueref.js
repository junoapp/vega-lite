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
Object.defineProperty(exports, "__esModule", { value: true });
exports.widthHeightValueOrSignalRef = exports.midPoint = exports.interpolatedSignalRef = exports.valueRefForFieldOrDatumDef = exports.datumDefToExpr = exports.fieldInvalidPredicate = exports.fieldInvalidTestValueRef = exports.wrapPositionInvalidTest = exports.midPointRefWithPositionInvalidTest = void 0;
const vega_util_1 = require("vega-util");
const aggregate_1 = require("../../../aggregate");
const bin_1 = require("../../../bin");
const channel_1 = require("../../../channel");
const channeldef_1 = require("../../../channeldef");
const datetime_1 = require("../../../datetime");
const expr_1 = require("../../../expr");
const log = __importStar(require("../../../log"));
const mark_1 = require("../../../mark");
const predicate_1 = require("../../../predicate");
const scale_1 = require("../../../scale");
const type_1 = require("../../../type");
const util_1 = require("../../../util");
const vega_schema_1 = require("../../../vega.schema");
const common_1 = require("../../common");
function midPointRefWithPositionInvalidTest(params) {
    const { channel, channelDef, markDef, scale, config } = params;
    const ref = midPoint(params);
    // Wrap to check if the positional value is invalid, if so, plot the point on the min value
    if (
    // Only this for field def without counting aggregate (as count wouldn't be null)
    channeldef_1.isFieldDef(channelDef) &&
        !aggregate_1.isCountingAggregateOp(channelDef.aggregate) &&
        // and only for continuous scale without zero (otherwise, null / invalid will be interpreted as zero, which doesn't cause layout problem)
        scale &&
        scale_1.isContinuousToContinuous(scale.get('type')) &&
        scale.get('zero') === false) {
        return wrapPositionInvalidTest({
            fieldDef: channelDef,
            channel,
            markDef,
            ref,
            config
        });
    }
    return ref;
}
exports.midPointRefWithPositionInvalidTest = midPointRefWithPositionInvalidTest;
function wrapPositionInvalidTest({ fieldDef, channel, markDef, ref, config }) {
    if (mark_1.isPathMark(markDef.type)) {
        // path mark already use defined to skip points, no need to do it here.
        return ref;
    }
    const invalid = common_1.getMarkPropOrConfig('invalid', markDef, config);
    if (invalid === null) {
        // if there is no invalid filter, don't do the invalid test
        return ref;
    }
    return [fieldInvalidTestValueRef(fieldDef, channel), ref];
}
exports.wrapPositionInvalidTest = wrapPositionInvalidTest;
function fieldInvalidTestValueRef(fieldDef, channel) {
    const test = fieldInvalidPredicate(fieldDef, true);
    const mainChannel = channel_1.getMainRangeChannel(channel); // we can cast here as the output can't be other things.
    const zeroValueRef = mainChannel === 'y'
        ? { field: { group: 'height' } }
        : // x / angle / radius can all use 0
            { value: 0 };
    return Object.assign({ test }, zeroValueRef);
}
exports.fieldInvalidTestValueRef = fieldInvalidTestValueRef;
function fieldInvalidPredicate(field, invalid = true) {
    return predicate_1.fieldValidPredicate(vega_util_1.isString(field) ? field : channeldef_1.vgField(field, { expr: 'datum' }), !invalid);
}
exports.fieldInvalidPredicate = fieldInvalidPredicate;
function datumDefToExpr(datumDef) {
    const { datum } = datumDef;
    if (datetime_1.isDateTime(datum)) {
        return datetime_1.dateTimeToExpr(datum);
    }
    return `${util_1.stringify(datum)}`;
}
exports.datumDefToExpr = datumDefToExpr;
function valueRefForFieldOrDatumDef(fieldDef, scaleName, opt, encode) {
    const ref = {};
    if (scaleName) {
        ref.scale = scaleName;
    }
    if (channeldef_1.isDatumDef(fieldDef)) {
        const { datum } = fieldDef;
        if (datetime_1.isDateTime(datum)) {
            ref.signal = datetime_1.dateTimeToExpr(datum);
        }
        else if (vega_schema_1.isSignalRef(datum)) {
            ref.signal = datum.signal;
        }
        else if (expr_1.isExprRef(datum)) {
            ref.signal = datum.expr;
        }
        else {
            ref.value = datum;
        }
    }
    else {
        ref.field = channeldef_1.vgField(fieldDef, opt);
    }
    if (encode) {
        const { offset, band } = encode;
        if (offset) {
            ref.offset = offset;
        }
        if (band) {
            ref.band = band;
        }
    }
    return ref;
}
exports.valueRefForFieldOrDatumDef = valueRefForFieldOrDatumDef;
/**
 * Signal that returns the middle of a bin from start and end field. Should only be used with x and y.
 */
function interpolatedSignalRef({ scaleName, fieldOrDatumDef, fieldOrDatumDef2, offset, startSuffix, band = 0.5 }) {
    const expr = 0 < band && band < 1 ? 'datum' : undefined;
    const start = channeldef_1.vgField(fieldOrDatumDef, { expr, suffix: startSuffix });
    const end = fieldOrDatumDef2 !== undefined
        ? channeldef_1.vgField(fieldOrDatumDef2, { expr })
        : channeldef_1.vgField(fieldOrDatumDef, { suffix: 'end', expr });
    const ref = {};
    if (band === 0 || band === 1) {
        ref.scale = scaleName;
        const val = band === 0 ? start : end;
        ref.field = val;
    }
    else {
        const datum = `${band} * ${start} + ${1 - band} * ${end}`;
        ref.signal = `scale("${scaleName}", ${datum})`;
    }
    if (offset) {
        ref.offset = offset;
    }
    return ref;
}
exports.interpolatedSignalRef = interpolatedSignalRef;
/**
 * @returns {VgValueRef} Value Ref for xc / yc or mid point for other channels.
 */
function midPoint({ channel, channelDef, channel2Def, markDef, config, scaleName, scale, stack, offset, defaultRef, band }) {
    var _a;
    // TODO: datum support
    if (channelDef) {
        /* istanbul ignore else */
        if (channeldef_1.isFieldOrDatumDef(channelDef)) {
            if (channeldef_1.isTypedFieldDef(channelDef)) {
                band = band !== null && band !== void 0 ? band : channeldef_1.getBand({
                    channel,
                    fieldDef: channelDef,
                    fieldDef2: channel2Def,
                    markDef,
                    stack,
                    config,
                    isMidPoint: true
                });
                const { bin, timeUnit, type } = channelDef;
                if (bin_1.isBinning(bin) || (band && timeUnit && type === type_1.TEMPORAL)) {
                    // Use middle only for x an y to place marks in the center between start and end of the bin range.
                    // We do not use the mid point for other channels (e.g. size) so that properties of legends and marks match.
                    if (stack && stack.impute) {
                        // For stack, we computed bin_mid so we can impute.
                        return valueRefForFieldOrDatumDef(channelDef, scaleName, { binSuffix: 'mid' }, { offset });
                    }
                    if (band) {
                        // if band = 0, no need to call interpolation
                        // For non-stack, we can just calculate bin mid on the fly using signal.
                        return interpolatedSignalRef({ scaleName, fieldOrDatumDef: channelDef, band, offset });
                    }
                    return valueRefForFieldOrDatumDef(channelDef, scaleName, channeldef_1.binRequiresRange(channelDef, channel) ? { binSuffix: 'range' } : {}, {
                        offset
                    });
                }
                else if (bin_1.isBinned(bin)) {
                    if (channeldef_1.isFieldDef(channel2Def)) {
                        return interpolatedSignalRef({
                            scaleName,
                            fieldOrDatumDef: channelDef,
                            fieldOrDatumDef2: channel2Def,
                            band,
                            offset
                        });
                    }
                    else {
                        const channel2 = channel === channel_1.X ? channel_1.X2 : channel_1.Y2;
                        log.warn(log.message.channelRequiredForBinned(channel2));
                    }
                }
            }
            const scaleType = scale === null || scale === void 0 ? void 0 : scale.get('type');
            return valueRefForFieldOrDatumDef(channelDef, scaleName, scale_1.hasDiscreteDomain(scaleType) ? { binSuffix: 'range' } : {}, // no need for bin suffix if there is no scale
            {
                offset,
                // For band, to get mid point, need to offset by half of the band
                band: scaleType === 'band' ? (_a = band !== null && band !== void 0 ? band : channelDef.band) !== null && _a !== void 0 ? _a : 0.5 : undefined
            });
        }
        else if (channeldef_1.isValueDef(channelDef)) {
            const value = channelDef.value;
            const offsetMixins = offset ? { offset } : {};
            return Object.assign(Object.assign({}, widthHeightValueOrSignalRef(channel, value)), offsetMixins);
        }
        // If channelDef is neither field def or value def, it's a condition-only def.
        // In such case, we will use default ref.
    }
    if (vega_util_1.isFunction(defaultRef)) {
        defaultRef = defaultRef();
    }
    if (defaultRef) {
        // for non-position, ref could be undefined.
        return Object.assign(Object.assign({}, defaultRef), (offset ? { offset } : {}));
    }
    return defaultRef;
}
exports.midPoint = midPoint;
/**
 * Convert special "width" and "height" values in Vega-Lite into Vega value ref.
 */
function widthHeightValueOrSignalRef(channel, value) {
    if (util_1.contains(['x', 'x2'], channel) && value === 'width') {
        return { field: { group: 'width' } };
    }
    else if (util_1.contains(['y', 'y2'], channel) && value === 'height') {
        return { field: { group: 'height' } };
    }
    return common_1.signalOrValueRef(value);
}
exports.widthHeightValueOrSignalRef = widthHeightValueOrSignalRef;
//# sourceMappingURL=valueref.js.map