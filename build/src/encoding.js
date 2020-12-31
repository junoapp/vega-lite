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
exports.pathGroupingFields = exports.reduce = exports.forEach = exports.fieldDefs = exports.normalizeEncoding = exports.initEncoding = exports.markChannelCompatible = exports.extractTransformsFromEncoding = exports.isAggregate = exports.channelHasField = void 0;
const vega_util_1 = require("vega-util");
const aggregate_1 = require("./aggregate");
const bin_1 = require("./bin");
const channel_1 = require("./channel");
const channeldef_1 = require("./channeldef");
const log = __importStar(require("./log"));
const type_1 = require("./type");
const util_1 = require("./util");
const vega_schema_1 = require("./vega.schema");
function channelHasField(encoding, channel) {
    const channelDef = encoding && encoding[channel];
    if (channelDef) {
        if (vega_util_1.isArray(channelDef)) {
            return util_1.some(channelDef, fieldDef => !!fieldDef.field);
        }
        else {
            return channeldef_1.isFieldDef(channelDef) || channeldef_1.hasConditionalFieldDef(channelDef);
        }
    }
    return false;
}
exports.channelHasField = channelHasField;
function isAggregate(encoding) {
    return util_1.some(channel_1.CHANNELS, channel => {
        if (channelHasField(encoding, channel)) {
            const channelDef = encoding[channel];
            if (vega_util_1.isArray(channelDef)) {
                return util_1.some(channelDef, fieldDef => !!fieldDef.aggregate);
            }
            else {
                const fieldDef = channeldef_1.getFieldDef(channelDef);
                return fieldDef && !!fieldDef.aggregate;
            }
        }
        return false;
    });
}
exports.isAggregate = isAggregate;
function extractTransformsFromEncoding(oldEncoding, config) {
    const groupby = [];
    const bins = [];
    const timeUnits = [];
    const aggregate = [];
    const encoding = {};
    forEach(oldEncoding, (channelDef, channel) => {
        // Extract potential embedded transformations along with remaining properties
        if (channeldef_1.isFieldDef(channelDef)) {
            const { field, aggregate: aggOp, bin, timeUnit } = channelDef, remaining = __rest(channelDef, ["field", "aggregate", "bin", "timeUnit"]);
            if (aggOp || timeUnit || bin) {
                const guide = channeldef_1.getGuide(channelDef);
                const isTitleDefined = guide && guide.title;
                let newField = channeldef_1.vgField(channelDef, { forAs: true });
                const newFieldDef = Object.assign(Object.assign(Object.assign({}, (isTitleDefined ? [] : { title: channeldef_1.title(channelDef, config, { allowDisabling: true }) })), remaining), { 
                    // Always overwrite field
                    field: newField });
                if (aggOp) {
                    let op;
                    if (aggregate_1.isArgmaxDef(aggOp)) {
                        op = 'argmax';
                        newField = channeldef_1.vgField({ op: 'argmax', field: aggOp.argmax }, { forAs: true });
                        newFieldDef.field = `${newField}.${field}`;
                    }
                    else if (aggregate_1.isArgminDef(aggOp)) {
                        op = 'argmin';
                        newField = channeldef_1.vgField({ op: 'argmin', field: aggOp.argmin }, { forAs: true });
                        newFieldDef.field = `${newField}.${field}`;
                    }
                    else if (aggOp !== 'boxplot' && aggOp !== 'errorbar' && aggOp !== 'errorband') {
                        op = aggOp;
                    }
                    if (op) {
                        const aggregateEntry = {
                            op,
                            as: newField
                        };
                        if (field) {
                            aggregateEntry.field = field;
                        }
                        aggregate.push(aggregateEntry);
                    }
                }
                else {
                    groupby.push(newField);
                    if (channeldef_1.isTypedFieldDef(channelDef) && bin_1.isBinning(bin)) {
                        bins.push({ bin, field, as: newField });
                        // Add additional groupbys for range and end of bins
                        groupby.push(channeldef_1.vgField(channelDef, { binSuffix: 'end' }));
                        if (channeldef_1.binRequiresRange(channelDef, channel)) {
                            groupby.push(channeldef_1.vgField(channelDef, { binSuffix: 'range' }));
                        }
                        // Create accompanying 'x2' or 'y2' field if channel is 'x' or 'y' respectively
                        if (channel_1.isXorY(channel)) {
                            const secondaryChannel = {
                                field: `${newField}_end`
                            };
                            encoding[`${channel}2`] = secondaryChannel;
                        }
                        newFieldDef.bin = 'binned';
                        if (!channel_1.isSecondaryRangeChannel(channel)) {
                            newFieldDef['type'] = type_1.QUANTITATIVE;
                        }
                    }
                    else if (timeUnit) {
                        timeUnits.push({
                            timeUnit,
                            field,
                            as: newField
                        });
                        // define the format type for later compilation
                        const formatType = channeldef_1.isTypedFieldDef(channelDef) && channelDef.type !== type_1.TEMPORAL && 'time';
                        if (formatType) {
                            if (channel === channel_1.TEXT || channel === channel_1.TOOLTIP) {
                                newFieldDef['formatType'] = formatType;
                            }
                            else if (channel_1.isNonPositionScaleChannel(channel)) {
                                newFieldDef['legend'] = Object.assign({ formatType }, newFieldDef['legend']);
                            }
                            else if (channel_1.isXorY(channel)) {
                                newFieldDef['axis'] = Object.assign({ formatType }, newFieldDef['axis']);
                            }
                        }
                    }
                }
                // now the field should refer to post-transformed field instead
                encoding[channel] = newFieldDef;
            }
            else {
                groupby.push(field);
                encoding[channel] = oldEncoding[channel];
            }
        }
        else {
            // For value def / signal ref / datum def, just copy
            encoding[channel] = oldEncoding[channel];
        }
    });
    return {
        bins,
        timeUnits,
        aggregate,
        groupby,
        encoding
    };
}
exports.extractTransformsFromEncoding = extractTransformsFromEncoding;
function markChannelCompatible(encoding, channel, mark) {
    const markSupported = channel_1.supportMark(channel, mark);
    if (!markSupported) {
        return false;
    }
    else if (markSupported === 'binned') {
        const primaryFieldDef = encoding[channel === channel_1.X2 ? channel_1.X : channel_1.Y];
        // circle, point, square and tick only support x2/y2 when their corresponding x/y fieldDef
        // has "binned" data and thus need x2/y2 to specify the bin-end field.
        if (channeldef_1.isFieldDef(primaryFieldDef) && channeldef_1.isFieldDef(encoding[channel]) && bin_1.isBinned(primaryFieldDef.bin)) {
            return true;
        }
        else {
            return false;
        }
    }
    return true;
}
exports.markChannelCompatible = markChannelCompatible;
function initEncoding(encoding, mark, filled, config) {
    return util_1.keys(encoding).reduce((normalizedEncoding, channel) => {
        if (!channel_1.isChannel(channel)) {
            // Drop invalid channel
            log.warn(log.message.invalidEncodingChannel(channel));
            return normalizedEncoding;
        }
        const channelDef = encoding[channel];
        if (channel === 'angle' && mark === 'arc' && !encoding.theta) {
            log.warn(log.message.REPLACE_ANGLE_WITH_THETA);
            channel = channel_1.THETA;
        }
        if (!markChannelCompatible(encoding, channel, mark)) {
            // Drop unsupported channel
            log.warn(log.message.incompatibleChannel(channel, mark));
            return normalizedEncoding;
        }
        // Drop line's size if the field is aggregated.
        if (channel === channel_1.SIZE && mark === 'line') {
            const fieldDef = channeldef_1.getFieldDef(encoding[channel]);
            if (fieldDef === null || fieldDef === void 0 ? void 0 : fieldDef.aggregate) {
                log.warn(log.message.LINE_WITH_VARYING_SIZE);
                return normalizedEncoding;
            }
        }
        // Drop color if either fill or stroke is specified
        if (channel === channel_1.COLOR && (filled ? 'fill' in encoding : 'stroke' in encoding)) {
            log.warn(log.message.droppingColor('encoding', { fill: 'fill' in encoding, stroke: 'stroke' in encoding }));
            return normalizedEncoding;
        }
        if (channel === channel_1.DETAIL ||
            (channel === channel_1.ORDER && !vega_util_1.isArray(channelDef) && !channeldef_1.isValueDef(channelDef)) ||
            (channel === channel_1.TOOLTIP && vega_util_1.isArray(channelDef))) {
            if (channelDef) {
                // Array of fieldDefs for detail channel (or production rule)
                normalizedEncoding[channel] = vega_util_1.array(channelDef).reduce((defs, fieldDef) => {
                    if (!channeldef_1.isFieldDef(fieldDef)) {
                        log.warn(log.message.emptyFieldDef(fieldDef, channel));
                    }
                    else {
                        defs.push(channeldef_1.initFieldDef(fieldDef, channel));
                    }
                    return defs;
                }, []);
            }
        }
        else {
            if (channel === channel_1.TOOLTIP && channelDef === null) {
                // Preserve null so we can use it to disable tooltip
                normalizedEncoding[channel] = null;
            }
            else if (!channeldef_1.isFieldDef(channelDef) &&
                !channeldef_1.isDatumDef(channelDef) &&
                !channeldef_1.isValueDef(channelDef) &&
                !channeldef_1.isConditionalDef(channelDef) &&
                !vega_schema_1.isSignalRef(channelDef)) {
                log.warn(log.message.emptyFieldDef(channelDef, channel));
                return normalizedEncoding;
            }
            normalizedEncoding[channel] = channeldef_1.initChannelDef(channelDef, channel, config);
        }
        return normalizedEncoding;
    }, {});
}
exports.initEncoding = initEncoding;
/**
 * For composite marks, we have to call initChannelDef during init so we can infer types earlier.
 */
function normalizeEncoding(encoding, config) {
    const normalizedEncoding = {};
    for (const channel of util_1.keys(encoding)) {
        const newChannelDef = channeldef_1.initChannelDef(encoding[channel], channel, config, { compositeMark: true });
        normalizedEncoding[channel] = newChannelDef;
    }
    return normalizedEncoding;
}
exports.normalizeEncoding = normalizeEncoding;
function fieldDefs(encoding) {
    const arr = [];
    for (const channel of util_1.keys(encoding)) {
        if (channelHasField(encoding, channel)) {
            const channelDef = encoding[channel];
            const channelDefArray = vega_util_1.array(channelDef);
            for (const def of channelDefArray) {
                if (channeldef_1.isFieldDef(def)) {
                    arr.push(def);
                }
                else if (channeldef_1.hasConditionalFieldDef(def)) {
                    arr.push(def.condition);
                }
            }
        }
    }
    return arr;
}
exports.fieldDefs = fieldDefs;
function forEach(mapping, f, thisArg) {
    if (!mapping) {
        return;
    }
    for (const channel of util_1.keys(mapping)) {
        const el = mapping[channel];
        if (vega_util_1.isArray(el)) {
            for (const channelDef of el) {
                f.call(thisArg, channelDef, channel);
            }
        }
        else {
            f.call(thisArg, el, channel);
        }
    }
}
exports.forEach = forEach;
function reduce(mapping, f, init, thisArg) {
    if (!mapping) {
        return init;
    }
    return util_1.keys(mapping).reduce((r, channel) => {
        const map = mapping[channel];
        if (vega_util_1.isArray(map)) {
            return map.reduce((r1, channelDef) => {
                return f.call(thisArg, r1, channelDef, channel);
            }, r);
        }
        else {
            return f.call(thisArg, r, map, channel);
        }
    }, init);
}
exports.reduce = reduce;
/**
 * Returns list of path grouping fields for the given encoding
 */
function pathGroupingFields(mark, encoding) {
    return util_1.keys(encoding).reduce((details, channel) => {
        switch (channel) {
            // x, y, x2, y2, lat, long, lat1, long2, order, tooltip, href, aria label, cursor should not cause lines to group
            case channel_1.X:
            case channel_1.Y:
            case channel_1.HREF:
            case channel_1.DESCRIPTION:
            case channel_1.URL:
            case channel_1.X2:
            case channel_1.Y2:
            case channel_1.THETA:
            case channel_1.THETA2:
            case channel_1.RADIUS:
            case channel_1.RADIUS2:
            // falls through
            case channel_1.LATITUDE:
            case channel_1.LONGITUDE:
            case channel_1.LATITUDE2:
            case channel_1.LONGITUDE2:
            // TODO: case 'cursor':
            // text, shape, shouldn't be a part of line/trail/area [falls through]
            case channel_1.TEXT:
            case channel_1.SHAPE:
            case channel_1.ANGLE:
            // falls through
            // tooltip fields should not be added to group by [falls through]
            case channel_1.TOOLTIP:
                return details;
            case channel_1.ORDER:
                // order should not group line / trail
                if (mark === 'line' || mark === 'trail') {
                    return details;
                }
            // but order should group area for stacking (falls through)
            case channel_1.DETAIL:
            case channel_1.KEY: {
                const channelDef = encoding[channel];
                if (vega_util_1.isArray(channelDef) || channeldef_1.isFieldDef(channelDef)) {
                    for (const fieldDef of vega_util_1.array(channelDef)) {
                        if (!fieldDef.aggregate) {
                            details.push(channeldef_1.vgField(fieldDef, {}));
                        }
                    }
                }
                return details;
            }
            case channel_1.SIZE:
                if (mark === 'trail') {
                    // For trail, size should not group trail lines.
                    return details;
                }
            // For line, size should group lines.
            // falls through
            case channel_1.COLOR:
            case channel_1.FILL:
            case channel_1.STROKE:
            case channel_1.OPACITY:
            case channel_1.FILLOPACITY:
            case channel_1.STROKEOPACITY:
            case channel_1.STROKEDASH:
            case channel_1.STROKEWIDTH: {
                // TODO strokeDashOffset:
                // falls through
                const fieldDef = channeldef_1.getFieldDef(encoding[channel]);
                if (fieldDef && !fieldDef.aggregate) {
                    details.push(channeldef_1.vgField(fieldDef, {}));
                }
                return details;
            }
        }
    }, []);
}
exports.pathGroupingFields = pathGroupingFields;
//# sourceMappingURL=encoding.js.map