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
exports.scaleType = void 0;
const bin_1 = require("../../bin");
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const log = __importStar(require("../../log"));
const scale_1 = require("../../scale");
const timeunit_1 = require("../../timeunit");
const util = __importStar(require("../../util"));
const channel_2 = require("./../../channel");
/**
 * Determine if there is a specified scale type and if it is appropriate,
 * or determine default type if type is unspecified or inappropriate.
 */
// NOTE: CompassQL uses this method.
function scaleType(specifiedScale, channel, fieldDef, mark) {
    const defaultScaleType = defaultType(channel, fieldDef, mark);
    const { type } = specifiedScale;
    if (!channel_1.isScaleChannel(channel)) {
        // There is no scale for these channels
        return null;
    }
    if (type !== undefined) {
        // Check if explicitly specified scale type is supported by the channel
        if (!scale_1.channelSupportScaleType(channel, type)) {
            log.warn(log.message.scaleTypeNotWorkWithChannel(channel, type, defaultScaleType));
            return defaultScaleType;
        }
        // Check if explicitly specified scale type is supported by the data type
        if (channeldef_1.isFieldDef(fieldDef) && !scale_1.scaleTypeSupportDataType(type, fieldDef.type)) {
            log.warn(log.message.scaleTypeNotWorkWithFieldDef(type, defaultScaleType));
            return defaultScaleType;
        }
        return type;
    }
    return defaultScaleType;
}
exports.scaleType = scaleType;
/**
 * Determine appropriate default scale type.
 */
// NOTE: Voyager uses this method.
function defaultType(channel, fieldDef, mark) {
    var _a;
    switch (fieldDef.type) {
        case 'nominal':
        case 'ordinal':
            if (channel_1.isColorChannel(channel) || channel_1.rangeType(channel) === 'discrete') {
                if (channel === 'shape' && fieldDef.type === 'ordinal') {
                    log.warn(log.message.discreteChannelCannotEncode(channel, 'ordinal'));
                }
                return 'ordinal';
            }
            if (channel in channel_2.POSITION_SCALE_CHANNEL_INDEX) {
                if (util.contains(['rect', 'bar', 'image', 'rule'], mark)) {
                    // The rect/bar mark should fit into a band.
                    // For rule, using band scale to make rule align with axis ticks better https://github.com/vega/vega-lite/issues/3429
                    return 'band';
                }
            }
            else if (mark === 'arc' && channel in channel_2.POLAR_POSITION_SCALE_CHANNEL_INDEX) {
                return 'band';
            }
            if (fieldDef.band !== undefined || (channeldef_1.isPositionFieldOrDatumDef(fieldDef) && ((_a = fieldDef.axis) === null || _a === void 0 ? void 0 : _a.tickBand))) {
                return 'band';
            }
            // Otherwise, use ordinal point scale so we can easily get center positions of the marks.
            return 'point';
        case 'temporal':
            if (channel_1.isColorChannel(channel)) {
                return 'time';
            }
            else if (channel_1.rangeType(channel) === 'discrete') {
                log.warn(log.message.discreteChannelCannotEncode(channel, 'temporal'));
                // TODO: consider using quantize (equivalent to binning) once we have it
                return 'ordinal';
            }
            else if (channeldef_1.isFieldDef(fieldDef) && fieldDef.timeUnit && timeunit_1.normalizeTimeUnit(fieldDef.timeUnit).utc) {
                return 'utc';
            }
            return 'time';
        case 'quantitative':
            if (channel_1.isColorChannel(channel)) {
                if (channeldef_1.isFieldDef(fieldDef) && bin_1.isBinning(fieldDef.bin)) {
                    return 'bin-ordinal';
                }
                return 'linear';
            }
            else if (channel_1.rangeType(channel) === 'discrete') {
                log.warn(log.message.discreteChannelCannotEncode(channel, 'quantitative'));
                // TODO: consider using quantize (equivalent to binning) once we have it
                return 'ordinal';
            }
            return 'linear';
        case 'geojson':
            return undefined;
    }
    /* istanbul ignore next: should never reach this */
    throw new Error(log.message.invalidFieldType(fieldDef.type));
}
//# sourceMappingURL=type.js.map