"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vega_util_1 = require("vega-util");
const __1 = require("..");
const util_1 = require("../../../util");
const assemble_1 = require("../assemble");
const nearest_1 = __importDefault(require("./nearest"));
const project_1 = require("./project");
const selection_1 = require("../../../selection");
const inputBindings = {
    has: selCmpt => {
        return (selCmpt.type === 'single' &&
            selCmpt.resolve === 'global' &&
            selCmpt.bind &&
            selCmpt.bind !== 'scales' &&
            !selection_1.isLegendBinding(selCmpt.bind));
    },
    parse: (model, selCmpt, selDef, origDef) => {
        // Binding a selection to input widgets disables default direct manipulation interaction.
        // A user can choose to re-enable it by explicitly specifying triggering input events.
        if (!origDef.on)
            delete selCmpt.events;
        if (!origDef.clear)
            delete selCmpt.clear;
    },
    topLevelSignals: (model, selCmpt, signals) => {
        const name = selCmpt.name;
        const proj = selCmpt.project;
        const bind = selCmpt.bind;
        const init = selCmpt.init && selCmpt.init[0]; // Can only exist on single selections (one initial value).
        const datum = nearest_1.default.has(selCmpt) ? '(item().isVoronoi ? datum.datum : datum)' : 'datum';
        proj.items.forEach((p, i) => {
            var _a, _b;
            const sgname = util_1.varName(`${name}_${p.field}`);
            const hasSignal = signals.filter(s => s.name === sgname);
            if (!hasSignal.length) {
                signals.unshift(Object.assign(Object.assign({ name: sgname }, (init ? { init: assemble_1.assembleInit(init[i]) } : { value: null })), { on: selCmpt.events
                        ? [
                            {
                                events: selCmpt.events,
                                update: `datum && item().mark.marktype !== 'group' ? ${datum}[${vega_util_1.stringValue(p.field)}] : null`
                            }
                        ]
                        : [], bind: (_b = (_a = bind[p.field]) !== null && _a !== void 0 ? _a : bind[p.channel]) !== null && _b !== void 0 ? _b : bind }));
            }
        });
        return signals;
    },
    signals: (model, selCmpt, signals) => {
        const name = selCmpt.name;
        const proj = selCmpt.project;
        const signal = signals.filter(s => s.name === name + __1.TUPLE)[0];
        const fields = name + project_1.TUPLE_FIELDS;
        const values = proj.items.map(p => util_1.varName(`${name}_${p.field}`));
        const valid = values.map(v => `${v} !== null`).join(' && ');
        if (values.length) {
            signal.update = `${valid} ? {fields: ${fields}, values: [${values.join(', ')}]} : null`;
        }
        delete signal.value;
        delete signal.on;
        return signals;
    }
};
exports.default = inputBindings;
//# sourceMappingURL=inputs.js.map