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
exports.rectBinRef = exports.rectBinPosition = exports.rectPosition = void 0;
const vega_util_1 = require("vega-util");
const bin_1 = require("../../../bin");
const channel_1 = require("../../../channel");
const channeldef_1 = require("../../../channeldef");
const config_1 = require("../../../config");
const log = __importStar(require("../../../log"));
const scale_1 = require("../../../scale");
const util_1 = require("../../../util");
const vega_schema_1 = require("../../../vega.schema");
const common_1 = require("../../common");
const nonposition_1 = require("./nonposition");
const offset_1 = require("./offset");
const position_align_1 = require("./position-align");
const position_point_1 = require("./position-point");
const position_range_1 = require("./position-range");
const ref = __importStar(require("./valueref"));
function rectPosition(model, channel, mark) {
    var _a, _b, _c, _d;
    const { config, encoding, markDef, stack } = model;
    const channel2 = channel_1.getSecondaryRangeChannel(channel);
    const sizeChannel = channel_1.getSizeChannel(channel);
    const channelDef = encoding[channel];
    const channelDef2 = encoding[channel2];
    const scale = model.getScaleComponent(channel);
    const scaleType = scale ? scale.get('type') : undefined;
    const scaleName = model.scaleName(channel);
    const orient = markDef.orient;
    const hasSizeDef = (_b = (_a = encoding[sizeChannel]) !== null && _a !== void 0 ? _a : encoding.size) !== null && _b !== void 0 ? _b : common_1.getMarkPropOrConfig('size', markDef, config, { vgChannel: sizeChannel });
    const isBarBand = mark === 'bar' && (channel === 'x' ? orient === 'vertical' : orient === 'horizontal');
    // x, x2, and width -- we must specify two of these in all conditions
    if (channeldef_1.isFieldDef(channelDef) &&
        (bin_1.isBinning(channelDef.bin) || bin_1.isBinned(channelDef.bin) || (channelDef.timeUnit && !channelDef2)) &&
        !hasSizeDef &&
        !scale_1.hasDiscreteDomain(scaleType)) {
        const band = channeldef_1.getBand({ channel, fieldDef: channelDef, stack, markDef, config });
        const axis = (_c = model.component.axes[channel]) === null || _c === void 0 ? void 0 : _c[0];
        const axisTranslate = (_d = axis === null || axis === void 0 ? void 0 : axis.get('translate')) !== null && _d !== void 0 ? _d : 0.5; // vega default is 0.5
        return rectBinPosition({
            fieldDef: channelDef,
            fieldDef2: channelDef2,
            channel,
            markDef,
            scaleName,
            band,
            axisTranslate,
            spacing: channel_1.isXorY(channel) ? common_1.getMarkPropOrConfig('binSpacing', markDef, config) : undefined,
            reverse: scale.get('reverse'),
            config
        });
    }
    else if (((channeldef_1.isFieldOrDatumDef(channelDef) && scale_1.hasDiscreteDomain(scaleType)) || isBarBand) && !channelDef2) {
        return positionAndSize(mark, channelDef, channel, model);
    }
    else {
        return position_range_1.rangePosition(channel, model, { defaultPos: 'zeroOrMax', defaultPos2: 'zeroOrMin' });
    }
}
exports.rectPosition = rectPosition;
function defaultSizeRef(mark, sizeChannel, scaleName, scale, config, band) {
    if (scale) {
        const scaleType = scale.get('type');
        if (scaleType === 'point' || scaleType === 'band') {
            if (config[mark].discreteBandSize !== undefined) {
                return { value: config[mark].discreteBandSize };
            }
            if (scaleType === scale_1.ScaleType.POINT) {
                const scaleRange = scale.get('range');
                if (vega_schema_1.isVgRangeStep(scaleRange) && vega_util_1.isNumber(scaleRange.step)) {
                    return { value: scaleRange.step - 2 };
                }
                return { value: config_1.DEFAULT_STEP - 2 };
            }
            else {
                // BAND
                return { scale: scaleName, band };
            }
        }
        else {
            // continuous scale
            return { value: config[mark].continuousBandSize };
        }
    }
    // No Scale
    const step = config_1.getViewConfigDiscreteStep(config.view, sizeChannel);
    const value = util_1.getFirstDefined(
    // No scale is like discrete bar (with one item)
    config[mark].discreteBandSize, step - 2);
    return value !== undefined ? { value } : undefined;
}
/**
 * Output position encoding and its size encoding for continuous, point, and band scales.
 */
function positionAndSize(mark, fieldDef, channel, model) {
    var _a;
    const { markDef, encoding, config, stack } = model;
    const orient = markDef.orient;
    const scaleName = model.scaleName(channel);
    const scale = model.getScaleComponent(channel);
    const vgSizeChannel = channel_1.getSizeChannel(channel);
    const channel2 = channel_1.getSecondaryRangeChannel(channel);
    // use "size" channel for bars, if there is orient and the channel matches the right orientation
    const useVlSizeChannel = (orient === 'horizontal' && channel === 'y') || (orient === 'vertical' && channel === 'x');
    const sizeFromMarkOrConfig = common_1.getMarkPropOrConfig(useVlSizeChannel ? 'size' : vgSizeChannel, markDef, config, {
        vgChannel: vgSizeChannel
    });
    // Use size encoding / mark property / config if it exists
    let sizeMixins;
    if (encoding.size || sizeFromMarkOrConfig !== undefined) {
        if (useVlSizeChannel) {
            sizeMixins = nonposition_1.nonPosition('size', model, { vgChannel: vgSizeChannel, defaultValue: sizeFromMarkOrConfig });
        }
        else {
            log.warn(log.message.cannotApplySizeToNonOrientedMark(markDef.type));
        }
    }
    // Otherwise, apply default value
    const band = (_a = (channeldef_1.isFieldOrDatumDef(fieldDef) ? channeldef_1.getBand({ channel, fieldDef, markDef, stack, config }) : undefined)) !== null && _a !== void 0 ? _a : 1;
    sizeMixins = sizeMixins || { [vgSizeChannel]: defaultSizeRef(mark, vgSizeChannel, scaleName, scale, config, band) };
    /*
      Band scales with size value and all point scales, use xc/yc + band=0.5
  
      Otherwise (band scales that has size based on a band ref), use x/y with position band = (1 - size_band) / 2.
      In this case, size_band is the band specified in the x/y-encoding.
      By default band is 1, so `(1 - band) / 2` = 0.
      If band is 0.6, the the x/y position in such case should be `(1 - band) / 2` = 0.2
     */
    const center = (scale === null || scale === void 0 ? void 0 : scale.get('type')) !== 'band' || !('band' in sizeMixins[vgSizeChannel]);
    const vgChannel = position_align_1.vgAlignedPositionChannel(channel, markDef, config, center ? 'middle' : 'top');
    const offset = offset_1.getOffset(channel, markDef);
    const posRef = ref.midPointRefWithPositionInvalidTest({
        channel,
        channelDef: fieldDef,
        markDef,
        config,
        scaleName,
        scale,
        stack,
        offset,
        defaultRef: position_point_1.pointPositionDefaultRef({ model, defaultPos: 'mid', channel, scaleName, scale }),
        band: center ? 0.5 : (1 - band) / 2
    });
    if (vgSizeChannel) {
        return Object.assign({ [vgChannel]: posRef }, sizeMixins);
    }
    else {
        // otherwise, we must simulate size by setting position2 = position + size
        // (for theta/radius since Vega doesn't have thetaWidth/radiusWidth)
        const vgChannel2 = channel_1.getVgPositionChannel(channel2);
        const sizeRef = sizeMixins[vgSizeChannel];
        const sizeOffset = offset ? Object.assign(Object.assign({}, sizeRef), { offset }) : sizeRef;
        return {
            [vgChannel]: posRef,
            // posRef might be an array that wraps position invalid test
            [vgChannel2]: vega_util_1.isArray(posRef)
                ? [posRef[0], Object.assign(Object.assign({}, posRef[1]), { offset: sizeOffset })]
                : Object.assign(Object.assign({}, posRef), { offset: sizeOffset })
        };
    }
}
function getBinSpacing(channel, spacing, reverse, translate, offset) {
    if (channel_1.isPolarPositionChannel(channel)) {
        return 0;
    }
    const spacingOffset = channel === 'x' || channel === 'y2' ? -spacing / 2 : spacing / 2;
    if (vega_schema_1.isSignalRef(reverse) || vega_schema_1.isSignalRef(offset) || vega_schema_1.isSignalRef(translate)) {
        const reverseExpr = common_1.signalOrStringValue(reverse);
        const offsetExpr = common_1.signalOrStringValue(offset);
        const translateExpr = common_1.signalOrStringValue(translate);
        const t = translateExpr ? `${translateExpr} + ` : '';
        const r = reverseExpr ? `(${reverseExpr} ? -1 : 1) * ` : '';
        const o = offsetExpr ? `(${offsetExpr} + ${spacingOffset})` : spacingOffset;
        return {
            signal: t + r + o
        };
    }
    else {
        offset = offset || 0;
        return translate + (reverse ? -offset - spacingOffset : +offset + spacingOffset);
    }
}
function rectBinPosition({ fieldDef, fieldDef2, channel, band, scaleName, markDef, spacing = 0, axisTranslate, reverse, config }) {
    const channel2 = channel_1.getSecondaryRangeChannel(channel);
    const vgChannel = channel_1.getVgPositionChannel(channel);
    const vgChannel2 = channel_1.getVgPositionChannel(channel2);
    const offset = offset_1.getOffset(channel, markDef);
    if (bin_1.isBinning(fieldDef.bin) || fieldDef.timeUnit) {
        return {
            [vgChannel2]: rectBinRef({
                channel,
                fieldDef,
                scaleName,
                markDef,
                band: (1 - band) / 2,
                offset: getBinSpacing(channel2, spacing, reverse, axisTranslate, offset),
                config
            }),
            [vgChannel]: rectBinRef({
                channel,
                fieldDef,
                scaleName,
                markDef,
                band: 1 - (1 - band) / 2,
                offset: getBinSpacing(channel, spacing, reverse, axisTranslate, offset),
                config
            })
        };
    }
    else if (bin_1.isBinned(fieldDef.bin)) {
        const startRef = ref.valueRefForFieldOrDatumDef(fieldDef, scaleName, {}, { offset: getBinSpacing(channel2, spacing, reverse, axisTranslate, offset) });
        if (channeldef_1.isFieldDef(fieldDef2)) {
            return {
                [vgChannel2]: startRef,
                [vgChannel]: ref.valueRefForFieldOrDatumDef(fieldDef2, scaleName, {}, { offset: getBinSpacing(channel, spacing, reverse, axisTranslate, offset) })
            };
        }
        else if (bin_1.isBinParams(fieldDef.bin) && fieldDef.bin.step) {
            return {
                [vgChannel2]: startRef,
                [vgChannel]: {
                    signal: `scale("${scaleName}", ${channeldef_1.vgField(fieldDef, { expr: 'datum' })} + ${fieldDef.bin.step})`,
                    offset: getBinSpacing(channel, spacing, reverse, axisTranslate, offset)
                }
            };
        }
    }
    log.warn(log.message.channelRequiredForBinned(channel2));
    return undefined;
}
exports.rectBinPosition = rectBinPosition;
/**
 * Value Ref for binned fields
 */
function rectBinRef({ channel, fieldDef, scaleName, markDef, band, offset, config }) {
    const r = ref.interpolatedSignalRef({
        scaleName,
        fieldOrDatumDef: fieldDef,
        band,
        offset
    });
    return ref.wrapPositionInvalidTest({
        fieldDef,
        channel,
        markDef,
        ref: r,
        config
    });
}
exports.rectBinRef = rectBinRef;
//# sourceMappingURL=position-rect.js.map