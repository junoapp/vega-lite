"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLegendStreamBinding = exports.isLegendBinding = exports.defaultConfig = exports.SELECTION_ID = void 0;
const vega_util_1 = require("vega-util");
exports.SELECTION_ID = '_vgsid_';
exports.defaultConfig = {
    single: {
        on: 'click',
        fields: [exports.SELECTION_ID],
        resolve: 'global',
        empty: 'all',
        clear: 'dblclick'
    },
    multi: {
        on: 'click',
        fields: [exports.SELECTION_ID],
        toggle: 'event.shiftKey',
        resolve: 'global',
        empty: 'all',
        clear: 'dblclick'
    },
    interval: {
        on: '[mousedown, window:mouseup] > window:mousemove!',
        encodings: ['x', 'y'],
        translate: '[mousedown, window:mouseup] > window:mousemove!',
        zoom: 'wheel!',
        mark: { fill: '#333', fillOpacity: 0.125, stroke: 'white' },
        resolve: 'global',
        clear: 'dblclick'
    }
};
function isLegendBinding(bind) {
    return !!bind && (bind === 'legend' || !!bind.legend);
}
exports.isLegendBinding = isLegendBinding;
function isLegendStreamBinding(bind) {
    return isLegendBinding(bind) && vega_util_1.isObject(bind);
}
exports.isLegendStreamBinding = isLegendStreamBinding;
//# sourceMappingURL=selection.js.map