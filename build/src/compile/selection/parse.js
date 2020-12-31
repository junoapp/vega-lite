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
exports.materializeSelections = exports.parseSelectionBinExtent = exports.parseSelectionPredicate = exports.parseUnitSelection = void 0;
const vega_event_selector_1 = require("vega-event-selector");
const vega_util_1 = require("vega-util");
const _1 = require(".");
const log_1 = require("../../log");
const util_1 = require("../../util");
const dataflow_1 = require("../data/dataflow");
const filter_1 = require("../data/filter");
const transforms_1 = require("./transforms/transforms");
const data_1 = require("../../data");
function parseUnitSelection(model, selDefs) {
    var _a;
    const selCmpts = {};
    const selectionConfig = model.config.selection;
    for (const name of util_1.keys(selDefs !== null && selDefs !== void 0 ? selDefs : {})) {
        const selDef = util_1.duplicate(selDefs[name]);
        const _b = selectionConfig[selDef.type], { fields, encodings } = _b, cfg = __rest(_b, ["fields", "encodings"]); // Project transform applies its defaults.
        // Set default values from config if a property hasn't been specified,
        // or if it is true. E.g., "translate": true should use the default
        // event handlers for translate. However, true may be a valid value for
        // a property (e.g., "nearest": true).
        for (const key in cfg) {
            // A selection should contain either `encodings` or `fields`, only use
            // default values for these two values if neither of them is specified.
            if ((key === 'encodings' && selDef.fields) || (key === 'fields' && selDef.encodings)) {
                continue;
            }
            if (key === 'mark') {
                selDef[key] = Object.assign(Object.assign({}, cfg[key]), selDef[key]);
            }
            if (selDef[key] === undefined || selDef[key] === true) {
                selDef[key] = (_a = cfg[key]) !== null && _a !== void 0 ? _a : selDef[key];
            }
        }
        const safeName = util_1.varName(name);
        const selCmpt = (selCmpts[safeName] = Object.assign(Object.assign({}, selDef), { name: safeName, events: vega_util_1.isString(selDef.on) ? vega_event_selector_1.selector(selDef.on, 'scope') : util_1.duplicate(selDef.on) }));
        transforms_1.forEachTransform(selCmpt, txCompiler => {
            if (txCompiler.has(selCmpt) && txCompiler.parse) {
                txCompiler.parse(model, selCmpt, selDef, selDefs[name]);
            }
        });
    }
    return selCmpts;
}
exports.parseUnitSelection = parseUnitSelection;
function parseSelectionPredicate(model, selections, dfnode, datum = 'datum') {
    const stores = [];
    function expr(name) {
        const vname = util_1.varName(name);
        const selCmpt = model.getSelectionComponent(vname, name);
        const store = vega_util_1.stringValue(vname + _1.STORE);
        if (selCmpt.project.timeUnit) {
            const child = dfnode !== null && dfnode !== void 0 ? dfnode : model.component.data.raw;
            const tunode = selCmpt.project.timeUnit.clone();
            if (child.parent) {
                tunode.insertAsParentOf(child);
            }
            else {
                child.parent = tunode;
            }
        }
        if (selCmpt.empty !== 'none') {
            stores.push(store);
        }
        return `vlSelectionTest(${store}, ${datum}${selCmpt.resolve === 'global' ? ')' : `, ${vega_util_1.stringValue(selCmpt.resolve)})`}`;
    }
    const predicateStr = util_1.logicalExpr(selections, expr);
    return `${stores.length ? `!(${stores.map(s => `length(data(${s}))`).join(' || ')}) || ` : ''}(${predicateStr})`;
}
exports.parseSelectionPredicate = parseSelectionPredicate;
function parseSelectionBinExtent(selCmpt, extent) {
    const encoding = extent['encoding'];
    let field = extent['field'];
    if (!encoding && !field) {
        field = selCmpt.project.items[0].field;
        if (selCmpt.project.items.length > 1) {
            log_1.warn('A "field" or "encoding" must be specified when using a selection as a scale domain. ' +
                `Using "field": ${vega_util_1.stringValue(field)}.`);
        }
    }
    else if (encoding && !field) {
        const encodings = selCmpt.project.items.filter(p => p.channel === encoding);
        if (!encodings.length || encodings.length > 1) {
            field = selCmpt.project.items[0].field;
            log_1.warn((!encodings.length ? 'No ' : 'Multiple ') +
                `matching ${vega_util_1.stringValue(encoding)} encoding found for selection ${vega_util_1.stringValue(extent.selection)}. ` +
                `Using "field": ${vega_util_1.stringValue(field)}.`);
        }
        else {
            field = encodings[0].field;
        }
    }
    return `${selCmpt.name}[${vega_util_1.stringValue(field)}]`;
}
exports.parseSelectionBinExtent = parseSelectionBinExtent;
function materializeSelections(model, main) {
    _1.forEachSelection(model, selCmpt => {
        const selection = selCmpt.name;
        const lookupName = model.getName(`lookup_${selection}`);
        model.component.data.outputNodes[lookupName] = selCmpt.materialized = new dataflow_1.OutputNode(new filter_1.FilterNode(main, model, { selection }), lookupName, data_1.DataSourceType.Lookup, model.component.data.outputNodeRefCounts);
    });
}
exports.materializeSelections = materializeSelections;
//# sourceMappingURL=parse.js.map