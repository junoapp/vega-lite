"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultLabelOverlap = exports.defaultGradientLength = exports.defaultDirection = exports.getDirection = exports.defaultType = exports.getLegendType = exports.clipHeight = exports.defaultSymbolType = exports.values = exports.legendRules = void 0;
const vega_util_1 = require("vega-util");
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const scale_1 = require("../../scale");
const util_1 = require("../../util");
const vega_schema_1 = require("../../vega.schema");
const format_1 = require("../format");
const encode_1 = require("./encode");
exports.legendRules = {
    direction: ({ direction }) => direction,
    format: ({ fieldOrDatumDef, legend, config }) => {
        const { format, formatType } = legend;
        return format_1.guideFormat(fieldOrDatumDef, fieldOrDatumDef.type, format, formatType, config, false);
    },
    formatType: ({ legend, fieldOrDatumDef, scaleType }) => {
        const { formatType } = legend;
        return format_1.guideFormatType(formatType, fieldOrDatumDef, scaleType);
    },
    gradientLength: params => {
        var _a, _b;
        const { legend, legendConfig } = params;
        return (_b = (_a = legend.gradientLength) !== null && _a !== void 0 ? _a : legendConfig.gradientLength) !== null && _b !== void 0 ? _b : defaultGradientLength(params);
    },
    labelOverlap: ({ legend, legendConfig, scaleType }) => { var _a, _b; return (_b = (_a = legend.labelOverlap) !== null && _a !== void 0 ? _a : legendConfig.labelOverlap) !== null && _b !== void 0 ? _b : defaultLabelOverlap(scaleType); },
    symbolType: ({ legend, markDef, channel, encoding }) => { var _a; return (_a = legend.symbolType) !== null && _a !== void 0 ? _a : defaultSymbolType(markDef.type, channel, encoding.shape, markDef.shape); },
    title: ({ fieldOrDatumDef, config }) => channeldef_1.title(fieldOrDatumDef, config, { allowDisabling: true }),
    type: ({ legendType, scaleType, channel }) => {
        if (channel_1.isColorChannel(channel) && scale_1.isContinuousToContinuous(scaleType)) {
            if (legendType === 'gradient') {
                return undefined;
            }
        }
        else if (legendType === 'symbol') {
            return undefined;
        }
        return legendType;
    },
    values: ({ fieldOrDatumDef, legend }) => values(legend, fieldOrDatumDef)
};
function values(legend, fieldOrDatumDef) {
    const vals = legend.values;
    if (vega_util_1.isArray(vals)) {
        return channeldef_1.valueArray(fieldOrDatumDef, vals);
    }
    else if (vega_schema_1.isSignalRef(vals)) {
        return vals;
    }
    return undefined;
}
exports.values = values;
function defaultSymbolType(mark, channel, shapeChannelDef, markShape) {
    var _a;
    if (channel !== 'shape') {
        // use the value from the shape encoding or the mark config if they exist
        const shape = (_a = encode_1.getFirstConditionValue(shapeChannelDef)) !== null && _a !== void 0 ? _a : markShape;
        if (shape) {
            return shape;
        }
    }
    switch (mark) {
        case 'bar':
        case 'rect':
        case 'image':
        case 'square':
            return 'square';
        case 'line':
        case 'trail':
        case 'rule':
            return 'stroke';
        case 'arc':
        case 'point':
        case 'circle':
        case 'tick':
        case 'geoshape':
        case 'area':
        case 'text':
            return 'circle';
    }
}
exports.defaultSymbolType = defaultSymbolType;
function clipHeight(legendType) {
    if (legendType === 'gradient') {
        return 20;
    }
    return undefined;
}
exports.clipHeight = clipHeight;
function getLegendType(params) {
    const { legend } = params;
    return util_1.getFirstDefined(legend.type, defaultType(params));
}
exports.getLegendType = getLegendType;
function defaultType({ channel, timeUnit, scaleType }) {
    // Following the logic in https://github.com/vega/vega-parser/blob/master/src/parsers/legend.js
    if (channel_1.isColorChannel(channel)) {
        if (util_1.contains(['quarter', 'month', 'day'], timeUnit)) {
            return 'symbol';
        }
        if (scale_1.isContinuousToContinuous(scaleType)) {
            return 'gradient';
        }
    }
    return 'symbol';
}
exports.defaultType = defaultType;
function getDirection({ legendConfig, legendType, orient, legend }) {
    var _a, _b;
    return ((_b = (_a = legend.direction) !== null && _a !== void 0 ? _a : legendConfig[legendType ? 'gradientDirection' : 'symbolDirection']) !== null && _b !== void 0 ? _b : defaultDirection(orient, legendType));
}
exports.getDirection = getDirection;
function defaultDirection(orient, legendType) {
    switch (orient) {
        case 'top':
        case 'bottom':
            return 'horizontal';
        case 'left':
        case 'right':
        case 'none':
        case undefined: // undefined = "right" in Vega
            return undefined; // vertical is Vega's default
        default:
            // top-left / ...
            // For inner legend, uses compact layout like Tableau
            return legendType === 'gradient' ? 'horizontal' : undefined;
    }
}
exports.defaultDirection = defaultDirection;
function defaultGradientLength({ legendConfig, model, direction, orient, scaleType }) {
    const { gradientHorizontalMaxLength, gradientHorizontalMinLength, gradientVerticalMaxLength, gradientVerticalMinLength } = legendConfig;
    if (scale_1.isContinuousToContinuous(scaleType)) {
        if (direction === 'horizontal') {
            if (orient === 'top' || orient === 'bottom') {
                return gradientLengthSignal(model, 'width', gradientHorizontalMinLength, gradientHorizontalMaxLength);
            }
            else {
                return gradientHorizontalMinLength;
            }
        }
        else {
            // vertical / undefined (Vega uses vertical by default)
            return gradientLengthSignal(model, 'height', gradientVerticalMinLength, gradientVerticalMaxLength);
        }
    }
    return undefined;
}
exports.defaultGradientLength = defaultGradientLength;
function gradientLengthSignal(model, sizeType, min, max) {
    const sizeSignal = model.getSizeSignalRef(sizeType).signal;
    return { signal: `clamp(${sizeSignal}, ${min}, ${max})` };
}
function defaultLabelOverlap(scaleType) {
    if (util_1.contains(['quantile', 'threshold', 'log', 'symlog'], scaleType)) {
        return 'greedy';
    }
    return undefined;
}
exports.defaultLabelOverlap = defaultLabelOverlap;
//# sourceMappingURL=properties.js.map