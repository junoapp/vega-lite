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
const vega_util_1 = require("vega-util");
const channel_1 = require("../../../channel");
const interval_1 = require("../interval");
const scales_1 = __importStar(require("./scales"));
const ANCHOR = '_zoom_anchor';
const DELTA = '_zoom_delta';
const zoom = {
    has: selCmpt => {
        return selCmpt.type === 'interval' && selCmpt.zoom;
    },
    signals: (model, selCmpt, signals) => {
        const name = selCmpt.name;
        const hasScales = scales_1.default.has(selCmpt);
        const delta = name + DELTA;
        const { x, y } = selCmpt.project.hasChannel;
        const sx = vega_util_1.stringValue(model.scaleName(channel_1.X));
        const sy = vega_util_1.stringValue(model.scaleName(channel_1.Y));
        let events = vega_event_selector_1.selector(selCmpt.zoom, 'scope');
        if (!hasScales) {
            events = events.map(e => ((e.markname = name + interval_1.BRUSH), e));
        }
        signals.push({
            name: name + ANCHOR,
            on: [
                {
                    events: events,
                    update: !hasScales
                        ? `{x: x(unit), y: y(unit)}`
                        : '{' +
                            [sx ? `x: invert(${sx}, x(unit))` : '', sy ? `y: invert(${sy}, y(unit))` : '']
                                .filter(expr => !!expr)
                                .join(', ') +
                            '}'
                }
            ]
        }, {
            name: delta,
            on: [
                {
                    events: events,
                    force: true,
                    update: 'pow(1.001, event.deltaY * pow(16, event.deltaMode))'
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
exports.default = zoom;
function onDelta(model, selCmpt, proj, size, signals) {
    var _a;
    const name = selCmpt.name;
    const channel = proj.channel;
    const hasScales = scales_1.default.has(selCmpt);
    const signal = signals.filter(s => s.name === proj.signals[hasScales ? 'data' : 'visual'])[0];
    const sizeSg = model.getSizeSignalRef(size).signal;
    const scaleCmpt = model.getScaleComponent(channel);
    const scaleType = scaleCmpt.get('type');
    const base = hasScales ? scales_1.domain(model, channel) : signal.name;
    const delta = name + DELTA;
    const anchor = `${name}${ANCHOR}.${channel}`;
    const zoomFn = !hasScales
        ? 'zoomLinear'
        : scaleType === 'log'
            ? 'zoomLog'
            : scaleType === 'pow'
                ? 'zoomPow'
                : 'zoomLinear';
    const update = `${zoomFn}(${base}, ${anchor}, ${delta}` +
        (hasScales && scaleType === 'pow' ? `, ${(_a = scaleCmpt.get('exponent')) !== null && _a !== void 0 ? _a : 1}` : '') +
        ')';
    signal.on.push({
        events: { signal: delta },
        update: hasScales ? update : `clampRange(${update}, 0, ${sizeSg})`
    });
}
//# sourceMappingURL=zoom.js.map