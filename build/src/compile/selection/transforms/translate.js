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
const vega_event_selector_1 = require("vega-event-selector");
const channel_1 = require("../../../channel");
const interval_1 = require("../interval");
const scales_1 = __importStar(require("./scales"));
const ANCHOR = '_translate_anchor';
const DELTA = '_translate_delta';
const translate = {
    has: selCmpt => {
        return selCmpt.type === 'interval' && selCmpt.translate;
    },
    signals: (model, selCmpt, signals) => {
        const name = selCmpt.name;
        const hasScales = scales_1.default.has(selCmpt);
        const anchor = name + ANCHOR;
        const { x, y } = selCmpt.project.hasChannel;
        let events = vega_event_selector_1.selector(selCmpt.translate, 'scope');
        if (!hasScales) {
            events = events.map(e => ((e.between[0].markname = name + interval_1.BRUSH), e));
        }
        signals.push({
            name: anchor,
            value: {},
            on: [
                {
                    events: events.map(e => e.between[0]),
                    update: '{x: x(unit), y: y(unit)' +
                        (x !== undefined ? `, extent_x: ${hasScales ? scales_1.domain(model, channel_1.X) : `slice(${x.signals.visual})`}` : '') +
                        (y !== undefined ? `, extent_y: ${hasScales ? scales_1.domain(model, channel_1.Y) : `slice(${y.signals.visual})`}` : '') +
                        '}'
                }
            ]
        }, {
            name: name + DELTA,
            value: {},
            on: [
                {
                    events: events,
                    update: `{x: ${anchor}.x - x(unit), y: ${anchor}.y - y(unit)}`
                }
            ]
        });
        if (x !== undefined) {
            onDelta(model, selCmpt, x, 'width', signals);
        }
        if (y !== undefined) {
            onDelta(model, selCmpt, y, 'height', signals);
        }
        return signals;
    }
};
exports.default = translate;
function onDelta(model, selCmpt, proj, size, signals) {
    var _a;
    const name = selCmpt.name;
    const anchor = name + ANCHOR;
    const delta = name + DELTA;
    const channel = proj.channel;
    const hasScales = scales_1.default.has(selCmpt);
    const signal = signals.filter(s => s.name === proj.signals[hasScales ? 'data' : 'visual'])[0];
    const sizeSg = model.getSizeSignalRef(size).signal;
    const scaleCmpt = model.getScaleComponent(channel);
    const scaleType = scaleCmpt.get('type');
    const sign = hasScales && channel === channel_1.X ? '-' : ''; // Invert delta when panning x-scales.
    const extent = `${anchor}.extent_${channel}`;
    const offset = `${sign}${delta}.${channel} / ${hasScales ? `${sizeSg}` : `span(${extent})`}`;
    const panFn = !hasScales
        ? 'panLinear'
        : scaleType === 'log'
            ? 'panLog'
            : scaleType === 'pow'
                ? 'panPow'
                : 'panLinear';
    const update = `${panFn}(${extent}, ${offset}` +
        (hasScales && scaleType === 'pow' ? `, ${(_a = scaleCmpt.get('exponent')) !== null && _a !== void 0 ? _a : 1}` : '') +
        ')';
    signal.on.push({
        events: { signal: delta },
        update: hasScales ? update : `clampRange(${update}, 0, ${sizeSg})`
    });
}
//# sourceMappingURL=translate.js.map