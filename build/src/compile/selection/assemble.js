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
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleSelectionScaleDomain = exports.assembleLayerSelectionMarks = exports.assembleUnitSelectionMarks = exports.assembleUnitSelectionData = exports.assembleTopLevelSignals = exports.assembleFacetSignals = exports.assembleUnitSelectionSignals = exports.assembleInit = void 0;
const vega_event_selector_1 = require("vega-event-selector");
const vega_util_1 = require("vega-util");
const _1 = require(".");
const datetime_1 = require("../../datetime");
const util_1 = require("../../util");
const model_1 = require("../model");
const transforms_1 = require("./transforms/transforms");
const parse_1 = require("./parse");
function assembleInit(init, isExpr = true, wrap = vega_util_1.identity) {
    if (vega_util_1.isArray(init)) {
        const assembled = init.map(v => assembleInit(v, isExpr, wrap));
        return isExpr ? `[${assembled.join(', ')}]` : assembled;
    }
    else if (datetime_1.isDateTime(init)) {
        if (isExpr) {
            return wrap(datetime_1.dateTimeToExpr(init));
        }
        else {
            return wrap(datetime_1.dateTimeToTimestamp(init));
        }
    }
    return isExpr ? wrap(util_1.stringify(init)) : init;
}
exports.assembleInit = assembleInit;
function assembleUnitSelectionSignals(model, signals) {
    _1.forEachSelection(model, (selCmpt, selCompiler) => {
        const name = selCmpt.name;
        let modifyExpr = selCompiler.modifyExpr(model, selCmpt);
        signals.push(...selCompiler.signals(model, selCmpt));
        transforms_1.forEachTransform(selCmpt, txCompiler => {
            if (txCompiler.signals) {
                signals = txCompiler.signals(model, selCmpt, signals);
            }
            if (txCompiler.modifyExpr) {
                modifyExpr = txCompiler.modifyExpr(model, selCmpt, modifyExpr);
            }
        });
        signals.push({
            name: name + _1.MODIFY,
            on: [
                {
                    events: { signal: selCmpt.name + _1.TUPLE },
                    update: `modify(${vega_util_1.stringValue(selCmpt.name + _1.STORE)}, ${modifyExpr})`
                }
            ]
        });
    });
    return cleanupEmptyOnArray(signals);
}
exports.assembleUnitSelectionSignals = assembleUnitSelectionSignals;
function assembleFacetSignals(model, signals) {
    if (model.component.selection && util_1.keys(model.component.selection).length) {
        const name = vega_util_1.stringValue(model.getName('cell'));
        signals.unshift({
            name: 'facet',
            value: {},
            on: [
                {
                    events: vega_event_selector_1.selector('mousemove', 'scope'),
                    update: `isTuple(facet) ? facet : group(${name}).datum`
                }
            ]
        });
    }
    return cleanupEmptyOnArray(signals);
}
exports.assembleFacetSignals = assembleFacetSignals;
function assembleTopLevelSignals(model, signals) {
    let hasSelections = false;
    _1.forEachSelection(model, (selCmpt, selCompiler) => {
        const name = selCmpt.name;
        const store = vega_util_1.stringValue(name + _1.STORE);
        const hasSg = signals.filter(s => s.name === name);
        if (hasSg.length === 0) {
            const resolve = selCmpt.resolve === 'global' ? 'union' : selCmpt.resolve;
            const isMulti = selCmpt.type === 'multi' ? ', true)' : ')';
            signals.push({
                name: selCmpt.name,
                update: `${_1.VL_SELECTION_RESOLVE}(${store}, ${vega_util_1.stringValue(resolve)}${isMulti}`
            });
        }
        hasSelections = true;
        if (selCompiler.topLevelSignals) {
            signals = selCompiler.topLevelSignals(model, selCmpt, signals);
        }
        transforms_1.forEachTransform(selCmpt, txCompiler => {
            if (txCompiler.topLevelSignals) {
                signals = txCompiler.topLevelSignals(model, selCmpt, signals);
            }
        });
    });
    if (hasSelections) {
        const hasUnit = signals.filter(s => s.name === 'unit');
        if (hasUnit.length === 0) {
            signals.unshift({
                name: 'unit',
                value: {},
                on: [{ events: 'mousemove', update: 'isTuple(group()) ? group() : unit' }]
            });
        }
    }
    return cleanupEmptyOnArray(signals);
}
exports.assembleTopLevelSignals = assembleTopLevelSignals;
function assembleUnitSelectionData(model, data) {
    const dataCopy = [...data];
    _1.forEachSelection(model, selCmpt => {
        const init = { name: selCmpt.name + _1.STORE };
        if (selCmpt.init) {
            const fields = selCmpt.project.items.map(proj => {
                const { signals } = proj, rest = __rest(proj, ["signals"]);
                return rest;
            });
            const insert = selCmpt.init.map(i => assembleInit(i, false));
            init.values =
                selCmpt.type === 'interval'
                    ? [{ unit: _1.unitName(model, { escape: false }), fields, values: insert }]
                    : insert.map(i => ({ unit: _1.unitName(model, { escape: false }), fields, values: i }));
        }
        const contains = dataCopy.filter(d => d.name === selCmpt.name + _1.STORE);
        if (!contains.length) {
            dataCopy.push(init);
        }
    });
    return dataCopy;
}
exports.assembleUnitSelectionData = assembleUnitSelectionData;
function assembleUnitSelectionMarks(model, marks) {
    _1.forEachSelection(model, (selCmpt, selCompiler) => {
        marks = selCompiler.marks ? selCompiler.marks(model, selCmpt, marks) : marks;
        transforms_1.forEachTransform(selCmpt, txCompiler => {
            if (txCompiler.marks) {
                marks = txCompiler.marks(model, selCmpt, marks);
            }
        });
    });
    return marks;
}
exports.assembleUnitSelectionMarks = assembleUnitSelectionMarks;
function assembleLayerSelectionMarks(model, marks) {
    for (const child of model.children) {
        if (model_1.isUnitModel(child)) {
            marks = assembleUnitSelectionMarks(child, marks);
        }
    }
    return marks;
}
exports.assembleLayerSelectionMarks = assembleLayerSelectionMarks;
function assembleSelectionScaleDomain(model, extent) {
    const name = extent.selection;
    const selCmpt = model.getSelectionComponent(name, util_1.varName(name));
    return { signal: parse_1.parseSelectionBinExtent(selCmpt, extent) };
}
exports.assembleSelectionScaleDomain = assembleSelectionScaleDomain;
function cleanupEmptyOnArray(signals) {
    return signals.map(s => {
        if (s.on && !s.on.length)
            delete s.on;
        return s;
    });
}
//# sourceMappingURL=assemble.js.map