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
exports.SelectionProjectionComponent = exports.TUPLE_FIELDS = void 0;
const vega_util_1 = require("vega-util");
const channel_1 = require("../../../channel");
const log = __importStar(require("../../../log"));
const scale_1 = require("../../../scale");
const util_1 = require("../../../util");
const timeunit_1 = require("../../data/timeunit");
exports.TUPLE_FIELDS = '_tuple_fields';
class SelectionProjectionComponent {
    constructor(...items) {
        this.items = items;
        this.hasChannel = {};
        this.hasField = {};
    }
}
exports.SelectionProjectionComponent = SelectionProjectionComponent;
const project = {
    has: () => {
        return true; // This transform handles its own defaults, so always run parse.
    },
    parse: (model, selCmpt, selDef) => {
        var _a, _b, _c;
        const name = selCmpt.name;
        const proj = (_a = selCmpt.project) !== null && _a !== void 0 ? _a : (selCmpt.project = new SelectionProjectionComponent());
        const parsed = {};
        const timeUnits = {};
        const signals = new Set();
        const signalName = (p, range) => {
            const suffix = range === 'visual' ? p.channel : p.field;
            let sg = util_1.varName(`${name}_${suffix}`);
            for (let counter = 1; signals.has(sg); counter++) {
                sg = util_1.varName(`${name}_${suffix}_${counter}`);
            }
            signals.add(sg);
            return { [range]: sg };
        };
        // If no explicit projection (either fields or encodings) is specified, set some defaults.
        // If an initial value is set, try to infer projections.
        // Otherwise, use the default configuration.
        if (!selDef.fields && !selDef.encodings) {
            const cfg = model.config.selection[selDef.type];
            if (selDef.init) {
                for (const init of vega_util_1.array(selDef.init)) {
                    for (const key of util_1.keys(init)) {
                        if (channel_1.isSingleDefUnitChannel(key)) {
                            (selDef.encodings || (selDef.encodings = [])).push(key);
                        }
                        else {
                            if (selDef.type === 'interval') {
                                log.warn(log.message.INTERVAL_INITIALIZED_WITH_X_Y);
                                selDef.encodings = cfg.encodings;
                            }
                            else {
                                (selDef.fields || (selDef.fields = [])).push(key);
                            }
                        }
                    }
                }
            }
            else {
                selDef.encodings = cfg.encodings;
                selDef.fields = cfg.fields;
            }
        }
        // TODO: find a possible channel mapping for these fields.
        for (const field of (_b = selDef.fields) !== null && _b !== void 0 ? _b : []) {
            const p = { type: 'E', field };
            p.signals = Object.assign({}, signalName(p, 'data'));
            proj.items.push(p);
            proj.hasField[field] = p;
        }
        for (const channel of (_c = selDef.encodings) !== null && _c !== void 0 ? _c : []) {
            const fieldDef = model.fieldDef(channel);
            if (fieldDef) {
                let field = fieldDef.field;
                if (fieldDef.aggregate) {
                    log.warn(log.message.cannotProjectAggregate(channel, fieldDef.aggregate));
                    continue;
                }
                else if (!field) {
                    log.warn(log.message.cannotProjectOnChannelWithoutField(channel));
                    continue;
                }
                if (fieldDef.timeUnit) {
                    field = model.vgField(channel);
                    // Construct TimeUnitComponents which will be combined into a
                    // TimeUnitNode. This node may need to be inserted into the
                    // dataflow if the selection is used across views that do not
                    // have these time units defined.
                    const component = {
                        timeUnit: fieldDef.timeUnit,
                        as: field,
                        field: fieldDef.field
                    };
                    timeUnits[util_1.hash(component)] = component;
                }
                // Prevent duplicate projections on the same field.
                // TODO: what if the same field is bound to multiple channels (e.g., SPLOM diag).
                if (!parsed[field]) {
                    // Determine whether the tuple will store enumerated or ranged values.
                    // Interval selections store ranges for continuous scales, and enumerations otherwise.
                    // Single/multi selections store ranges for binned fields, and enumerations otherwise.
                    let type = 'E';
                    if (selCmpt.type === 'interval') {
                        const scaleType = model.getScaleComponent(channel).get('type');
                        if (scale_1.hasContinuousDomain(scaleType)) {
                            type = 'R';
                        }
                    }
                    else if (fieldDef.bin) {
                        type = 'R-RE';
                    }
                    const p = { field, channel, type };
                    p.signals = Object.assign(Object.assign({}, signalName(p, 'data')), signalName(p, 'visual'));
                    proj.items.push((parsed[field] = p));
                    proj.hasField[field] = proj.hasChannel[channel] = parsed[field];
                }
            }
            else {
                log.warn(log.message.cannotProjectOnChannelWithoutField(channel));
            }
        }
        if (selDef.init) {
            const parseInit = (i) => {
                return proj.items.map(p => (i[p.channel] !== undefined ? i[p.channel] : i[p.field]));
            };
            if (selDef.type === 'interval') {
                selCmpt.init = parseInit(selDef.init);
            }
            else {
                const init = vega_util_1.array(selDef.init);
                selCmpt.init = init.map(parseInit);
            }
        }
        if (!util_1.isEmpty(timeUnits)) {
            proj.timeUnit = new timeunit_1.TimeUnitNode(null, timeUnits);
        }
    },
    signals: (model, selCmpt, allSignals) => {
        const name = selCmpt.name + exports.TUPLE_FIELDS;
        const hasSignal = allSignals.filter(s => s.name === name);
        return hasSignal.length > 0
            ? allSignals
            : allSignals.concat({
                name,
                value: selCmpt.project.items.map(proj => {
                    const { signals, hasLegend } = proj, rest = __rest(proj, ["signals", "hasLegend"]);
                    rest.field = util_1.replacePathInField(rest.field);
                    return rest;
                })
            });
    }
};
exports.default = project;
//# sourceMappingURL=project.js.map