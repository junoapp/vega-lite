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
exports.zero = exports.reverse = exports.paddingOuter = exports.paddingInner = exports.padding = exports.nice = exports.interpolate = exports.bins = exports.parseNonUnitScaleProperty = exports.parseScaleRange = exports.scaleRules = exports.parseScaleProperty = void 0;
const vega_util_1 = require("vega-util");
const bin_1 = require("../../bin");
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const datetime_1 = require("../../datetime");
const log = __importStar(require("../../log"));
const scale_1 = require("../../scale");
const util = __importStar(require("../../util"));
const util_1 = require("../../util");
const vega_schema_1 = require("../../vega.schema");
const bin_2 = require("../data/bin");
const model_1 = require("../model");
const signal_1 = require("../signal");
const split_1 = require("../split");
const range_1 = require("./range");
function parseScaleProperty(model, property) {
    if (model_1.isUnitModel(model)) {
        parseUnitScaleProperty(model, property);
    }
    else {
        parseNonUnitScaleProperty(model, property);
    }
}
exports.parseScaleProperty = parseScaleProperty;
function parseUnitScaleProperty(model, property) {
    const localScaleComponents = model.component.scales;
    const { config, encoding, markDef, specifiedScales } = model;
    for (const channel of util_1.keys(localScaleComponents)) {
        const specifiedScale = specifiedScales[channel];
        const localScaleCmpt = localScaleComponents[channel];
        const mergedScaleCmpt = model.getScaleComponent(channel);
        const fieldOrDatumDef = channeldef_1.getFieldOrDatumDef(encoding[channel]);
        const specifiedValue = specifiedScale[property];
        const scaleType = mergedScaleCmpt.get('type');
        const scalePadding = mergedScaleCmpt.get('padding');
        const scalePaddingInner = mergedScaleCmpt.get('paddingInner');
        const supportedByScaleType = scale_1.scaleTypeSupportProperty(scaleType, property);
        const channelIncompatability = scale_1.channelScalePropertyIncompatability(channel, property);
        if (specifiedValue !== undefined) {
            // If there is a specified value, check if it is compatible with scale type and channel
            if (!supportedByScaleType) {
                log.warn(log.message.scalePropertyNotWorkWithScaleType(scaleType, property, channel));
            }
            else if (channelIncompatability) {
                // channel
                log.warn(channelIncompatability);
            }
        }
        if (supportedByScaleType && channelIncompatability === undefined) {
            if (specifiedValue !== undefined) {
                const timeUnit = fieldOrDatumDef['timeUnit'];
                const type = fieldOrDatumDef.type;
                switch (property) {
                    // domainMax/Min to signal if the value is a datetime object
                    case 'domainMax':
                    case 'domainMin':
                        if (datetime_1.isDateTime(specifiedScale[property]) || type === 'temporal' || timeUnit) {
                            localScaleCmpt.set(property, { signal: channeldef_1.valueExpr(specifiedScale[property], { type, timeUnit }) }, true);
                        }
                        else {
                            localScaleCmpt.set(property, specifiedScale[property], true);
                        }
                        break;
                    default:
                        localScaleCmpt.copyKeyFromObject(property, specifiedScale);
                }
            }
            else {
                const value = property in exports.scaleRules
                    ? exports.scaleRules[property]({
                        model,
                        channel,
                        fieldOrDatumDef,
                        scaleType,
                        scalePadding,
                        scalePaddingInner,
                        domain: specifiedScale.domain,
                        markDef,
                        config
                    })
                    : config.scale[property];
                if (value !== undefined) {
                    localScaleCmpt.set(property, value, false);
                }
            }
        }
    }
}
exports.scaleRules = {
    bins: ({ model, fieldOrDatumDef }) => (channeldef_1.isFieldDef(fieldOrDatumDef) ? bins(model, fieldOrDatumDef) : undefined),
    interpolate: ({ channel, fieldOrDatumDef }) => interpolate(channel, fieldOrDatumDef.type),
    nice: ({ scaleType, channel, fieldOrDatumDef }) => nice(scaleType, channel, fieldOrDatumDef),
    padding: ({ channel, scaleType, fieldOrDatumDef, markDef, config }) => padding(channel, scaleType, config.scale, fieldOrDatumDef, markDef, config.bar),
    paddingInner: ({ scalePadding, channel, markDef, config }) => paddingInner(scalePadding, channel, markDef.type, config.scale),
    paddingOuter: ({ scalePadding, channel, scaleType, markDef, scalePaddingInner, config }) => paddingOuter(scalePadding, channel, scaleType, markDef.type, scalePaddingInner, config.scale),
    reverse: ({ fieldOrDatumDef, scaleType, channel, config }) => {
        const sort = channeldef_1.isFieldDef(fieldOrDatumDef) ? fieldOrDatumDef.sort : undefined;
        return reverse(scaleType, sort, channel, config.scale);
    },
    zero: ({ channel, fieldOrDatumDef, domain, markDef, scaleType }) => zero(channel, fieldOrDatumDef, domain, markDef, scaleType)
};
// This method is here rather than in range.ts to avoid circular dependency.
function parseScaleRange(model) {
    if (model_1.isUnitModel(model)) {
        range_1.parseUnitScaleRange(model);
    }
    else {
        parseNonUnitScaleProperty(model, 'range');
    }
}
exports.parseScaleRange = parseScaleRange;
function parseNonUnitScaleProperty(model, property) {
    const localScaleComponents = model.component.scales;
    for (const child of model.children) {
        if (property === 'range') {
            parseScaleRange(child);
        }
        else {
            parseScaleProperty(child, property);
        }
    }
    for (const channel of util_1.keys(localScaleComponents)) {
        let valueWithExplicit;
        for (const child of model.children) {
            const childComponent = child.component.scales[channel];
            if (childComponent) {
                const childValueWithExplicit = childComponent.getWithExplicit(property);
                valueWithExplicit = split_1.mergeValuesWithExplicit(valueWithExplicit, childValueWithExplicit, property, 'scale', split_1.tieBreakByComparing((v1, v2) => {
                    switch (property) {
                        case 'range':
                            // For step, prefer larger step
                            if (v1.step && v2.step) {
                                return v1.step - v2.step;
                            }
                            return 0;
                        // TODO: precedence rule for other properties
                    }
                    return 0;
                }));
            }
        }
        localScaleComponents[channel].setWithExplicit(property, valueWithExplicit);
    }
}
exports.parseNonUnitScaleProperty = parseNonUnitScaleProperty;
function bins(model, fieldDef) {
    const bin = fieldDef.bin;
    if (bin_1.isBinning(bin)) {
        const binSignal = bin_2.getBinSignalName(model, fieldDef.field, bin);
        return new signal_1.SignalRefWrapper(() => {
            return model.getSignalName(binSignal);
        });
    }
    else if (bin_1.isBinned(bin) && bin_1.isBinParams(bin) && bin.step !== undefined) {
        // start and stop will be determined from the scale domain
        return {
            step: bin.step
        };
    }
    return undefined;
}
exports.bins = bins;
function interpolate(channel, type) {
    if (util_1.contains([channel_1.COLOR, channel_1.FILL, channel_1.STROKE], channel) && type !== 'nominal') {
        return 'hcl';
    }
    return undefined;
}
exports.interpolate = interpolate;
function nice(scaleType, channel, fieldOrDatumDef) {
    var _a;
    if (((_a = channeldef_1.getFieldDef(fieldOrDatumDef)) === null || _a === void 0 ? void 0 : _a.bin) || util.contains([scale_1.ScaleType.TIME, scale_1.ScaleType.UTC], scaleType)) {
        return undefined;
    }
    return channel in channel_1.POSITION_SCALE_CHANNEL_INDEX ? true : undefined;
}
exports.nice = nice;
function padding(channel, scaleType, scaleConfig, fieldOrDatumDef, markDef, barConfig) {
    if (channel in channel_1.POSITION_SCALE_CHANNEL_INDEX) {
        if (scale_1.isContinuousToContinuous(scaleType)) {
            if (scaleConfig.continuousPadding !== undefined) {
                return scaleConfig.continuousPadding;
            }
            const { type, orient } = markDef;
            if (type === 'bar' && !(channeldef_1.isFieldDef(fieldOrDatumDef) && (fieldOrDatumDef.bin || fieldOrDatumDef.timeUnit))) {
                if ((orient === 'vertical' && channel === 'x') || (orient === 'horizontal' && channel === 'y')) {
                    return barConfig.continuousBandSize;
                }
            }
        }
        if (scaleType === scale_1.ScaleType.POINT) {
            return scaleConfig.pointPadding;
        }
    }
    return undefined;
}
exports.padding = padding;
function paddingInner(paddingValue, channel, mark, scaleConfig) {
    if (paddingValue !== undefined) {
        // If user has already manually specified "padding", no need to add default paddingInner.
        return undefined;
    }
    if (channel in channel_1.POSITION_SCALE_CHANNEL_INDEX) {
        // Padding is only set for X and Y by default.
        // Basically it doesn't make sense to add padding for color and size.
        // paddingOuter would only be called if it's a band scale, just return the default for bandScale.
        const { bandPaddingInner, barBandPaddingInner, rectBandPaddingInner } = scaleConfig;
        return util_1.getFirstDefined(bandPaddingInner, mark === 'bar' ? barBandPaddingInner : rectBandPaddingInner);
    }
    return undefined;
}
exports.paddingInner = paddingInner;
function paddingOuter(paddingValue, channel, scaleType, mark, paddingInnerValue, scaleConfig) {
    if (paddingValue !== undefined) {
        // If user has already manually specified "padding", no need to add default paddingOuter.
        return undefined;
    }
    if (channel in channel_1.POSITION_SCALE_CHANNEL_INDEX) {
        // Padding is only set for X and Y by default.
        // Basically it doesn't make sense to add padding for color and size.
        if (scaleType === scale_1.ScaleType.BAND) {
            const { bandPaddingOuter } = scaleConfig;
            return util_1.getFirstDefined(bandPaddingOuter, 
            /* By default, paddingOuter is paddingInner / 2. The reason is that
              size (width/height) = step * (cardinality - paddingInner + 2 * paddingOuter).
              and we want the width/height to be integer by default.
              Note that step (by default) and cardinality are integers.) */
            vega_schema_1.isSignalRef(paddingInnerValue) ? { signal: `${paddingInnerValue.signal}/2` } : paddingInnerValue / 2);
        }
    }
    return undefined;
}
exports.paddingOuter = paddingOuter;
function reverse(scaleType, sort, channel, scaleConfig) {
    if (channel === 'x' && scaleConfig.xReverse !== undefined) {
        if (scale_1.hasContinuousDomain(scaleType) && sort === 'descending') {
            if (vega_schema_1.isSignalRef(scaleConfig.xReverse)) {
                return { signal: `!${scaleConfig.xReverse.signal}` };
            }
            else {
                return !scaleConfig.xReverse;
            }
        }
        return scaleConfig.xReverse;
    }
    if (scale_1.hasContinuousDomain(scaleType) && sort === 'descending') {
        // For continuous domain scales, Vega does not support domain sort.
        // Thus, we reverse range instead if sort is descending
        return true;
    }
    return undefined;
}
exports.reverse = reverse;
function zero(channel, fieldDef, specifiedDomain, markDef, scaleType) {
    // If users explicitly provide a domain range, we should not augment zero as that will be unexpected.
    const hasCustomDomain = !!specifiedDomain && specifiedDomain !== 'unaggregated';
    if (hasCustomDomain) {
        if (scale_1.hasContinuousDomain(scaleType)) {
            if (vega_util_1.isArray(specifiedDomain)) {
                const first = specifiedDomain[0];
                const last = specifiedDomain[specifiedDomain.length - 1];
                if (first <= 0 && last >= 0) {
                    // if the domain includes zero, make zero remains true
                    return true;
                }
            }
            return false;
        }
    }
    // If there is no custom domain, return true only for the following cases:
    // 1) using quantitative field with size
    // While this can be either ratio or interval fields, our assumption is that
    // ratio are more common. However, if the scaleType is discretizing scale, we want to return
    // false so that range doesn't start at zero
    if (channel === 'size' && fieldDef.type === 'quantitative' && !scale_1.isContinuousToDiscrete(scaleType)) {
        return true;
    }
    // 2) non-binned, quantitative x-scale or y-scale
    // (For binning, we should not include zero by default because binning are calculated without zero.)
    if (!(channeldef_1.isFieldDef(fieldDef) && fieldDef.bin) &&
        util.contains([...channel_1.POSITION_SCALE_CHANNELS, ...channel_1.POLAR_POSITION_SCALE_CHANNELS], channel)) {
        const { orient, type } = markDef;
        if (util_1.contains(['bar', 'area', 'line', 'trail'], type)) {
            if ((orient === 'horizontal' && channel === 'y') || (orient === 'vertical' && channel === 'x')) {
                return false;
            }
        }
        return true;
    }
    return false;
}
exports.zero = zero;
//# sourceMappingURL=properties.js.map