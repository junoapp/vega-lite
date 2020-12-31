"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseEncodeEntry = exports.tooltip = exports.text = exports.rectPosition = exports.rangePosition = exports.pointOrRangePosition = exports.pointPosition = exports.nonPosition = exports.wrapCondition = exports.color = void 0;
const vega_util_1 = require("vega-util");
const channel_1 = require("../../../channel");
const mark_1 = require("../../../mark");
const scale_1 = require("../../../scale");
const util_1 = require("../../../util");
const vega_schema_1 = require("../../../vega.schema");
const common_1 = require("../../common");
const aria_1 = require("./aria");
const color_1 = require("./color");
const nonposition_1 = require("./nonposition");
const text_1 = require("./text");
const tooltip_1 = require("./tooltip");
const valueref_1 = require("./valueref");
const zindex_1 = require("./zindex");
var color_2 = require("./color");
Object.defineProperty(exports, "color", { enumerable: true, get: function () { return color_2.color; } });
var conditional_1 = require("./conditional");
Object.defineProperty(exports, "wrapCondition", { enumerable: true, get: function () { return conditional_1.wrapCondition; } });
var nonposition_2 = require("./nonposition");
Object.defineProperty(exports, "nonPosition", { enumerable: true, get: function () { return nonposition_2.nonPosition; } });
var position_point_1 = require("./position-point");
Object.defineProperty(exports, "pointPosition", { enumerable: true, get: function () { return position_point_1.pointPosition; } });
var position_range_1 = require("./position-range");
Object.defineProperty(exports, "pointOrRangePosition", { enumerable: true, get: function () { return position_range_1.pointOrRangePosition; } });
Object.defineProperty(exports, "rangePosition", { enumerable: true, get: function () { return position_range_1.rangePosition; } });
var position_rect_1 = require("./position-rect");
Object.defineProperty(exports, "rectPosition", { enumerable: true, get: function () { return position_rect_1.rectPosition; } });
var text_2 = require("./text");
Object.defineProperty(exports, "text", { enumerable: true, get: function () { return text_2.text; } });
var tooltip_2 = require("./tooltip");
Object.defineProperty(exports, "tooltip", { enumerable: true, get: function () { return tooltip_2.tooltip; } });
const ALWAYS_IGNORE = new Set(['aria']);
function baseEncodeEntry(model, ignore) {
    const { fill = undefined, stroke = undefined } = ignore.color === 'include' ? color_1.color(model) : {};
    return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, markDefProperties(model.markDef, ignore)), wrapAllFieldsInvalid(model, 'fill', fill)), wrapAllFieldsInvalid(model, 'stroke', stroke)), nonposition_1.nonPosition('opacity', model)), nonposition_1.nonPosition('fillOpacity', model)), nonposition_1.nonPosition('strokeOpacity', model)), nonposition_1.nonPosition('strokeWidth', model)), nonposition_1.nonPosition('strokeDash', model)), zindex_1.zindex(model)), tooltip_1.tooltip(model)), text_1.text(model, 'href')), aria_1.aria(model));
}
exports.baseEncodeEntry = baseEncodeEntry;
// TODO: mark VgValueRef[] as readonly after https://github.com/vega/vega/pull/1987
function wrapAllFieldsInvalid(model, channel, valueRef) {
    const { config, mark, markDef } = model;
    const invalid = common_1.getMarkPropOrConfig('invalid', markDef, config);
    if (invalid === 'hide' && valueRef && !mark_1.isPathMark(mark)) {
        // For non-path marks, we have to exclude invalid values (null and NaN) for scales with continuous domains.
        // For path marks, we will use "defined" property and skip these values instead.
        const test = allFieldsInvalidPredicate(model, { invalid: true, channels: channel_1.SCALE_CHANNELS });
        if (test) {
            return {
                [channel]: [
                    // prepend the invalid case
                    // TODO: support custom value
                    { test, value: null },
                    ...vega_util_1.array(valueRef)
                ]
            };
        }
    }
    return valueRef ? { [channel]: valueRef } : {};
}
function markDefProperties(mark, ignore) {
    return vega_schema_1.VG_MARK_CONFIGS.reduce((m, prop) => {
        if (!ALWAYS_IGNORE.has(prop) && mark[prop] !== undefined && ignore[prop] !== 'ignore') {
            m[prop] = common_1.signalOrValueRef(mark[prop]);
        }
        return m;
    }, {});
}
function allFieldsInvalidPredicate(model, { invalid = false, channels }) {
    const filterIndex = channels.reduce((aggregator, channel) => {
        const scaleComponent = model.getScaleComponent(channel);
        if (scaleComponent) {
            const scaleType = scaleComponent.get('type');
            const field = model.vgField(channel, { expr: 'datum' });
            // While discrete domain scales can handle invalid values, continuous scales can't.
            if (field && scale_1.hasContinuousDomain(scaleType)) {
                aggregator[field] = true;
            }
        }
        return aggregator;
    }, {});
    const fields = util_1.keys(filterIndex);
    if (fields.length > 0) {
        const op = invalid ? '||' : '&&';
        return fields.map(field => valueref_1.fieldInvalidPredicate(field, invalid)).join(` ${op} `);
    }
    return undefined;
}
//# sourceMappingURL=base.js.map