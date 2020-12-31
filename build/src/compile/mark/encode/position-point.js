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
exports.pointPositionDefaultRef = exports.positionRef = exports.pointPosition = void 0;
const channel_1 = require("../../../channel");
const channeldef_1 = require("../../../channeldef");
const scale_1 = require("../../../scale");
const util_1 = require("../../../util");
const common_1 = require("../../common");
const offset_1 = require("./offset");
const ref = __importStar(require("./valueref"));
/**
 * Return encode for point (non-band) position channels.
 */
function pointPosition(channel, model, { defaultPos, vgChannel, isMidPoint }) {
    const { encoding, markDef, config, stack } = model;
    const channelDef = encoding[channel];
    const channel2Def = encoding[channel_1.getSecondaryRangeChannel(channel)];
    const scaleName = model.scaleName(channel);
    const scale = model.getScaleComponent(channel);
    const offset = offset_1.getOffset(channel, markDef);
    // Get default position or position from mark def
    const defaultRef = pointPositionDefaultRef({
        model,
        defaultPos,
        channel,
        scaleName,
        scale
    });
    const valueRef = !channelDef && channel_1.isXorY(channel) && (encoding.latitude || encoding.longitude)
        ? // use geopoint output if there are lat/long and there is no point position overriding lat/long.
            { field: model.getName(channel) }
        : positionRef({
            channel,
            channelDef,
            channel2Def,
            markDef,
            config,
            isMidPoint,
            scaleName,
            scale,
            stack,
            offset,
            defaultRef
        });
    return valueRef ? { [vgChannel || channel]: valueRef } : undefined;
}
exports.pointPosition = pointPosition;
// TODO: we need to find a way to refactor these so that scaleName is a part of scale
// but that's complicated. For now, this is a huge step moving forward.
/**
 * @return Vega ValueRef for normal x- or y-position without projection
 */
function positionRef(params) {
    const { channel, channelDef, isMidPoint, scaleName, stack, offset, markDef, config } = params;
    // This isn't a part of midPoint because we use midPoint for non-position too
    if (channeldef_1.isFieldOrDatumDef(channelDef) && stack && channel === stack.fieldChannel) {
        if (channeldef_1.isFieldDef(channelDef)) {
            const band = channeldef_1.getBand({
                channel,
                fieldDef: channelDef,
                isMidPoint,
                markDef,
                stack,
                config
            });
            if (band !== undefined) {
                return ref.interpolatedSignalRef({
                    scaleName,
                    fieldOrDatumDef: channelDef,
                    startSuffix: 'start',
                    band,
                    offset
                });
            }
        }
        // x or y use stack_end so that stacked line's point mark use stack_end too.
        return ref.valueRefForFieldOrDatumDef(channelDef, scaleName, { suffix: 'end' }, { offset });
    }
    return ref.midPointRefWithPositionInvalidTest(params);
}
exports.positionRef = positionRef;
function pointPositionDefaultRef({ model, defaultPos, channel, scaleName, scale }) {
    const { markDef, config } = model;
    return () => {
        const mainChannel = channel_1.getMainRangeChannel(channel);
        const vgChannel = channel_1.getVgPositionChannel(channel);
        const definedValueOrConfig = common_1.getMarkPropOrConfig(channel, markDef, config, { vgChannel });
        if (definedValueOrConfig !== undefined) {
            return ref.widthHeightValueOrSignalRef(channel, definedValueOrConfig);
        }
        switch (defaultPos) {
            case 'zeroOrMin':
            case 'zeroOrMax':
                if (scaleName) {
                    const scaleType = scale.get('type');
                    if (util_1.contains([scale_1.ScaleType.LOG, scale_1.ScaleType.TIME, scale_1.ScaleType.UTC], scaleType)) {
                        // Log scales cannot have zero.
                        // Zero in time scale is arbitrary, and does not affect ratio.
                        // (Time is an interval level of measurement, not ratio).
                        // See https://en.wikipedia.org/wiki/Level_of_measurement for more info.
                    }
                    else {
                        if (scale.domainDefinitelyIncludesZero()) {
                            return {
                                scale: scaleName,
                                value: 0
                            };
                        }
                    }
                }
                if (defaultPos === 'zeroOrMin') {
                    return mainChannel === 'y' ? { field: { group: 'height' } } : { value: 0 };
                }
                else {
                    // zeroOrMax
                    switch (mainChannel) {
                        case 'radius':
                            // max of radius is min(width, height) / 2
                            return {
                                signal: `min(${model.width.signal},${model.height.signal})/2`
                            };
                        case 'theta':
                            return { signal: '2*PI' };
                        case 'x':
                            return { field: { group: 'width' } };
                        case 'y':
                            return { value: 0 };
                    }
                }
                break;
            case 'mid': {
                const sizeRef = model[channel_1.getSizeChannel(channel)];
                return Object.assign(Object.assign({}, sizeRef), { mult: 0.5 });
            }
        }
        // defaultPos === null
        return undefined;
    };
}
exports.pointPositionDefaultRef = pointPositionDefaultRef;
//# sourceMappingURL=position-point.js.map