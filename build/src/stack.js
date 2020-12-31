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
exports.stack = exports.STACK_BY_DEFAULT_MARKS = exports.STACKABLE_MARKS = exports.isStackOffset = void 0;
const vega_util_1 = require("vega-util");
const aggregate_1 = require("./aggregate");
const channel_1 = require("./channel");
const channeldef_1 = require("./channeldef");
const encoding_1 = require("./encoding");
const log = __importStar(require("./log"));
const mark_1 = require("./mark");
const scale_1 = require("./scale");
const util_1 = require("./util");
const STACK_OFFSET_INDEX = {
    zero: 1,
    center: 1,
    normalize: 1
};
function isStackOffset(s) {
    return s in STACK_OFFSET_INDEX;
}
exports.isStackOffset = isStackOffset;
exports.STACKABLE_MARKS = new Set([mark_1.ARC, mark_1.BAR, mark_1.AREA, mark_1.RULE, mark_1.POINT, mark_1.CIRCLE, mark_1.SQUARE, mark_1.LINE, mark_1.TEXT, mark_1.TICK]);
exports.STACK_BY_DEFAULT_MARKS = new Set([mark_1.BAR, mark_1.AREA, mark_1.ARC]);
function potentialStackedChannel(encoding, x) {
    var _a, _b;
    const y = x === 'x' ? 'y' : 'radius';
    const xDef = encoding[x];
    const yDef = encoding[y];
    if (channeldef_1.isFieldDef(xDef) && channeldef_1.isFieldDef(yDef)) {
        if (channeldef_1.channelDefType(xDef) === 'quantitative' && channeldef_1.channelDefType(yDef) === 'quantitative') {
            if (xDef.stack) {
                return x;
            }
            else if (yDef.stack) {
                return y;
            }
            const xAggregate = channeldef_1.isFieldDef(xDef) && !!xDef.aggregate;
            const yAggregate = channeldef_1.isFieldDef(yDef) && !!yDef.aggregate;
            // if there is no explicit stacking, only apply stack if there is only one aggregate for x or y
            if (xAggregate !== yAggregate) {
                return xAggregate ? x : y;
            }
            else {
                const xScale = (_a = xDef.scale) === null || _a === void 0 ? void 0 : _a.type;
                const yScale = (_b = yDef.scale) === null || _b === void 0 ? void 0 : _b.type;
                if (xScale && xScale !== 'linear') {
                    return y;
                }
                else if (yScale && yScale !== 'linear') {
                    return x;
                }
            }
        }
        else if (channeldef_1.channelDefType(xDef) === 'quantitative') {
            return x;
        }
        else if (channeldef_1.channelDefType(yDef) === 'quantitative') {
            return y;
        }
    }
    else if (channeldef_1.channelDefType(xDef) === 'quantitative') {
        return x;
    }
    else if (channeldef_1.channelDefType(yDef) === 'quantitative') {
        return y;
    }
    return undefined;
}
function getDimensionChannel(channel) {
    switch (channel) {
        case 'x':
            return 'y';
        case 'y':
            return 'x';
        case 'theta':
            return 'radius';
        case 'radius':
            return 'theta';
    }
}
// Note: CompassQL uses this method and only pass in required properties of each argument object.
// If required properties change, make sure to update CompassQL.
function stack(m, encoding, opt = {}) {
    var _a, _b;
    const mark = mark_1.isMarkDef(m) ? m.type : m;
    // Should have stackable mark
    if (!exports.STACKABLE_MARKS.has(mark)) {
        return null;
    }
    // Run potential stacked twice, one for Cartesian and another for Polar,
    // so text marks can be stacked in any of the coordinates.
    // Note: The logic here is not perfectly correct.  If we want to support stacked dot plots where each dot is a pie chart with label, we have to change the stack logic here to separate Cartesian stacking for polar stacking.
    // However, since we probably never want to do that, let's just note the limitation here.
    const fieldChannel = potentialStackedChannel(encoding, 'x') || potentialStackedChannel(encoding, 'theta');
    if (!fieldChannel) {
        return null;
    }
    const stackedFieldDef = encoding[fieldChannel];
    const stackedField = channeldef_1.isFieldDef(stackedFieldDef) ? channeldef_1.vgField(stackedFieldDef, {}) : undefined;
    let dimensionChannel = getDimensionChannel(fieldChannel);
    let dimensionDef = encoding[dimensionChannel];
    let dimensionField = channeldef_1.isFieldDef(dimensionDef) ? channeldef_1.vgField(dimensionDef, {}) : undefined;
    // avoid grouping by the stacked field
    if (dimensionField === stackedField) {
        dimensionField = undefined;
        dimensionDef = undefined;
        dimensionChannel = undefined;
    }
    // Should have grouping level of detail that is different from the dimension field
    const stackBy = channel_1.NONPOSITION_CHANNELS.reduce((sc, channel) => {
        // Ignore tooltip in stackBy (https://github.com/vega/vega-lite/issues/4001)
        if (channel !== 'tooltip' && encoding_1.channelHasField(encoding, channel)) {
            const channelDef = encoding[channel];
            for (const cDef of vega_util_1.array(channelDef)) {
                const fieldDef = channeldef_1.getFieldDef(cDef);
                if (fieldDef.aggregate) {
                    continue;
                }
                // Check whether the channel's field is identical to x/y's field or if the channel is a repeat
                const f = channeldef_1.vgField(fieldDef, {});
                if (
                // if fielddef is a repeat, just include it in the stack by
                !f ||
                    // otherwise, the field must be different from x and y fields.
                    f !== dimensionField) {
                    sc.push({ channel, fieldDef });
                }
            }
        }
        return sc;
    }, []);
    // Automatically determine offset
    let offset;
    if (stackedFieldDef.stack !== undefined) {
        if (vega_util_1.isBoolean(stackedFieldDef.stack)) {
            offset = stackedFieldDef.stack ? 'zero' : null;
        }
        else {
            offset = stackedFieldDef.stack;
        }
    }
    else if (exports.STACK_BY_DEFAULT_MARKS.has(mark)) {
        offset = 'zero';
    }
    if (!offset || !isStackOffset(offset)) {
        return null;
    }
    if (encoding_1.isAggregate(encoding) && stackBy.length === 0) {
        return null;
    }
    // warn when stacking non-linear
    if (((_a = stackedFieldDef === null || stackedFieldDef === void 0 ? void 0 : stackedFieldDef.scale) === null || _a === void 0 ? void 0 : _a.type) && ((_b = stackedFieldDef === null || stackedFieldDef === void 0 ? void 0 : stackedFieldDef.scale) === null || _b === void 0 ? void 0 : _b.type) !== scale_1.ScaleType.LINEAR) {
        if (opt.disallowNonLinearStack) {
            return null;
        }
        else {
            log.warn(log.message.cannotStackNonLinearScale(stackedFieldDef.scale.type));
        }
    }
    // Check if it is a ranged mark
    if (channeldef_1.isFieldOrDatumDef(encoding[channel_1.getSecondaryRangeChannel(fieldChannel)])) {
        if (stackedFieldDef.stack !== undefined) {
            log.warn(log.message.cannotStackRangedMark(fieldChannel));
        }
        return null;
    }
    // Warn if stacking non-summative aggregate
    if (channeldef_1.isFieldDef(stackedFieldDef) && stackedFieldDef.aggregate && !util_1.contains(aggregate_1.SUM_OPS, stackedFieldDef.aggregate)) {
        log.warn(log.message.stackNonSummativeAggregate(stackedFieldDef.aggregate));
    }
    return {
        groupbyChannel: dimensionDef ? dimensionChannel : undefined,
        groupbyField: dimensionField,
        fieldChannel,
        impute: stackedFieldDef.impute === null ? false : mark_1.isPathMark(mark),
        stackBy,
        offset
    };
}
exports.stack = stack;
//# sourceMappingURL=stack.js.map