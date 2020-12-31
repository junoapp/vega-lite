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
exports.compositeMarkOrient = exports.compositeMarkContinuousAxis = exports.partLayerMixins = exports.makeCompositeAggregatePartFactory = exports.getTitle = exports.getCompositeMarkTooltip = exports.filterTooltipWithAggregatedField = void 0;
const vega_util_1 = require("vega-util");
const channeldef_1 = require("../channeldef");
const encoding_1 = require("../encoding");
const log = __importStar(require("../log"));
const mark_1 = require("../mark");
const util_1 = require("../util");
const vega_schema_1 = require("../vega.schema");
const channeldef_2 = require("./../channeldef");
function filterTooltipWithAggregatedField(oldEncoding) {
    const { tooltip } = oldEncoding, filteredEncoding = __rest(oldEncoding, ["tooltip"]);
    if (!tooltip) {
        return { filteredEncoding };
    }
    let customTooltipWithAggregatedField;
    let customTooltipWithoutAggregatedField;
    if (vega_util_1.isArray(tooltip)) {
        for (const t of tooltip) {
            if (t.aggregate) {
                if (!customTooltipWithAggregatedField) {
                    customTooltipWithAggregatedField = [];
                }
                customTooltipWithAggregatedField.push(t);
            }
            else {
                if (!customTooltipWithoutAggregatedField) {
                    customTooltipWithoutAggregatedField = [];
                }
                customTooltipWithoutAggregatedField.push(t);
            }
        }
        if (customTooltipWithAggregatedField) {
            filteredEncoding.tooltip = customTooltipWithAggregatedField;
        }
    }
    else {
        if (tooltip['aggregate']) {
            filteredEncoding.tooltip = tooltip;
        }
        else {
            customTooltipWithoutAggregatedField = tooltip;
        }
    }
    if (vega_util_1.isArray(customTooltipWithoutAggregatedField) && customTooltipWithoutAggregatedField.length === 1) {
        customTooltipWithoutAggregatedField = customTooltipWithoutAggregatedField[0];
    }
    return { customTooltipWithoutAggregatedField, filteredEncoding };
}
exports.filterTooltipWithAggregatedField = filterTooltipWithAggregatedField;
function getCompositeMarkTooltip(tooltipSummary, continuousAxisChannelDef, encodingWithoutContinuousAxis, withFieldName = true) {
    if ('tooltip' in encodingWithoutContinuousAxis) {
        return { tooltip: encodingWithoutContinuousAxis.tooltip };
    }
    const fiveSummaryTooltip = tooltipSummary.map(({ fieldPrefix, titlePrefix }) => {
        const mainTitle = withFieldName ? ` of ${getTitle(continuousAxisChannelDef)}` : '';
        return {
            field: fieldPrefix + continuousAxisChannelDef.field,
            type: continuousAxisChannelDef.type,
            title: vega_schema_1.isSignalRef(titlePrefix) ? { signal: `${titlePrefix}"${escape(mainTitle)}"` } : titlePrefix + mainTitle
        };
    });
    const tooltipFieldDefs = encoding_1.fieldDefs(encodingWithoutContinuousAxis).map(channeldef_2.toStringFieldDef);
    return {
        tooltip: [
            ...fiveSummaryTooltip,
            // need to cast because TextFieldDef supports fewer types of bin
            ...util_1.unique(tooltipFieldDefs, util_1.hash)
        ]
    };
}
exports.getCompositeMarkTooltip = getCompositeMarkTooltip;
function getTitle(continuousAxisChannelDef) {
    const { title, field } = continuousAxisChannelDef;
    return util_1.getFirstDefined(title, field);
}
exports.getTitle = getTitle;
function makeCompositeAggregatePartFactory(compositeMarkDef, continuousAxis, continuousAxisChannelDef, sharedEncoding, compositeMarkConfig) {
    const { scale, axis } = continuousAxisChannelDef;
    return ({ partName, mark, positionPrefix, endPositionPrefix = undefined, extraEncoding = {} }) => {
        const title = getTitle(continuousAxisChannelDef);
        return partLayerMixins(compositeMarkDef, partName, compositeMarkConfig, {
            mark,
            encoding: Object.assign(Object.assign(Object.assign({ [continuousAxis]: Object.assign(Object.assign(Object.assign({ field: `${positionPrefix}_${continuousAxisChannelDef.field}`, type: continuousAxisChannelDef.type }, (title !== undefined ? { title } : {})), (scale !== undefined ? { scale } : {})), (axis !== undefined ? { axis } : {})) }, (vega_util_1.isString(endPositionPrefix)
                ? {
                    [`${continuousAxis}2`]: {
                        field: `${endPositionPrefix}_${continuousAxisChannelDef.field}`
                    }
                }
                : {})), sharedEncoding), extraEncoding)
        });
    };
}
exports.makeCompositeAggregatePartFactory = makeCompositeAggregatePartFactory;
function partLayerMixins(markDef, part, compositeMarkConfig, partBaseSpec) {
    const { clip, color, opacity } = markDef;
    const mark = markDef.type;
    if (markDef[part] || (markDef[part] === undefined && compositeMarkConfig[part])) {
        return [
            Object.assign(Object.assign({}, partBaseSpec), { mark: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, compositeMarkConfig[part]), (clip ? { clip } : {})), (color ? { color } : {})), (opacity ? { opacity } : {})), (mark_1.isMarkDef(partBaseSpec.mark) ? partBaseSpec.mark : { type: partBaseSpec.mark })), { style: `${mark}-${part}` }), (vega_util_1.isBoolean(markDef[part]) ? {} : markDef[part])) })
        ];
    }
    return [];
}
exports.partLayerMixins = partLayerMixins;
function compositeMarkContinuousAxis(spec, orient, compositeMark) {
    const { encoding } = spec;
    const continuousAxis = orient === 'vertical' ? 'y' : 'x';
    const continuousAxisChannelDef = encoding[continuousAxis]; // Safe to cast because if x is not continuous fielddef, the orient would not be horizontal.
    const continuousAxisChannelDef2 = encoding[`${continuousAxis}2`];
    const continuousAxisChannelDefError = encoding[`${continuousAxis}Error`];
    const continuousAxisChannelDefError2 = encoding[`${continuousAxis}Error2`];
    return {
        continuousAxisChannelDef: filterAggregateFromChannelDef(continuousAxisChannelDef, compositeMark),
        continuousAxisChannelDef2: filterAggregateFromChannelDef(continuousAxisChannelDef2, compositeMark),
        continuousAxisChannelDefError: filterAggregateFromChannelDef(continuousAxisChannelDefError, compositeMark),
        continuousAxisChannelDefError2: filterAggregateFromChannelDef(continuousAxisChannelDefError2, compositeMark),
        continuousAxis
    };
}
exports.compositeMarkContinuousAxis = compositeMarkContinuousAxis;
function filterAggregateFromChannelDef(continuousAxisChannelDef, compositeMark) {
    if (continuousAxisChannelDef && continuousAxisChannelDef.aggregate) {
        const { aggregate } = continuousAxisChannelDef, continuousAxisWithoutAggregate = __rest(continuousAxisChannelDef, ["aggregate"]);
        if (aggregate !== compositeMark) {
            log.warn(log.message.errorBarContinuousAxisHasCustomizedAggregate(aggregate, compositeMark));
        }
        return continuousAxisWithoutAggregate;
    }
    else {
        return continuousAxisChannelDef;
    }
}
function compositeMarkOrient(spec, compositeMark) {
    const { mark, encoding } = spec;
    const { x, y } = encoding;
    if (mark_1.isMarkDef(mark) && mark.orient) {
        return mark.orient;
    }
    if (channeldef_1.isContinuousFieldOrDatumDef(x)) {
        // x is continuous
        if (channeldef_1.isContinuousFieldOrDatumDef(y)) {
            // both x and y are continuous
            const xAggregate = channeldef_1.isFieldDef(x) && x.aggregate;
            const yAggregate = channeldef_1.isFieldDef(y) && y.aggregate;
            if (!xAggregate && yAggregate === compositeMark) {
                return 'vertical';
            }
            else if (!yAggregate && xAggregate === compositeMark) {
                return 'horizontal';
            }
            else if (xAggregate === compositeMark && yAggregate === compositeMark) {
                throw new Error('Both x and y cannot have aggregate');
            }
            else {
                if (channeldef_1.isFieldOrDatumDefForTimeFormat(y) && !channeldef_1.isFieldOrDatumDefForTimeFormat(x)) {
                    // y is temporal but x is not
                    return 'horizontal';
                }
                // default orientation for two continuous
                return 'vertical';
            }
        }
        return 'horizontal';
    }
    else if (channeldef_1.isContinuousFieldOrDatumDef(y)) {
        // y is continuous but x is not
        return 'vertical';
    }
    else {
        // Neither x nor y is continuous.
        throw new Error(`Need a valid continuous axis for ${compositeMark}s`);
    }
}
exports.compositeMarkOrient = compositeMarkOrient;
//# sourceMappingURL=common.js.map