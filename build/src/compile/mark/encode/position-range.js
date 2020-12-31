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
exports.position2Ref = exports.rangePosition = exports.pointOrRangePosition = void 0;
const channel_1 = require("../../../channel");
const channeldef_1 = require("../../../channeldef");
const common_1 = require("../../common");
const offset_1 = require("./offset");
const position_align_1 = require("./position-align");
const position_point_1 = require("./position-point");
const ref = __importStar(require("./valueref"));
/**
 * Utility for area/rule position, which can be either point or range. (One of the axes should be point and the other should be range.)
 */
function pointOrRangePosition(channel, model, { defaultPos, defaultPos2, range }) {
    if (range) {
        return rangePosition(channel, model, { defaultPos, defaultPos2 });
    }
    return position_point_1.pointPosition(channel, model, { defaultPos });
}
exports.pointOrRangePosition = pointOrRangePosition;
function rangePosition(channel, model, { defaultPos, defaultPos2 }) {
    const { markDef, config } = model;
    const channel2 = channel_1.getSecondaryRangeChannel(channel);
    const sizeChannel = channel_1.getSizeChannel(channel);
    const pos2Mixins = pointPosition2OrSize(model, defaultPos2, channel2);
    const vgChannel = pos2Mixins[sizeChannel]
        ? // If there is width/height, we need to position the marks based on the alignment.
            position_align_1.vgAlignedPositionChannel(channel, markDef, config)
        : // Otherwise, make sure to apply to the right Vg Channel (for arc mark)
            channel_1.getVgPositionChannel(channel);
    return Object.assign(Object.assign({}, position_point_1.pointPosition(channel, model, { defaultPos, vgChannel })), pos2Mixins);
}
exports.rangePosition = rangePosition;
/**
 * Return encode for x2, y2.
 * If channel is not specified, return one channel based on orientation.
 */
function pointPosition2OrSize(model, defaultPos, channel) {
    const { encoding, mark, markDef, stack, config } = model;
    const baseChannel = channel_1.getMainRangeChannel(channel);
    const sizeChannel = channel_1.getSizeChannel(channel);
    const vgChannel = channel_1.getVgPositionChannel(channel);
    const channelDef = encoding[baseChannel];
    const scaleName = model.scaleName(baseChannel);
    const scale = model.getScaleComponent(baseChannel);
    const offset = channel in encoding || channel in markDef
        ? offset_1.getOffset(channel, model.markDef)
        : offset_1.getOffset(baseChannel, model.markDef);
    if (!channelDef && (channel === 'x2' || channel === 'y2') && (encoding.latitude || encoding.longitude)) {
        // use geopoint output if there are lat2/long2 and there is no point position2 overriding lat2/long2.
        return { [vgChannel]: { field: model.getName(channel) } };
    }
    const valueRef = position2Ref({
        channel,
        channelDef,
        channel2Def: encoding[channel],
        markDef,
        config,
        scaleName,
        scale,
        stack,
        offset,
        defaultRef: undefined
    });
    if (valueRef !== undefined) {
        return { [vgChannel]: valueRef };
    }
    // TODO: check width/height encoding here once we add them
    // no x2/y2 encoding, then try to read x2/y2 or width/height based on precedence:
    // markDef > config.style > mark-specific config (config[mark]) > general mark config (config.mark)
    return (position2orSize(channel, markDef) ||
        position2orSize(channel, {
            [channel]: common_1.getMarkStyleConfig(channel, markDef, config.style),
            [sizeChannel]: common_1.getMarkStyleConfig(sizeChannel, markDef, config.style)
        }) ||
        position2orSize(channel, config[mark]) ||
        position2orSize(channel, config.mark) || {
        [vgChannel]: position_point_1.pointPositionDefaultRef({
            model,
            defaultPos,
            channel,
            scaleName,
            scale
        })()
    });
}
function position2Ref({ channel, channelDef, channel2Def, markDef, config, scaleName, scale, stack, offset, defaultRef }) {
    if (channeldef_1.isFieldOrDatumDef(channelDef) &&
        stack &&
        // If fieldChannel is X and channel is X2 (or Y and Y2)
        channel.charAt(0) === stack.fieldChannel.charAt(0)) {
        return ref.valueRefForFieldOrDatumDef(channelDef, scaleName, { suffix: 'start' }, { offset });
    }
    return ref.midPointRefWithPositionInvalidTest({
        channel,
        channelDef: channel2Def,
        scaleName,
        scale,
        stack,
        markDef,
        config,
        offset,
        defaultRef
    });
}
exports.position2Ref = position2Ref;
function position2orSize(channel, markDef) {
    const sizeChannel = channel_1.getSizeChannel(channel);
    const vgChannel = channel_1.getVgPositionChannel(channel);
    if (markDef[vgChannel] !== undefined) {
        return { [vgChannel]: ref.widthHeightValueOrSignalRef(channel, markDef[vgChannel]) };
    }
    else if (markDef[channel] !== undefined) {
        return { [vgChannel]: ref.widthHeightValueOrSignalRef(channel, markDef[channel]) };
    }
    else if (markDef[sizeChannel]) {
        return { [sizeChannel]: ref.widthHeightValueOrSignalRef(channel, markDef[sizeChannel]) };
    }
    return undefined;
}
//# sourceMappingURL=position-range.js.map