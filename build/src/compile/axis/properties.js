"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultZindex = exports.values = exports.getFieldDefTitle = exports.defaultTickCount = exports.defaultOrient = exports.defaultLabelOverlap = exports.defaultLabelFlush = exports.defaultLabelAlign = exports.defaultLabelBaseline = exports.normalizeAngleExpr = exports.getLabelAngle = exports.gridScale = exports.defaultGrid = exports.axisRules = void 0;
const vega_util_1 = require("vega-util");
const bin_1 = require("../../bin");
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const scale_1 = require("../../scale");
const timeunit_1 = require("../../timeunit");
const type_1 = require("../../type");
const util_1 = require("../../util");
const vega_schema_1 = require("../../vega.schema");
const common_1 = require("../common");
const format_1 = require("../format");
const config_1 = require("./config");
exports.axisRules = {
    scale: ({ model, channel }) => model.scaleName(channel),
    format: ({ fieldOrDatumDef, config, axis }) => {
        const { format, formatType } = axis;
        return format_1.guideFormat(fieldOrDatumDef, fieldOrDatumDef.type, format, formatType, config, true);
    },
    formatType: ({ axis, fieldOrDatumDef, scaleType }) => {
        const { formatType } = axis;
        return format_1.guideFormatType(formatType, fieldOrDatumDef, scaleType);
    },
    grid: ({ fieldOrDatumDef, axis, scaleType }) => {
        var _a;
        if (channeldef_1.isFieldDef(fieldOrDatumDef) && bin_1.isBinned(fieldOrDatumDef.bin)) {
            return false;
        }
        else {
            return (_a = axis.grid) !== null && _a !== void 0 ? _a : defaultGrid(scaleType, fieldOrDatumDef);
        }
    },
    gridScale: ({ model, channel }) => gridScale(model, channel),
    labelAlign: ({ axis, labelAngle, orient, channel }) => axis.labelAlign || defaultLabelAlign(labelAngle, orient, channel),
    labelAngle: ({ labelAngle }) => labelAngle,
    labelBaseline: ({ axis, labelAngle, orient, channel }) => axis.labelBaseline || defaultLabelBaseline(labelAngle, orient, channel),
    labelFlush: ({ axis, fieldOrDatumDef, channel }) => { var _a; return (_a = axis.labelFlush) !== null && _a !== void 0 ? _a : defaultLabelFlush(fieldOrDatumDef.type, channel); },
    labelOverlap: ({ axis, fieldOrDatumDef, scaleType }) => { var _a; return (_a = axis.labelOverlap) !== null && _a !== void 0 ? _a : defaultLabelOverlap(fieldOrDatumDef.type, scaleType, channeldef_1.isFieldDef(fieldOrDatumDef) && !!fieldOrDatumDef.timeUnit, channeldef_1.isFieldDef(fieldOrDatumDef) ? fieldOrDatumDef.sort : undefined); },
    // we already calculate orient in parse
    orient: ({ orient }) => orient,
    tickCount: ({ channel, model, axis, fieldOrDatumDef, scaleType }) => {
        var _a;
        const sizeType = channel === 'x' ? 'width' : channel === 'y' ? 'height' : undefined;
        const size = sizeType ? model.getSizeSignalRef(sizeType) : undefined;
        return (_a = axis.tickCount) !== null && _a !== void 0 ? _a : defaultTickCount({ fieldOrDatumDef, scaleType, size, values: axis.values });
    },
    title: ({ axis, model, channel }) => {
        if (axis.title !== undefined) {
            return axis.title;
        }
        const fieldDefTitle = getFieldDefTitle(model, channel);
        if (fieldDefTitle !== undefined) {
            return fieldDefTitle;
        }
        const fieldDef = model.typedFieldDef(channel);
        const channel2 = channel === 'x' ? 'x2' : 'y2';
        const fieldDef2 = model.fieldDef(channel2);
        // If title not specified, store base parts of fieldDef (and fieldDef2 if exists)
        return common_1.mergeTitleFieldDefs(fieldDef ? [channeldef_1.toFieldDefBase(fieldDef)] : [], channeldef_1.isFieldDef(fieldDef2) ? [channeldef_1.toFieldDefBase(fieldDef2)] : []);
    },
    values: ({ axis, fieldOrDatumDef }) => values(axis, fieldOrDatumDef),
    zindex: ({ axis, fieldOrDatumDef, mark }) => { var _a; return (_a = axis.zindex) !== null && _a !== void 0 ? _a : defaultZindex(mark, fieldOrDatumDef); }
};
// TODO: we need to refactor this method after we take care of config refactoring
/**
 * Default rules for whether to show a grid should be shown for a channel.
 * If `grid` is unspecified, the default value is `true` for ordinal scales that are not binned
 */
function defaultGrid(scaleType, fieldDef) {
    return !scale_1.hasDiscreteDomain(scaleType) && channeldef_1.isFieldDef(fieldDef) && !bin_1.isBinning(fieldDef === null || fieldDef === void 0 ? void 0 : fieldDef.bin);
}
exports.defaultGrid = defaultGrid;
function gridScale(model, channel) {
    const gridChannel = channel === 'x' ? 'y' : 'x';
    if (model.getScaleComponent(gridChannel)) {
        return model.scaleName(gridChannel);
    }
    return undefined;
}
exports.gridScale = gridScale;
function getLabelAngle(fieldOrDatumDef, axis, channel, styleConfig, axisConfigs) {
    const labelAngle = axis === null || axis === void 0 ? void 0 : axis.labelAngle;
    // try axis value
    if (labelAngle !== undefined) {
        return vega_schema_1.isSignalRef(labelAngle) ? labelAngle : util_1.normalizeAngle(labelAngle);
    }
    else {
        // try axis config value
        const { configValue: angle } = config_1.getAxisConfig('labelAngle', styleConfig, axis === null || axis === void 0 ? void 0 : axis.style, axisConfigs);
        if (angle !== undefined) {
            return util_1.normalizeAngle(angle);
        }
        else {
            // get default value
            if (channel === channel_1.X &&
                util_1.contains([type_1.NOMINAL, type_1.ORDINAL], fieldOrDatumDef.type) &&
                !(channeldef_1.isFieldDef(fieldOrDatumDef) && fieldOrDatumDef.timeUnit)) {
                return 270;
            }
            // no default
            return undefined;
        }
    }
}
exports.getLabelAngle = getLabelAngle;
function normalizeAngleExpr(angle) {
    return `(((${angle.signal} % 360) + 360) % 360)`;
}
exports.normalizeAngleExpr = normalizeAngleExpr;
function defaultLabelBaseline(angle, orient, channel, alwaysIncludeMiddle) {
    if (angle !== undefined) {
        if (channel === 'x') {
            if (vega_schema_1.isSignalRef(angle)) {
                const a = normalizeAngleExpr(angle);
                const orientIsTop = vega_schema_1.isSignalRef(orient) ? `(${orient.signal} === "top")` : orient === 'top';
                return {
                    signal: `(45 < ${a} && ${a} < 135) || (225 < ${a} && ${a} < 315) ? "middle" :` +
                        `(${a} <= 45 || 315 <= ${a}) === ${orientIsTop} ? "bottom" : "top"`
                };
            }
            if ((45 < angle && angle < 135) || (225 < angle && angle < 315)) {
                return 'middle';
            }
            if (vega_schema_1.isSignalRef(orient)) {
                const op = angle <= 45 || 315 <= angle ? '===' : '!==';
                return { signal: `${orient.signal} ${op} "top" ? "bottom" : "top"` };
            }
            return (angle <= 45 || 315 <= angle) === (orient === 'top') ? 'bottom' : 'top';
        }
        else {
            if (vega_schema_1.isSignalRef(angle)) {
                const a = normalizeAngleExpr(angle);
                const orientIsLeft = vega_schema_1.isSignalRef(orient) ? `(${orient.signal} === "left")` : orient === 'left';
                const middle = alwaysIncludeMiddle ? '"middle"' : 'null';
                return {
                    signal: `${a} <= 45 || 315 <= ${a} || (135 <= ${a} && ${a} <= 225) ? ${middle} : (45 <= ${a} && ${a} <= 135) === ${orientIsLeft} ? "top" : "bottom"`
                };
            }
            if (angle <= 45 || 315 <= angle || (135 <= angle && angle <= 225)) {
                return alwaysIncludeMiddle ? 'middle' : null;
            }
            if (vega_schema_1.isSignalRef(orient)) {
                const op = 45 <= angle && angle <= 135 ? '===' : '!==';
                return { signal: `${orient.signal} ${op} "left" ? "top" : "bottom"` };
            }
            return (45 <= angle && angle <= 135) === (orient === 'left') ? 'top' : 'bottom';
        }
    }
    return undefined;
}
exports.defaultLabelBaseline = defaultLabelBaseline;
function defaultLabelAlign(angle, orient, channel) {
    if (angle === undefined) {
        return undefined;
    }
    const isX = channel === 'x';
    const startAngle = isX ? 0 : 90;
    const mainOrient = isX ? 'bottom' : 'left';
    if (vega_schema_1.isSignalRef(angle)) {
        const a = normalizeAngleExpr(angle);
        const orientIsMain = vega_schema_1.isSignalRef(orient) ? `(${orient.signal} === "${mainOrient}")` : orient === mainOrient;
        return {
            signal: `(${startAngle ? `(${a} + 90)` : a} % 180 === 0) ? ${isX ? null : '"center"'} :` +
                `(${startAngle} < ${a} && ${a} < ${180 + startAngle}) === ${orientIsMain} ? "left" : "right"`
        };
    }
    if ((angle + startAngle) % 180 === 0) {
        // For bottom, use default label align so label flush still works
        return isX ? null : 'center';
    }
    if (vega_schema_1.isSignalRef(orient)) {
        const op = startAngle < angle && angle < 180 + startAngle ? '===' : '!==';
        const orientIsMain = `${orient.signal} ${op} "${mainOrient}"`;
        return {
            signal: `${orientIsMain} ? "left" : "right"`
        };
    }
    if ((startAngle < angle && angle < 180 + startAngle) === (orient === mainOrient)) {
        return 'left';
    }
    return 'right';
}
exports.defaultLabelAlign = defaultLabelAlign;
function defaultLabelFlush(type, channel) {
    if (channel === 'x' && util_1.contains(['quantitative', 'temporal'], type)) {
        return true;
    }
    return undefined;
}
exports.defaultLabelFlush = defaultLabelFlush;
function defaultLabelOverlap(type, scaleType, hasTimeUnit, sort) {
    // do not prevent overlap for nominal data because there is no way to infer what the missing labels are
    if ((hasTimeUnit && !vega_util_1.isObject(sort)) || (type !== 'nominal' && type !== 'ordinal')) {
        if (scaleType === 'log' || scaleType === 'symlog') {
            return 'greedy';
        }
        return true;
    }
    return undefined;
}
exports.defaultLabelOverlap = defaultLabelOverlap;
function defaultOrient(channel) {
    return channel === 'x' ? 'bottom' : 'left';
}
exports.defaultOrient = defaultOrient;
function defaultTickCount({ fieldOrDatumDef, scaleType, size, values: vals }) {
    var _a;
    if (!vals && !scale_1.hasDiscreteDomain(scaleType) && scaleType !== 'log') {
        if (channeldef_1.isFieldDef(fieldOrDatumDef)) {
            if (bin_1.isBinning(fieldOrDatumDef.bin)) {
                // for binned data, we don't want more ticks than maxbins
                return { signal: `ceil(${size.signal}/10)` };
            }
            if (fieldOrDatumDef.timeUnit &&
                util_1.contains(['month', 'hours', 'day', 'quarter'], (_a = timeunit_1.normalizeTimeUnit(fieldOrDatumDef.timeUnit)) === null || _a === void 0 ? void 0 : _a.unit)) {
                return undefined;
            }
        }
        return { signal: `ceil(${size.signal}/40)` };
    }
    return undefined;
}
exports.defaultTickCount = defaultTickCount;
function getFieldDefTitle(model, channel) {
    const channel2 = channel === 'x' ? 'x2' : 'y2';
    const fieldDef = model.fieldDef(channel);
    const fieldDef2 = model.fieldDef(channel2);
    const title1 = fieldDef ? fieldDef.title : undefined;
    const title2 = fieldDef2 ? fieldDef2.title : undefined;
    if (title1 && title2) {
        return common_1.mergeTitle(title1, title2);
    }
    else if (title1) {
        return title1;
    }
    else if (title2) {
        return title2;
    }
    else if (title1 !== undefined) {
        // falsy value to disable config
        return title1;
    }
    else if (title2 !== undefined) {
        // falsy value to disable config
        return title2;
    }
    return undefined;
}
exports.getFieldDefTitle = getFieldDefTitle;
function values(axis, fieldOrDatumDef) {
    const vals = axis.values;
    if (vega_util_1.isArray(vals)) {
        return channeldef_1.valueArray(fieldOrDatumDef, vals);
    }
    else if (vega_schema_1.isSignalRef(vals)) {
        return vals;
    }
    return undefined;
}
exports.values = values;
function defaultZindex(mark, fieldDef) {
    if (mark === 'rect' && channeldef_1.isDiscrete(fieldDef)) {
        return 1;
    }
    return 0;
}
exports.defaultZindex = defaultZindex;
//# sourceMappingURL=properties.js.map