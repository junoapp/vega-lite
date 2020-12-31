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
exports.MAX_SIZE_RANGE_STEP_RATIO = exports.interpolateRange = exports.defaultContinuousToDiscreteCount = exports.parseRangeForChannel = exports.parseUnitScaleRange = exports.RANGE_PROPERTIES = void 0;
const vega_util_1 = require("vega-util");
const bin_1 = require("../../bin");
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const config_1 = require("../../config");
const data_1 = require("../../data");
const log = __importStar(require("../../log"));
const scale_1 = require("../../scale");
const base_1 = require("../../spec/base");
const util = __importStar(require("../../util"));
const vega_schema_1 = require("../../vega.schema");
const common_1 = require("../common");
const bin_2 = require("../data/bin");
const signal_1 = require("../signal");
const split_1 = require("../split");
exports.RANGE_PROPERTIES = ['range', 'scheme'];
function getSizeChannel(channel) {
    return channel === 'x' ? 'width' : channel === 'y' ? 'height' : undefined;
}
function parseUnitScaleRange(model) {
    const localScaleComponents = model.component.scales;
    // use SCALE_CHANNELS instead of scales[channel] to ensure that x, y come first!
    for (const channel of channel_1.SCALE_CHANNELS) {
        const localScaleCmpt = localScaleComponents[channel];
        if (!localScaleCmpt) {
            continue;
        }
        const rangeWithExplicit = parseRangeForChannel(channel, model);
        localScaleCmpt.setWithExplicit('range', rangeWithExplicit);
    }
}
exports.parseUnitScaleRange = parseUnitScaleRange;
function getBinStepSignal(model, channel) {
    const fieldDef = model.fieldDef(channel);
    if (fieldDef === null || fieldDef === void 0 ? void 0 : fieldDef.bin) {
        const { bin, field } = fieldDef;
        const sizeType = getSizeChannel(channel);
        const sizeSignal = model.getName(sizeType);
        if (vega_util_1.isObject(bin) && bin.binned && bin.step !== undefined) {
            return new signal_1.SignalRefWrapper(() => {
                const scaleName = model.scaleName(channel);
                const binCount = `(domain("${scaleName}")[1] - domain("${scaleName}")[0]) / ${bin.step}`;
                return `${model.getSignalName(sizeSignal)} / (${binCount})`;
            });
        }
        else if (bin_1.isBinning(bin)) {
            const binSignal = bin_2.getBinSignalName(model, field, bin);
            // TODO: extract this to be range step signal
            return new signal_1.SignalRefWrapper(() => {
                const updatedName = model.getSignalName(binSignal);
                const binCount = `(${updatedName}.stop - ${updatedName}.start) / ${updatedName}.step`;
                return `${model.getSignalName(sizeSignal)} / (${binCount})`;
            });
        }
    }
    return undefined;
}
/**
 * Return mixins that includes one of the Vega range types (explicit range, range.step, range.scheme).
 */
function parseRangeForChannel(channel, model) {
    const specifiedScale = model.specifiedScales[channel];
    const { size } = model;
    const mergedScaleCmpt = model.getScaleComponent(channel);
    const scaleType = mergedScaleCmpt.get('type');
    // Check if any of the range properties is specified.
    // If so, check if it is compatible and make sure that we only output one of the properties
    for (const property of exports.RANGE_PROPERTIES) {
        if (specifiedScale[property] !== undefined) {
            const supportedByScaleType = scale_1.scaleTypeSupportProperty(scaleType, property);
            const channelIncompatability = scale_1.channelScalePropertyIncompatability(channel, property);
            if (!supportedByScaleType) {
                log.warn(log.message.scalePropertyNotWorkWithScaleType(scaleType, property, channel));
            }
            else if (channelIncompatability) {
                // channel
                log.warn(channelIncompatability);
            }
            else {
                switch (property) {
                    case 'range': {
                        const range = specifiedScale.range;
                        if (vega_util_1.isArray(range)) {
                            if (channel_1.isXorY(channel)) {
                                return split_1.makeExplicit(range.map(v => {
                                    if (v === 'width' || v === 'height') {
                                        // get signal for width/height
                                        // Just like default range logic below, we use SignalRefWrapper to account for potential merges and renames.
                                        const sizeSignal = model.getName(v);
                                        const getSignalName = model.getSignalName.bind(model);
                                        return signal_1.SignalRefWrapper.fromName(getSignalName, sizeSignal);
                                    }
                                    return v;
                                }));
                            }
                        }
                        else if (vega_util_1.isObject(range)) {
                            return split_1.makeExplicit({
                                data: model.requestDataName(data_1.DataSourceType.Main),
                                field: range.field,
                                sort: { op: 'min', field: model.vgField(channel) }
                            });
                        }
                        return split_1.makeExplicit(range);
                    }
                    case 'scheme':
                        return split_1.makeExplicit(parseScheme(specifiedScale[property]));
                }
            }
        }
    }
    if (channel === channel_1.X || channel === channel_1.Y) {
        const sizeChannel = channel === channel_1.X ? 'width' : 'height';
        const sizeValue = size[sizeChannel];
        if (base_1.isStep(sizeValue)) {
            if (scale_1.hasDiscreteDomain(scaleType)) {
                return split_1.makeExplicit({ step: sizeValue.step });
            }
            else {
                log.warn(log.message.stepDropped(sizeChannel));
            }
        }
    }
    const { rangeMin, rangeMax } = specifiedScale;
    const d = defaultRange(channel, model);
    if ((rangeMin !== undefined || rangeMax !== undefined) &&
        // it's ok to check just rangeMin's compatibility since rangeMin/rangeMax are the same
        scale_1.scaleTypeSupportProperty(scaleType, 'rangeMin') &&
        vega_util_1.isArray(d) &&
        d.length === 2) {
        return split_1.makeExplicit([rangeMin !== null && rangeMin !== void 0 ? rangeMin : d[0], rangeMax !== null && rangeMax !== void 0 ? rangeMax : d[1]]);
    }
    return split_1.makeImplicit(d);
}
exports.parseRangeForChannel = parseRangeForChannel;
function parseScheme(scheme) {
    if (scale_1.isExtendedScheme(scheme)) {
        return Object.assign({ scheme: scheme.name }, util.omit(scheme, ['name']));
    }
    return { scheme: scheme };
}
function defaultRange(channel, model) {
    const { size, config, mark, encoding } = model;
    const getSignalName = model.getSignalName.bind(model);
    const { type } = channeldef_1.getFieldOrDatumDef(encoding[channel]);
    const mergedScaleCmpt = model.getScaleComponent(channel);
    const scaleType = mergedScaleCmpt.get('type');
    const { domain, domainMid } = model.specifiedScales[channel];
    switch (channel) {
        case channel_1.X:
        case channel_1.Y: {
            // If there is no explicit width/height for discrete x/y scales
            if (util.contains(['point', 'band'], scaleType)) {
                if (channel === channel_1.X && !size.width) {
                    const w = config_1.getViewConfigDiscreteSize(config.view, 'width');
                    if (base_1.isStep(w)) {
                        return w;
                    }
                }
                else if (channel === channel_1.Y && !size.height) {
                    const h = config_1.getViewConfigDiscreteSize(config.view, 'height');
                    if (base_1.isStep(h)) {
                        return h;
                    }
                }
            }
            // If step is null, use zero to width or height.
            // Note that we use SignalRefWrapper to account for potential merges and renames.
            const sizeType = getSizeChannel(channel);
            const sizeSignal = model.getName(sizeType);
            if (channel === channel_1.Y && scale_1.hasContinuousDomain(scaleType)) {
                // For y continuous scale, we have to start from the height as the bottom part has the max value.
                return [signal_1.SignalRefWrapper.fromName(getSignalName, sizeSignal), 0];
            }
            else {
                return [0, signal_1.SignalRefWrapper.fromName(getSignalName, sizeSignal)];
            }
        }
        case channel_1.SIZE: {
            // TODO: support custom rangeMin, rangeMax
            const zero = model.component.scales[channel].get('zero');
            const rangeMin = sizeRangeMin(mark, zero, config);
            const rangeMax = sizeRangeMax(mark, size, model, config);
            if (scale_1.isContinuousToDiscrete(scaleType)) {
                return interpolateRange(rangeMin, rangeMax, defaultContinuousToDiscreteCount(scaleType, config, domain, channel));
            }
            else {
                return [rangeMin, rangeMax];
            }
        }
        case channel_1.THETA:
            return [0, Math.PI * 2];
        case channel_1.ANGLE:
            // TODO: add config.scale.min/maxAngleDegree (for point and text) and config.scale.min/maxAngleRadian (for arc) once we add arc marks.
            // (It's weird to add just config.scale.min/maxAngleDegree for now)
            return [0, 360];
        case channel_1.RADIUS: {
            // max radius = half od min(width,height)
            return [
                0,
                new signal_1.SignalRefWrapper(() => {
                    const w = model.getSignalName('width');
                    const h = model.getSignalName('height');
                    return `min(${w},${h})/2`;
                })
            ];
        }
        case channel_1.STROKEWIDTH:
            // TODO: support custom rangeMin, rangeMax
            return [config.scale.minStrokeWidth, config.scale.maxStrokeWidth];
        case channel_1.STROKEDASH:
            return [
                // TODO: add this to Vega's config.range?
                [1, 0],
                [4, 2],
                [2, 1],
                [1, 1],
                [1, 2, 4, 2]
            ];
        case channel_1.SHAPE:
            return 'symbol';
        case channel_1.COLOR:
        case channel_1.FILL:
        case channel_1.STROKE:
            if (scaleType === 'ordinal') {
                // Only nominal data uses ordinal scale by default
                return type === 'nominal' ? 'category' : 'ordinal';
            }
            else {
                if (domainMid !== undefined) {
                    return 'diverging';
                }
                else {
                    return mark === 'rect' || mark === 'geoshape' ? 'heatmap' : 'ramp';
                }
            }
        case channel_1.OPACITY:
        case channel_1.FILLOPACITY:
        case channel_1.STROKEOPACITY:
            // TODO: support custom rangeMin, rangeMax
            return [config.scale.minOpacity, config.scale.maxOpacity];
    }
    /* istanbul ignore next: should never reach here */
    throw new Error(`Scale range undefined for channel ${channel}`);
}
function defaultContinuousToDiscreteCount(scaleType, config, domain, channel) {
    switch (scaleType) {
        case 'quantile':
            return config.scale.quantileCount;
        case 'quantize':
            return config.scale.quantizeCount;
        case 'threshold':
            if (domain !== undefined && vega_util_1.isArray(domain)) {
                return domain.length + 1;
            }
            else {
                log.warn(log.message.domainRequiredForThresholdScale(channel));
                // default threshold boundaries for threshold scale since domain has cardinality of 2
                return 3;
            }
    }
}
exports.defaultContinuousToDiscreteCount = defaultContinuousToDiscreteCount;
/**
 * Returns the linear interpolation of the range according to the cardinality
 *
 * @param rangeMin start of the range
 * @param rangeMax end of the range
 * @param cardinality number of values in the output range
 */
function interpolateRange(rangeMin, rangeMax, cardinality) {
    // always return a signal since it's better to compute the sequence in Vega later
    const f = () => {
        const rMax = common_1.signalOrStringValue(rangeMax);
        const rMin = common_1.signalOrStringValue(rangeMin);
        const step = `(${rMax} - ${rMin}) / (${cardinality} - 1)`;
        return `sequence(${rMin}, ${rMax} + ${step}, ${step})`;
    };
    if (vega_schema_1.isSignalRef(rangeMax)) {
        return new signal_1.SignalRefWrapper(f);
    }
    else {
        return { signal: f() };
    }
}
exports.interpolateRange = interpolateRange;
function sizeRangeMin(mark, zero, config) {
    if (zero) {
        if (vega_schema_1.isSignalRef(zero)) {
            return { signal: `${zero.signal} ? 0 : ${sizeRangeMin(mark, false, config)}` };
        }
        else {
            return 0;
        }
    }
    switch (mark) {
        case 'bar':
        case 'tick':
            return config.scale.minBandSize;
        case 'line':
        case 'trail':
        case 'rule':
            return config.scale.minStrokeWidth;
        case 'text':
            return config.scale.minFontSize;
        case 'point':
        case 'square':
        case 'circle':
            return config.scale.minSize;
    }
    /* istanbul ignore next: should never reach here */
    // sizeRangeMin not implemented for the mark
    throw new Error(log.message.incompatibleChannel('size', mark));
}
exports.MAX_SIZE_RANGE_STEP_RATIO = 0.95;
function sizeRangeMax(mark, size, model, config) {
    const xyStepSignals = {
        x: getBinStepSignal(model, 'x'),
        y: getBinStepSignal(model, 'y')
    };
    switch (mark) {
        case 'bar':
        case 'tick': {
            if (config.scale.maxBandSize !== undefined) {
                return config.scale.maxBandSize;
            }
            const min = minXYStep(size, xyStepSignals, config.view);
            if (vega_util_1.isNumber(min)) {
                return min - 1;
            }
            else {
                return new signal_1.SignalRefWrapper(() => `${min.signal} - 1`);
            }
        }
        case 'line':
        case 'trail':
        case 'rule':
            return config.scale.maxStrokeWidth;
        case 'text':
            return config.scale.maxFontSize;
        case 'point':
        case 'square':
        case 'circle': {
            if (config.scale.maxSize) {
                return config.scale.maxSize;
            }
            const pointStep = minXYStep(size, xyStepSignals, config.view);
            if (vega_util_1.isNumber(pointStep)) {
                return Math.pow(exports.MAX_SIZE_RANGE_STEP_RATIO * pointStep, 2);
            }
            else {
                return new signal_1.SignalRefWrapper(() => `pow(${exports.MAX_SIZE_RANGE_STEP_RATIO} * ${pointStep.signal}, 2)`);
            }
        }
    }
    /* istanbul ignore next: should never reach here */
    // sizeRangeMax not implemented for the mark
    throw new Error(log.message.incompatibleChannel('size', mark));
}
/**
 * @returns {number} Range step of x or y or minimum between the two if both are ordinal scale.
 */
function minXYStep(size, xyStepSignals, viewConfig) {
    const widthStep = base_1.isStep(size.width) ? size.width.step : config_1.getViewConfigDiscreteStep(viewConfig, 'width');
    const heightStep = base_1.isStep(size.height) ? size.height.step : config_1.getViewConfigDiscreteStep(viewConfig, 'height');
    if (xyStepSignals.x || xyStepSignals.y) {
        return new signal_1.SignalRefWrapper(() => {
            const exprs = [
                xyStepSignals.x ? xyStepSignals.x.signal : widthStep,
                xyStepSignals.y ? xyStepSignals.y.signal : heightStep
            ];
            return `min(${exprs.join(', ')})`;
        });
    }
    return Math.min(widthStep, heightStep);
}
//# sourceMappingURL=range.js.map