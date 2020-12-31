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
exports.domain = void 0;
const vega_util_1 = require("vega-util");
const __1 = require("..");
const channel_1 = require("../../../channel");
const log = __importStar(require("../../../log"));
const scale_1 = require("../../../scale");
const model_1 = require("../../model");
const scaleBindings = {
    has: selCmpt => {
        return selCmpt.type === 'interval' && selCmpt.resolve === 'global' && selCmpt.bind && selCmpt.bind === 'scales';
    },
    parse: (model, selCmpt) => {
        const bound = (selCmpt.scales = []);
        for (const proj of selCmpt.project.items) {
            const channel = proj.channel;
            if (!channel_1.isScaleChannel(channel)) {
                continue;
            }
            const scale = model.getScaleComponent(channel);
            const scaleType = scale ? scale.get('type') : undefined;
            if (!scale || !scale_1.hasContinuousDomain(scaleType)) {
                log.warn(log.message.SCALE_BINDINGS_CONTINUOUS);
                continue;
            }
            const extent = { selection: selCmpt.name, field: proj.field };
            scale.set('selectionExtent', extent, true);
            bound.push(proj);
        }
    },
    topLevelSignals: (model, selCmpt, signals) => {
        const bound = selCmpt.scales.filter(proj => signals.filter(s => s.name === proj.signals.data).length === 0);
        // Top-level signals are only needed for multiview displays and if this
        // view's top-level signals haven't already been generated.
        if (!model.parent || isTopLevelLayer(model) || bound.length === 0) {
            return signals;
        }
        // vlSelectionResolve does not account for the behavior of bound scales in
        // multiview displays. Each unit view adds a tuple to the store, but the
        // state of the selection is the unit selection most recently updated. This
        // state is captured by the top-level signals that we insert and "push
        // outer" to from within the units. We need to reassemble this state into
        // the top-level named signal, except no single selCmpt has a global view.
        const namedSg = signals.filter(s => s.name === selCmpt.name)[0];
        let update = namedSg.update;
        if (update.indexOf(__1.VL_SELECTION_RESOLVE) >= 0) {
            namedSg.update = `{${bound.map(proj => `${vega_util_1.stringValue(proj.field)}: ${proj.signals.data}`).join(', ')}}`;
        }
        else {
            for (const proj of bound) {
                const mapping = `${vega_util_1.stringValue(proj.field)}: ${proj.signals.data}`;
                if (!update.includes(mapping)) {
                    update = `${update.substring(0, update.length - 1)}, ${mapping}}`;
                }
            }
            namedSg.update = update;
        }
        return signals.concat(bound.map(proj => ({ name: proj.signals.data })));
    },
    signals: (model, selCmpt, signals) => {
        // Nested signals need only push to top-level signals with multiview displays.
        if (model.parent && !isTopLevelLayer(model)) {
            for (const proj of selCmpt.scales) {
                const signal = signals.filter(s => s.name === proj.signals.data)[0];
                signal.push = 'outer';
                delete signal.value;
                delete signal.update;
            }
        }
        return signals;
    }
};
exports.default = scaleBindings;
function domain(model, channel) {
    const scale = vega_util_1.stringValue(model.scaleName(channel));
    return `domain(${scale})`;
}
exports.domain = domain;
function isTopLevelLayer(model) {
    var _a;
    return model.parent && model_1.isLayerModel(model.parent) && ((_a = !model.parent.parent) !== null && _a !== void 0 ? _a : isTopLevelLayer(model.parent.parent));
}
//# sourceMappingURL=scales.js.map