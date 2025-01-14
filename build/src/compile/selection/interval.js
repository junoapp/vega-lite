"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCALE_TRIGGER = exports.BRUSH = void 0;
const vega_util_1 = require("vega-util");
const _1 = require(".");
const channel_1 = require("../../channel");
const log_1 = require("../../log");
const scale_1 = require("../../scale");
const util_1 = require("../../util");
const assemble_1 = require("./assemble");
const project_1 = require("./transforms/project");
const scales_1 = __importDefault(require("./transforms/scales"));
exports.BRUSH = '_brush';
exports.SCALE_TRIGGER = '_scale_trigger';
const interval = {
    signals: (model, selCmpt) => {
        const name = selCmpt.name;
        const fieldsSg = name + project_1.TUPLE_FIELDS;
        const hasScales = scales_1.default.has(selCmpt);
        const signals = [];
        const dataSignals = [];
        const scaleTriggers = [];
        if (selCmpt.translate && !hasScales) {
            const filterExpr = `!event.item || event.item.mark.name !== ${vega_util_1.stringValue(name + exports.BRUSH)}`;
            events(selCmpt, (on, evt) => {
                var _a;
                const filters = vega_util_1.array((_a = evt.between[0].filter) !== null && _a !== void 0 ? _a : (evt.between[0].filter = []));
                if (!filters.includes(filterExpr)) {
                    filters.push(filterExpr);
                }
                return on;
            });
        }
        selCmpt.project.items.forEach((proj, i) => {
            const channel = proj.channel;
            if (channel !== channel_1.X && channel !== channel_1.Y) {
                log_1.warn('Interval selections only support x and y encoding channels.');
                return;
            }
            const init = selCmpt.init ? selCmpt.init[i] : null;
            const cs = channelSignals(model, selCmpt, proj, init);
            const dname = proj.signals.data;
            const vname = proj.signals.visual;
            const scaleName = vega_util_1.stringValue(model.scaleName(channel));
            const scaleType = model.getScaleComponent(channel).get('type');
            const toNum = scale_1.hasContinuousDomain(scaleType) ? '+' : '';
            signals.push(...cs);
            dataSignals.push(dname);
            scaleTriggers.push({
                scaleName: model.scaleName(channel),
                expr: `(!isArray(${dname}) || ` +
                    `(${toNum}invert(${scaleName}, ${vname})[0] === ${toNum}${dname}[0] && ` +
                    `${toNum}invert(${scaleName}, ${vname})[1] === ${toNum}${dname}[1]))`
            });
        });
        // Proxy scale reactions to ensure that an infinite loop doesn't occur
        // when an interval selection filter touches the scale.
        if (!hasScales) {
            signals.push({
                name: name + exports.SCALE_TRIGGER,
                value: {},
                on: [
                    {
                        events: scaleTriggers.map(t => ({ scale: t.scaleName })),
                        update: `${scaleTriggers.map(t => t.expr).join(' && ')} ? ${name + exports.SCALE_TRIGGER} : {}`
                    }
                ]
            });
        }
        // Only add an interval to the store if it has valid data extents. Data extents
        // are set to null if pixel extents are equal to account for intervals over
        // ordinal/nominal domains which, when inverted, will still produce a valid datum.
        const init = selCmpt.init;
        const update = `unit: ${_1.unitName(model)}, fields: ${fieldsSg}, values`;
        return signals.concat(Object.assign(Object.assign({ name: name + _1.TUPLE }, (init ? { init: `{${update}: ${assemble_1.assembleInit(init)}}` } : {})), { on: [
                {
                    events: [{ signal: dataSignals.join(' || ') }],
                    update: `${dataSignals.join(' && ')} ? {${update}: [${dataSignals}]} : null`
                }
            ] }));
    },
    modifyExpr: (model, selCmpt) => {
        const tpl = selCmpt.name + _1.TUPLE;
        return `${tpl}, ${selCmpt.resolve === 'global' ? 'true' : `{unit: ${_1.unitName(model)}}`}`;
    },
    marks: (model, selCmpt, marks) => {
        const name = selCmpt.name;
        const { x, y } = selCmpt.project.hasChannel;
        const xvname = x && x.signals.visual;
        const yvname = y && y.signals.visual;
        const store = `data(${vega_util_1.stringValue(selCmpt.name + _1.STORE)})`;
        // Do not add a brush if we're binding to scales.
        if (scales_1.default.has(selCmpt)) {
            return marks;
        }
        const update = {
            x: x !== undefined ? { signal: `${xvname}[0]` } : { value: 0 },
            y: y !== undefined ? { signal: `${yvname}[0]` } : { value: 0 },
            x2: x !== undefined ? { signal: `${xvname}[1]` } : { field: { group: 'width' } },
            y2: y !== undefined ? { signal: `${yvname}[1]` } : { field: { group: 'height' } }
        };
        // If the selection is resolved to global, only a single interval is in
        // the store. Wrap brush mark's encodings with a production rule to test
        // this based on the `unit` property. Hide the brush mark if it corresponds
        // to a unit different from the one in the store.
        if (selCmpt.resolve === 'global') {
            for (const key of util_1.keys(update)) {
                update[key] = [
                    Object.assign({ test: `${store}.length && ${store}[0].unit === ${_1.unitName(model)}` }, update[key]),
                    { value: 0 }
                ];
            }
        }
        // Two brush marks ensure that fill colors and other aesthetic choices do
        // not interefere with the core marks, but that the brushed region can still
        // be interacted with (e.g., dragging it around).
        const _a = selCmpt.mark, { fill, fillOpacity, cursor } = _a, stroke = __rest(_a, ["fill", "fillOpacity", "cursor"]);
        const vgStroke = util_1.keys(stroke).reduce((def, k) => {
            def[k] = [
                {
                    test: [x !== undefined && `${xvname}[0] !== ${xvname}[1]`, y !== undefined && `${yvname}[0] !== ${yvname}[1]`]
                        .filter(t => t)
                        .join(' && '),
                    value: stroke[k]
                },
                { value: null }
            ];
            return def;
        }, {});
        return [
            {
                name: `${name + exports.BRUSH}_bg`,
                type: 'rect',
                clip: true,
                encode: {
                    enter: {
                        fill: { value: fill },
                        fillOpacity: { value: fillOpacity }
                    },
                    update: update
                }
            },
            ...marks,
            {
                name: name + exports.BRUSH,
                type: 'rect',
                clip: true,
                encode: {
                    enter: Object.assign(Object.assign({}, (cursor ? { cursor: { value: cursor } } : {})), { fill: { value: 'transparent' } }),
                    update: Object.assign(Object.assign({}, update), vgStroke)
                }
            }
        ];
    }
};
exports.default = interval;
/**
 * Returns the visual and data signals for an interval selection.
 */
function channelSignals(model, selCmpt, proj, init) {
    const channel = proj.channel;
    const vname = proj.signals.visual;
    const dname = proj.signals.data;
    const hasScales = scales_1.default.has(selCmpt);
    const scaleName = vega_util_1.stringValue(model.scaleName(channel));
    const scale = model.getScaleComponent(channel);
    const scaleType = scale ? scale.get('type') : undefined;
    const scaled = (str) => `scale(${scaleName}, ${str})`;
    const size = model.getSizeSignalRef(channel === channel_1.X ? 'width' : 'height').signal;
    const coord = `${channel}(unit)`;
    const on = events(selCmpt, (def, evt) => {
        return [
            ...def,
            { events: evt.between[0], update: `[${coord}, ${coord}]` },
            { events: evt, update: `[${vname}[0], clamp(${coord}, 0, ${size})]` } // Brush End
        ];
    });
    // React to pan/zooms of continuous scales. Non-continuous scales
    // (band, point) cannot be pan/zoomed and any other changes
    // to their domains (e.g., filtering) should clear the brushes.
    on.push({
        events: { signal: selCmpt.name + exports.SCALE_TRIGGER },
        update: scale_1.hasContinuousDomain(scaleType) ? `[${scaled(`${dname}[0]`)}, ${scaled(`${dname}[1]`)}]` : `[0, 0]`
    });
    return hasScales
        ? [{ name: dname, on: [] }]
        : [
            Object.assign(Object.assign({ name: vname }, (init ? { init: assemble_1.assembleInit(init, true, scaled) } : { value: [] })), { on: on }),
            Object.assign(Object.assign({ name: dname }, (init ? { init: assemble_1.assembleInit(init) } : {})), { on: [
                    {
                        events: { signal: vname },
                        update: `${vname}[0] === ${vname}[1] ? null : invert(${scaleName}, ${vname})`
                    }
                ] })
        ];
}
function events(selCmpt, cb) {
    return selCmpt.events.reduce((on, evt) => {
        if (!evt.between) {
            log_1.warn(`${evt} is not an ordered event stream for interval selections.`);
            return on;
        }
        return cb(on, evt);
    }, []);
}
//# sourceMappingURL=interval.js.map