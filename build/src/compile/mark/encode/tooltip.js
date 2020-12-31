"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tooltipRefForEncoding = exports.tooltipData = exports.tooltip = void 0;
const vega_util_1 = require("vega-util");
const bin_1 = require("../../../bin");
const channel_1 = require("../../../channel");
const channeldef_1 = require("../../../channeldef");
const encoding_1 = require("../../../encoding");
const util_1 = require("../../../util");
const vega_schema_1 = require("../../../vega.schema");
const common_1 = require("../../common");
const format_1 = require("../../format");
const conditional_1 = require("./conditional");
const text_1 = require("./text");
function tooltip(model, opt = {}) {
    const { encoding, markDef, config, stack } = model;
    const channelDef = encoding.tooltip;
    if (vega_util_1.isArray(channelDef)) {
        return { tooltip: tooltipRefForEncoding({ tooltip: channelDef }, stack, config, opt) };
    }
    else {
        const datum = opt.reactiveGeom ? 'datum.datum' : 'datum';
        return conditional_1.wrapCondition(model, channelDef, 'tooltip', cDef => {
            // use valueRef based on channelDef first
            const tooltipRefFromChannelDef = text_1.textRef(cDef, config, datum);
            if (tooltipRefFromChannelDef) {
                return tooltipRefFromChannelDef;
            }
            if (cDef === null) {
                // Allow using encoding.tooltip = null to disable tooltip
                return undefined;
            }
            let markTooltip = common_1.getMarkPropOrConfig('tooltip', markDef, config);
            if (markTooltip === true) {
                markTooltip = { content: 'encoding' };
            }
            if (vega_util_1.isString(markTooltip)) {
                return { value: markTooltip };
            }
            else if (vega_util_1.isObject(markTooltip)) {
                // `tooltip` is `{fields: 'encodings' | 'fields'}`
                if (vega_schema_1.isSignalRef(markTooltip)) {
                    return markTooltip;
                }
                else if (markTooltip.content === 'encoding') {
                    return tooltipRefForEncoding(encoding, stack, config, opt);
                }
                else {
                    return { signal: datum };
                }
            }
            return undefined;
        });
    }
}
exports.tooltip = tooltip;
function tooltipData(encoding, stack, config, { reactiveGeom } = {}) {
    const toSkip = {};
    const expr = reactiveGeom ? 'datum.datum' : 'datum';
    const tuples = [];
    function add(fDef, channel) {
        const mainChannel = channel_1.getMainRangeChannel(channel);
        const fieldDef = channeldef_1.isTypedFieldDef(fDef)
            ? fDef
            : Object.assign(Object.assign({}, fDef), { type: encoding[mainChannel].type // for secondary field def, copy type from main channel
             });
        const title = fieldDef.title || channeldef_1.defaultTitle(fieldDef, config);
        const key = vega_util_1.array(title).join(', ');
        let value;
        if (channel_1.isXorY(channel)) {
            const channel2 = channel === 'x' ? 'x2' : 'y2';
            const fieldDef2 = channeldef_1.getFieldDef(encoding[channel2]);
            if (bin_1.isBinned(fieldDef.bin) && fieldDef2) {
                const startField = channeldef_1.vgField(fieldDef, { expr });
                const endField = channeldef_1.vgField(fieldDef2, { expr });
                const { format, formatType } = channeldef_1.getFormatMixins(fieldDef);
                value = format_1.binFormatExpression(startField, endField, format, formatType, config);
                toSkip[channel2] = true;
            }
            else if (stack && stack.fieldChannel === channel && stack.offset === 'normalize') {
                const { format, formatType } = channeldef_1.getFormatMixins(fieldDef);
                value = format_1.formatSignalRef({ fieldOrDatumDef: fieldDef, format, formatType, expr, config, normalizeStack: true })
                    .signal;
            }
        }
        value = value !== null && value !== void 0 ? value : text_1.textRef(fieldDef, config, expr).signal;
        tuples.push({ channel, key, value });
    }
    encoding_1.forEach(encoding, (channelDef, channel) => {
        if (channeldef_1.isFieldDef(channelDef)) {
            add(channelDef, channel);
        }
        else if (channeldef_1.hasConditionalFieldDef(channelDef)) {
            add(channelDef.condition, channel);
        }
    });
    const out = {};
    for (const { channel, key, value } of tuples) {
        if (!toSkip[channel] && !out[key]) {
            out[key] = value;
        }
    }
    return out;
}
exports.tooltipData = tooltipData;
function tooltipRefForEncoding(encoding, stack, config, { reactiveGeom } = {}) {
    const data = tooltipData(encoding, stack, config, { reactiveGeom });
    const keyValues = util_1.entries(data).map(([key, value]) => `"${key}": ${value}`);
    return keyValues.length > 0 ? { signal: `{${keyValues.join(', ')}}` } : undefined;
}
exports.tooltipRefForEncoding = tooltipRefForEncoding;
//# sourceMappingURL=tooltip.js.map