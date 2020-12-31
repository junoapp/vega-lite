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
exports.channelSupportScaleType = exports.scaleTypeSupportDataType = exports.channelScalePropertyIncompatability = exports.scaleTypeSupportProperty = exports.NON_TYPE_DOMAIN_RANGE_VEGA_SCALE_PROPERTIES = exports.SCALE_PROPERTIES = exports.isDomainUnionWith = exports.isSelectionDomain = exports.isExtendedScheme = exports.defaultScaleConfig = exports.isContinuousToDiscrete = exports.isContinuousToContinuous = exports.hasContinuousDomain = exports.hasDiscreteDomain = exports.TIME_SCALE_TYPES = exports.DISCRETE_DOMAIN_SCALES = exports.CONTINUOUS_DOMAIN_SCALES = exports.CONTINUOUS_TO_DISCRETE_SCALES = exports.isQuantitative = exports.QUANTITATIVE_SCALES = exports.CONTINUOUS_TO_CONTINUOUS_SCALES = exports.scaleTypePrecedence = exports.scaleCompatible = exports.SCALE_TYPES = exports.SCALE_CATEGORY_INDEX = exports.ScaleType = void 0;
const vega_util_1 = require("vega-util");
const CHANNEL = __importStar(require("./channel"));
const channel_1 = require("./channel");
const log = __importStar(require("./log"));
const type_1 = require("./type");
const util_1 = require("./util");
exports.ScaleType = {
    // Continuous - Quantitative
    LINEAR: 'linear',
    LOG: 'log',
    POW: 'pow',
    SQRT: 'sqrt',
    SYMLOG: 'symlog',
    IDENTITY: 'identity',
    SEQUENTIAL: 'sequential',
    // Continuous - Time
    TIME: 'time',
    UTC: 'utc',
    // Discretizing scales
    QUANTILE: 'quantile',
    QUANTIZE: 'quantize',
    THRESHOLD: 'threshold',
    BIN_ORDINAL: 'bin-ordinal',
    // Discrete scales
    ORDINAL: 'ordinal',
    POINT: 'point',
    BAND: 'band'
};
/**
 * Index for scale categories -- only scale of the same categories can be merged together.
 * Current implementation is trying to be conservative and avoid merging scale type that might not work together
 */
exports.SCALE_CATEGORY_INDEX = {
    linear: 'numeric',
    log: 'numeric',
    pow: 'numeric',
    sqrt: 'numeric',
    symlog: 'numeric',
    identity: 'numeric',
    sequential: 'numeric',
    time: 'time',
    utc: 'time',
    ordinal: 'ordinal',
    'bin-ordinal': 'bin-ordinal',
    point: 'ordinal-position',
    band: 'ordinal-position',
    quantile: 'discretizing',
    quantize: 'discretizing',
    threshold: 'discretizing'
};
exports.SCALE_TYPES = util_1.keys(exports.SCALE_CATEGORY_INDEX);
/**
 * Whether the two given scale types can be merged together.
 */
function scaleCompatible(scaleType1, scaleType2) {
    const scaleCategory1 = exports.SCALE_CATEGORY_INDEX[scaleType1];
    const scaleCategory2 = exports.SCALE_CATEGORY_INDEX[scaleType2];
    return (scaleCategory1 === scaleCategory2 ||
        (scaleCategory1 === 'ordinal-position' && scaleCategory2 === 'time') ||
        (scaleCategory2 === 'ordinal-position' && scaleCategory1 === 'time'));
}
exports.scaleCompatible = scaleCompatible;
/**
 * Index for scale precedence -- high score = higher priority for merging.
 */
const SCALE_PRECEDENCE_INDEX = {
    // numeric
    linear: 0,
    log: 1,
    pow: 1,
    sqrt: 1,
    symlog: 1,
    identity: 1,
    sequential: 1,
    // time
    time: 0,
    utc: 0,
    // ordinal-position -- these have higher precedence than continuous scales as they support more types of data
    point: 10,
    band: 11,
    // non grouped types
    ordinal: 0,
    'bin-ordinal': 0,
    quantile: 0,
    quantize: 0,
    threshold: 0
};
/**
 * Return scale categories -- only scale of the same categories can be merged together.
 */
function scaleTypePrecedence(scaleType) {
    return SCALE_PRECEDENCE_INDEX[scaleType];
}
exports.scaleTypePrecedence = scaleTypePrecedence;
exports.CONTINUOUS_TO_CONTINUOUS_SCALES = ['linear', 'log', 'pow', 'sqrt', 'symlog', 'time', 'utc'];
const CONTINUOUS_TO_CONTINUOUS_INDEX = vega_util_1.toSet(exports.CONTINUOUS_TO_CONTINUOUS_SCALES);
exports.QUANTITATIVE_SCALES = ['linear', 'log', 'pow', 'sqrt', 'symlog'];
const QUANTITATIVE_SCALES_INDEX = vega_util_1.toSet(exports.QUANTITATIVE_SCALES);
function isQuantitative(type) {
    return type in QUANTITATIVE_SCALES_INDEX;
}
exports.isQuantitative = isQuantitative;
exports.CONTINUOUS_TO_DISCRETE_SCALES = ['quantile', 'quantize', 'threshold'];
const CONTINUOUS_TO_DISCRETE_INDEX = vega_util_1.toSet(exports.CONTINUOUS_TO_DISCRETE_SCALES);
exports.CONTINUOUS_DOMAIN_SCALES = exports.CONTINUOUS_TO_CONTINUOUS_SCALES.concat([
    'quantile',
    'quantize',
    'threshold',
    'sequential',
    'identity'
]);
const CONTINUOUS_DOMAIN_INDEX = vega_util_1.toSet(exports.CONTINUOUS_DOMAIN_SCALES);
exports.DISCRETE_DOMAIN_SCALES = ['ordinal', 'bin-ordinal', 'point', 'band'];
const DISCRETE_DOMAIN_INDEX = vega_util_1.toSet(exports.DISCRETE_DOMAIN_SCALES);
exports.TIME_SCALE_TYPES = ['time', 'utc'];
function hasDiscreteDomain(type) {
    return type in DISCRETE_DOMAIN_INDEX;
}
exports.hasDiscreteDomain = hasDiscreteDomain;
function hasContinuousDomain(type) {
    return type in CONTINUOUS_DOMAIN_INDEX;
}
exports.hasContinuousDomain = hasContinuousDomain;
function isContinuousToContinuous(type) {
    return type in CONTINUOUS_TO_CONTINUOUS_INDEX;
}
exports.isContinuousToContinuous = isContinuousToContinuous;
function isContinuousToDiscrete(type) {
    return type in CONTINUOUS_TO_DISCRETE_INDEX;
}
exports.isContinuousToDiscrete = isContinuousToDiscrete;
exports.defaultScaleConfig = {
    pointPadding: 0.5,
    barBandPaddingInner: 0.1,
    rectBandPaddingInner: 0,
    minBandSize: 2,
    minFontSize: 8,
    maxFontSize: 40,
    minOpacity: 0.3,
    maxOpacity: 0.8,
    // FIXME: revise if these *can* become ratios of width/height step
    minSize: 9,
    minStrokeWidth: 1,
    maxStrokeWidth: 4,
    quantileCount: 4,
    quantizeCount: 4
};
function isExtendedScheme(scheme) {
    return !vega_util_1.isString(scheme) && !!scheme['name'];
}
exports.isExtendedScheme = isExtendedScheme;
function isSelectionDomain(domain) {
    return domain === null || domain === void 0 ? void 0 : domain['selection'];
}
exports.isSelectionDomain = isSelectionDomain;
function isDomainUnionWith(domain) {
    return domain && domain['unionWith'];
}
exports.isDomainUnionWith = isDomainUnionWith;
const SCALE_PROPERTY_INDEX = {
    type: 1,
    domain: 1,
    domainMax: 1,
    domainMin: 1,
    domainMid: 1,
    align: 1,
    range: 1,
    rangeMax: 1,
    rangeMin: 1,
    scheme: 1,
    bins: 1,
    // Other properties
    reverse: 1,
    round: 1,
    // quantitative / time
    clamp: 1,
    nice: 1,
    // quantitative
    base: 1,
    exponent: 1,
    constant: 1,
    interpolate: 1,
    zero: 1,
    // band/point
    padding: 1,
    paddingInner: 1,
    paddingOuter: 1
};
exports.SCALE_PROPERTIES = util_1.keys(SCALE_PROPERTY_INDEX);
const { type, domain, range, rangeMax, rangeMin, scheme } = SCALE_PROPERTY_INDEX, NON_TYPE_DOMAIN_RANGE_VEGA_SCALE_PROPERTY_INDEX = __rest(SCALE_PROPERTY_INDEX, ["type", "domain", "range", "rangeMax", "rangeMin", "scheme"]);
exports.NON_TYPE_DOMAIN_RANGE_VEGA_SCALE_PROPERTIES = util_1.keys(NON_TYPE_DOMAIN_RANGE_VEGA_SCALE_PROPERTY_INDEX);
function scaleTypeSupportProperty(scaleType, propName) {
    switch (propName) {
        case 'type':
        case 'domain':
        case 'reverse':
        case 'range':
            return true;
        case 'scheme':
        case 'interpolate':
            return !['point', 'band', 'identity'].includes(scaleType);
        case 'bins':
            return !['point', 'band', 'identity', 'ordinal'].includes(scaleType);
        case 'round':
            return isContinuousToContinuous(scaleType) || scaleType === 'band' || scaleType === 'point';
        case 'padding':
        case 'rangeMin':
        case 'rangeMax':
            return isContinuousToContinuous(scaleType) || ['point', 'band'].includes(scaleType);
        case 'paddingOuter':
        case 'align':
            return ['point', 'band'].includes(scaleType);
        case 'paddingInner':
            return scaleType === 'band';
        case 'domainMax':
        case 'domainMid':
        case 'domainMin':
        case 'clamp':
            return isContinuousToContinuous(scaleType);
        case 'nice':
            return isContinuousToContinuous(scaleType) || scaleType === 'quantize' || scaleType === 'threshold';
        case 'exponent':
            return scaleType === 'pow';
        case 'base':
            return scaleType === 'log';
        case 'constant':
            return scaleType === 'symlog';
        case 'zero':
            return (hasContinuousDomain(scaleType) &&
                !util_1.contains([
                    'log',
                    'time',
                    'utc',
                    'threshold',
                    'quantile' // quantile depends on distribution so zero does not matter
                ], scaleType));
    }
}
exports.scaleTypeSupportProperty = scaleTypeSupportProperty;
/**
 * Returns undefined if the input channel supports the input scale property name
 */
function channelScalePropertyIncompatability(channel, propName) {
    switch (propName) {
        case 'interpolate':
        case 'scheme':
        case 'domainMid':
            if (!channel_1.isColorChannel(channel)) {
                return log.message.cannotUseScalePropertyWithNonColor(channel);
            }
            return undefined;
        case 'align':
        case 'type':
        case 'bins':
        case 'domain':
        case 'domainMax':
        case 'domainMin':
        case 'range':
        case 'base':
        case 'exponent':
        case 'constant':
        case 'nice':
        case 'padding':
        case 'paddingInner':
        case 'paddingOuter':
        case 'rangeMax':
        case 'rangeMin':
        case 'reverse':
        case 'round':
        case 'clamp':
        case 'zero':
            return undefined; // GOOD!
    }
}
exports.channelScalePropertyIncompatability = channelScalePropertyIncompatability;
function scaleTypeSupportDataType(specifiedType, fieldDefType) {
    if (util_1.contains([type_1.ORDINAL, type_1.NOMINAL], fieldDefType)) {
        return specifiedType === undefined || hasDiscreteDomain(specifiedType);
    }
    else if (fieldDefType === type_1.TEMPORAL) {
        return util_1.contains([exports.ScaleType.TIME, exports.ScaleType.UTC, undefined], specifiedType);
    }
    else if (fieldDefType === type_1.QUANTITATIVE) {
        return util_1.contains([
            exports.ScaleType.LOG,
            exports.ScaleType.POW,
            exports.ScaleType.SQRT,
            exports.ScaleType.SYMLOG,
            exports.ScaleType.QUANTILE,
            exports.ScaleType.QUANTIZE,
            exports.ScaleType.THRESHOLD,
            exports.ScaleType.LINEAR,
            undefined
        ], specifiedType);
    }
    return true;
}
exports.scaleTypeSupportDataType = scaleTypeSupportDataType;
function channelSupportScaleType(channel, scaleType) {
    if (!CHANNEL.isScaleChannel(channel)) {
        return false;
    }
    switch (channel) {
        case CHANNEL.X:
        case CHANNEL.Y:
        case CHANNEL.THETA:
        case CHANNEL.RADIUS:
            return isContinuousToContinuous(scaleType) || util_1.contains(['band', 'point'], scaleType);
        case CHANNEL.SIZE: // TODO: size and opacity can support ordinal with more modification
        case CHANNEL.STROKEWIDTH:
        case CHANNEL.OPACITY:
        case CHANNEL.FILLOPACITY:
        case CHANNEL.STROKEOPACITY:
        case CHANNEL.ANGLE:
            // Although it generally doesn't make sense to use band with size and opacity,
            // it can also work since we use band: 0.5 to get midpoint.
            return (isContinuousToContinuous(scaleType) ||
                isContinuousToDiscrete(scaleType) ||
                util_1.contains(['band', 'point', 'ordinal'], scaleType));
        case CHANNEL.COLOR:
        case CHANNEL.FILL:
        case CHANNEL.STROKE:
            return scaleType !== 'band'; // band does not make sense with color
        case CHANNEL.STROKEDASH:
            return scaleType === 'ordinal' || isContinuousToDiscrete(scaleType);
        case CHANNEL.SHAPE:
            return scaleType === 'ordinal'; // shape = lookup only
    }
}
exports.channelSupportScaleType = channelSupportScaleType;
//# sourceMappingURL=scale.js.map