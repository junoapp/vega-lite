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
exports.getFirstConditionValue = exports.entries = exports.labels = exports.gradient = exports.symbols = exports.legendEncodeRules = void 0;
const vega_util_1 = require("vega-util");
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const mark_1 = require("../../mark");
const util_1 = require("../../util");
const common_1 = require("../common");
const format_1 = require("../format");
const mixins = __importStar(require("../mark/encode"));
const selection_1 = require("../selection");
exports.legendEncodeRules = {
    symbols,
    gradient,
    labels,
    entries
};
function symbols(symbolsSpec, { fieldOrDatumDef, model, channel, legendCmpt, legendType }) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (legendType !== 'symbol') {
        return undefined;
    }
    const { markDef, encoding, config, mark } = model;
    const filled = markDef.filled && mark !== 'trail';
    let out = Object.assign(Object.assign({}, common_1.applyMarkConfig({}, model, mark_1.FILL_STROKE_CONFIG)), mixins.color(model, { filled })); // FIXME: remove this when VgEncodeEntry is compatible with SymbolEncodeEntry
    const symbolOpacity = (_a = legendCmpt.get('symbolOpacity')) !== null && _a !== void 0 ? _a : config.legend.symbolOpacity;
    const symbolFillColor = (_b = legendCmpt.get('symbolFillColor')) !== null && _b !== void 0 ? _b : config.legend.symbolFillColor;
    const symbolStrokeColor = (_c = legendCmpt.get('symbolStrokeColor')) !== null && _c !== void 0 ? _c : config.legend.symbolStrokeColor;
    const opacity = symbolOpacity === undefined ? (_d = getMaxValue(encoding.opacity)) !== null && _d !== void 0 ? _d : markDef.opacity : undefined;
    if (out.fill) {
        // for fill legend, we don't want any fill in symbol
        if (channel === 'fill' || (filled && channel === channel_1.COLOR)) {
            delete out.fill;
        }
        else {
            if (out.fill['field']) {
                // For others, set fill to some opaque value (or nothing if a color is already set)
                if (symbolFillColor) {
                    delete out.fill;
                }
                else {
                    out.fill = common_1.signalOrValueRef((_e = config.legend.symbolBaseFillColor) !== null && _e !== void 0 ? _e : 'black');
                    out.fillOpacity = common_1.signalOrValueRef(opacity !== null && opacity !== void 0 ? opacity : 1);
                }
            }
            else if (vega_util_1.isArray(out.fill)) {
                const fill = (_h = (_g = getFirstConditionValue((_f = encoding.fill) !== null && _f !== void 0 ? _f : encoding.color)) !== null && _g !== void 0 ? _g : markDef.fill) !== null && _h !== void 0 ? _h : (filled && markDef.color);
                if (fill) {
                    out.fill = common_1.signalOrValueRef(fill);
                }
            }
        }
    }
    if (out.stroke) {
        if (channel === 'stroke' || (!filled && channel === channel_1.COLOR)) {
            delete out.stroke;
        }
        else {
            if (out.stroke['field'] || symbolStrokeColor) {
                // For others, remove stroke field
                delete out.stroke;
            }
            else if (vega_util_1.isArray(out.stroke)) {
                const stroke = util_1.getFirstDefined(getFirstConditionValue(encoding.stroke || encoding.color), markDef.stroke, filled ? markDef.color : undefined);
                if (stroke) {
                    out.stroke = { value: stroke };
                }
            }
        }
    }
    if (channel !== channel_1.OPACITY) {
        const condition = channeldef_1.isFieldDef(fieldOrDatumDef) && selectedCondition(model, legendCmpt, fieldOrDatumDef);
        if (condition) {
            out.opacity = [
                Object.assign({ test: condition }, common_1.signalOrValueRef(opacity !== null && opacity !== void 0 ? opacity : 1)),
                common_1.signalOrValueRef(config.legend.unselectedOpacity)
            ];
        }
        else if (opacity) {
            out.opacity = common_1.signalOrValueRef(opacity);
        }
    }
    out = Object.assign(Object.assign({}, out), symbolsSpec);
    return util_1.isEmpty(out) ? undefined : out;
}
exports.symbols = symbols;
function gradient(gradientSpec, { model, legendType, legendCmpt }) {
    var _a;
    if (legendType !== 'gradient') {
        return undefined;
    }
    const { config, markDef, encoding } = model;
    let out = {};
    const gradientOpacity = (_a = legendCmpt.get('gradientOpacity')) !== null && _a !== void 0 ? _a : config.legend.gradientOpacity;
    const opacity = gradientOpacity === undefined ? getMaxValue(encoding.opacity) || markDef.opacity : undefined;
    if (opacity) {
        // only apply opacity if it is neither zero or undefined
        out.opacity = common_1.signalOrValueRef(opacity);
    }
    out = Object.assign(Object.assign({}, out), gradientSpec);
    return util_1.isEmpty(out) ? undefined : out;
}
exports.gradient = gradient;
function labels(specifiedlabelsSpec, { fieldOrDatumDef, model, channel, legendCmpt }) {
    const legend = model.legend(channel) || {};
    const config = model.config;
    const condition = channeldef_1.isFieldDef(fieldOrDatumDef) ? selectedCondition(model, legendCmpt, fieldOrDatumDef) : undefined;
    const opacity = condition ? [{ test: condition, value: 1 }, { value: config.legend.unselectedOpacity }] : undefined;
    const { format, formatType } = legend;
    const text = format_1.isCustomFormatType(formatType)
        ? format_1.formatCustomType({
            fieldOrDatumDef,
            field: 'datum.value',
            format,
            formatType,
            config
        })
        : undefined;
    const labelsSpec = Object.assign(Object.assign(Object.assign({}, (opacity ? { opacity } : {})), (text ? { text } : {})), specifiedlabelsSpec);
    return util_1.isEmpty(labelsSpec) ? undefined : labelsSpec;
}
exports.labels = labels;
function entries(entriesSpec, { legendCmpt }) {
    const selections = legendCmpt.get('selections');
    return (selections === null || selections === void 0 ? void 0 : selections.length) ? Object.assign(Object.assign({}, entriesSpec), { fill: { value: 'transparent' } }) : entriesSpec;
}
exports.entries = entries;
function getMaxValue(channelDef) {
    return getConditionValue(channelDef, (v, conditionalDef) => Math.max(v, conditionalDef.value));
}
function getFirstConditionValue(channelDef) {
    return getConditionValue(channelDef, (v, conditionalDef) => {
        return util_1.getFirstDefined(v, conditionalDef.value);
    });
}
exports.getFirstConditionValue = getFirstConditionValue;
function getConditionValue(channelDef, reducer) {
    if (channeldef_1.hasConditionalValueDef(channelDef)) {
        return vega_util_1.array(channelDef.condition).reduce(reducer, channelDef.value);
    }
    else if (channeldef_1.isValueDef(channelDef)) {
        return channelDef.value;
    }
    return undefined;
}
function selectedCondition(model, legendCmpt, fieldDef) {
    const selections = legendCmpt.get('selections');
    if (!(selections === null || selections === void 0 ? void 0 : selections.length))
        return undefined;
    const field = vega_util_1.stringValue(fieldDef.field);
    return selections
        .map(name => {
        const store = vega_util_1.stringValue(util_1.varName(name) + selection_1.STORE);
        return `(!length(data(${store})) || (${name}[${field}] && indexof(${name}[${field}], datum.value) >= 0))`;
    })
        .join(' || ');
}
//# sourceMappingURL=encode.js.map