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
exports.defaultFilled = exports.initMarkdef = void 0;
const bin_1 = require("../../bin");
const channeldef_1 = require("../../channeldef");
const encoding_1 = require("../../encoding");
const expr_1 = require("../../expr");
const log = __importStar(require("../../log"));
const mark_1 = require("../../mark");
const type_1 = require("../../type");
const util_1 = require("../../util");
const common_1 = require("../common");
function initMarkdef(originalMarkDef, encoding, config) {
    // FIXME: markDef expects that exprRefs are replaced recursively but replaceExprRef only replaces the top level
    const markDef = expr_1.replaceExprRef(originalMarkDef);
    // set orient, which can be overridden by rules as sometimes the specified orient is invalid.
    const specifiedOrient = common_1.getMarkPropOrConfig('orient', markDef, config);
    markDef.orient = orient(markDef.type, encoding, specifiedOrient);
    if (specifiedOrient !== undefined && specifiedOrient !== markDef.orient) {
        log.warn(log.message.orientOverridden(markDef.orient, specifiedOrient));
    }
    if (markDef.type === 'bar' && markDef.orient) {
        const cornerRadiusEnd = common_1.getMarkPropOrConfig('cornerRadiusEnd', markDef, config);
        if (cornerRadiusEnd !== undefined) {
            const newProps = (markDef.orient === 'horizontal' && encoding.x2) || (markDef.orient === 'vertical' && encoding.y2)
                ? ['cornerRadius']
                : mark_1.BAR_CORNER_RADIUS_INDEX[markDef.orient];
            for (const newProp of newProps) {
                markDef[newProp] = cornerRadiusEnd;
            }
            if (markDef.cornerRadiusEnd !== undefined) {
                delete markDef.cornerRadiusEnd; // no need to keep the original cap cornerRadius
            }
        }
    }
    // set opacity and filled if not specified in mark config
    const specifiedOpacity = common_1.getMarkPropOrConfig('opacity', markDef, config);
    if (specifiedOpacity === undefined) {
        markDef.opacity = opacity(markDef.type, encoding);
    }
    // set cursor, which should be pointer if href channel is present unless otherwise specified
    const specifiedCursor = common_1.getMarkPropOrConfig('cursor', markDef, config);
    if (specifiedCursor === undefined) {
        markDef.cursor = cursor(markDef, encoding, config);
    }
    return markDef;
}
exports.initMarkdef = initMarkdef;
function cursor(markDef, encoding, config) {
    if (encoding.href || markDef.href || common_1.getMarkPropOrConfig('href', markDef, config)) {
        return 'pointer';
    }
    return markDef.cursor;
}
function opacity(mark, encoding) {
    if (util_1.contains([mark_1.POINT, mark_1.TICK, mark_1.CIRCLE, mark_1.SQUARE], mark)) {
        // point-based marks
        if (!encoding_1.isAggregate(encoding)) {
            return 0.7;
        }
    }
    return undefined;
}
function defaultFilled(markDef, config, { graticule }) {
    if (graticule) {
        return false;
    }
    const filledConfig = common_1.getMarkConfig('filled', markDef, config);
    const mark = markDef.type;
    return util_1.getFirstDefined(filledConfig, mark !== mark_1.POINT && mark !== mark_1.LINE && mark !== mark_1.RULE);
}
exports.defaultFilled = defaultFilled;
function orient(mark, encoding, specifiedOrient) {
    switch (mark) {
        case mark_1.POINT:
        case mark_1.CIRCLE:
        case mark_1.SQUARE:
        case mark_1.TEXT:
        case mark_1.RECT:
        case mark_1.IMAGE:
            // orient is meaningless for these marks.
            return undefined;
    }
    const { x, y, x2, y2 } = encoding;
    switch (mark) {
        case mark_1.BAR:
            if (channeldef_1.isFieldDef(x) && (bin_1.isBinned(x.bin) || (channeldef_1.isFieldDef(y) && y.aggregate && !x.aggregate))) {
                return 'vertical';
            }
            if (channeldef_1.isFieldDef(y) && (bin_1.isBinned(y.bin) || (channeldef_1.isFieldDef(x) && x.aggregate && !y.aggregate))) {
                return 'horizontal';
            }
            if (y2 || x2) {
                // Ranged bar does not always have clear orientation, so we allow overriding
                if (specifiedOrient) {
                    return specifiedOrient;
                }
                // If y is range and x is non-range, non-bin Q, y is likely a prebinned field
                if (!x2) {
                    if ((channeldef_1.isFieldDef(x) && x.type === type_1.QUANTITATIVE && !bin_1.isBinning(x.bin)) || channeldef_1.isNumericDataDef(x)) {
                        return 'horizontal';
                    }
                }
                // If x is range and y is non-range, non-bin Q, x is likely a prebinned field
                if (!y2) {
                    if ((channeldef_1.isFieldDef(y) && y.type === type_1.QUANTITATIVE && !bin_1.isBinning(y.bin)) || channeldef_1.isNumericDataDef(y)) {
                        return 'vertical';
                    }
                }
            }
        // falls through
        case mark_1.RULE:
            // return undefined for line segment rule and bar with both axis ranged
            // we have to ignore the case that the data are already binned
            if (x2 && !(channeldef_1.isFieldDef(x) && bin_1.isBinned(x.bin)) && y2 && !(channeldef_1.isFieldDef(y) && bin_1.isBinned(y.bin))) {
                return undefined;
            }
        // falls through
        case mark_1.AREA:
            // If there are range for both x and y, y (vertical) has higher precedence.
            if (y2) {
                if (channeldef_1.isFieldDef(y) && bin_1.isBinned(y.bin)) {
                    return 'horizontal';
                }
                else {
                    return 'vertical';
                }
            }
            else if (x2) {
                if (channeldef_1.isFieldDef(x) && bin_1.isBinned(x.bin)) {
                    return 'vertical';
                }
                else {
                    return 'horizontal';
                }
            }
            else if (mark === mark_1.RULE) {
                if (x && !y) {
                    return 'vertical';
                }
                else if (y && !x) {
                    return 'horizontal';
                }
            }
        // falls through
        case mark_1.LINE:
        case mark_1.TICK: {
            // Tick is opposite to bar, line, area and never have ranged mark.
            const xIsContinuous = channeldef_1.isContinuousFieldOrDatumDef(x);
            const yIsContinuous = channeldef_1.isContinuousFieldOrDatumDef(y);
            if (xIsContinuous && !yIsContinuous) {
                return mark !== 'tick' ? 'horizontal' : 'vertical';
            }
            else if (!xIsContinuous && yIsContinuous) {
                return mark !== 'tick' ? 'vertical' : 'horizontal';
            }
            else if (xIsContinuous && yIsContinuous) {
                const xDef = x; // we can cast here since they are surely fieldDef
                const yDef = y;
                const xIsTemporal = xDef.type === type_1.TEMPORAL;
                const yIsTemporal = yDef.type === type_1.TEMPORAL;
                // temporal without timeUnit is considered continuous, but better serves as dimension
                if (xIsTemporal && !yIsTemporal) {
                    return mark !== 'tick' ? 'vertical' : 'horizontal';
                }
                else if (!xIsTemporal && yIsTemporal) {
                    return mark !== 'tick' ? 'horizontal' : 'vertical';
                }
                if (!xDef.aggregate && yDef.aggregate) {
                    return mark !== 'tick' ? 'vertical' : 'horizontal';
                }
                else if (xDef.aggregate && !yDef.aggregate) {
                    return mark !== 'tick' ? 'horizontal' : 'vertical';
                }
                if (specifiedOrient) {
                    // When ambiguous, use user specified one.
                    return specifiedOrient;
                }
                return 'vertical';
            }
            else {
                // Discrete x Discrete case
                if (specifiedOrient) {
                    // When ambiguous, use user specified one.
                    return specifiedOrient;
                }
                return undefined;
            }
        }
    }
    return 'vertical';
}
//# sourceMappingURL=init.js.map