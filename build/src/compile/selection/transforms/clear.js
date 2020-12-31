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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vega_event_selector_1 = require("vega-event-selector");
const vega_util_1 = require("vega-util");
const __1 = require("..");
const util_1 = require("../../../util");
const inputs_1 = __importDefault(require("./inputs"));
const toggle_1 = __importStar(require("./toggle"));
const clear = {
    has: selCmpt => {
        return selCmpt.clear !== undefined && selCmpt.clear !== false;
    },
    parse: (model, selCmpt, selDef) => {
        if (selDef.clear) {
            selCmpt.clear = vega_util_1.isString(selDef.clear) ? vega_event_selector_1.selector(selDef.clear, 'scope') : selDef.clear;
        }
    },
    topLevelSignals: (model, selCmpt, signals) => {
        if (inputs_1.default.has(selCmpt)) {
            for (const proj of selCmpt.project.items) {
                const idx = signals.findIndex(n => n.name === util_1.varName(`${selCmpt.name}_${proj.field}`));
                if (idx !== -1) {
                    signals[idx].on.push({ events: selCmpt.clear, update: 'null' });
                }
            }
        }
        return signals;
    },
    signals: (model, selCmpt, signals) => {
        function addClear(idx, update) {
            if (idx !== -1 && signals[idx].on) {
                signals[idx].on.push({ events: selCmpt.clear, update });
            }
        }
        // Be as minimalist as possible when adding clear triggers to minimize dataflow execution.
        if (selCmpt.type === 'interval') {
            for (const proj of selCmpt.project.items) {
                const vIdx = signals.findIndex(n => n.name === proj.signals.visual);
                addClear(vIdx, '[0, 0]');
                if (vIdx === -1) {
                    const dIdx = signals.findIndex(n => n.name === proj.signals.data);
                    addClear(dIdx, 'null');
                }
            }
        }
        else {
            let tIdx = signals.findIndex(n => n.name === selCmpt.name + __1.TUPLE);
            addClear(tIdx, 'null');
            if (toggle_1.default.has(selCmpt)) {
                tIdx = signals.findIndex(n => n.name === selCmpt.name + toggle_1.TOGGLE);
                addClear(tIdx, 'false');
            }
        }
        return signals;
    }
};
exports.default = clear;
//# sourceMappingURL=clear.js.map