"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.singleOrMultiSignals = void 0;
const vega_util_1 = require("vega-util");
const _1 = require(".");
const project_1 = require("./transforms/project");
function singleOrMultiSignals(model, selCmpt) {
    const name = selCmpt.name;
    const fieldsSg = name + project_1.TUPLE_FIELDS;
    const project = selCmpt.project;
    const datum = '(item().isVoronoi ? datum.datum : datum)';
    const values = project.items
        .map(p => {
        const fieldDef = model.fieldDef(p.channel);
        // Binned fields should capture extents, for a range test against the raw field.
        return fieldDef && fieldDef.bin
            ? `[${datum}[${vega_util_1.stringValue(model.vgField(p.channel, {}))}], ` +
                `${datum}[${vega_util_1.stringValue(model.vgField(p.channel, { binSuffix: 'end' }))}]]`
            : `${datum}[${vega_util_1.stringValue(p.field)}]`;
    })
        .join(', ');
    // Only add a discrete selection to the store if a datum is present _and_
    // the interaction isn't occurring on a group mark. This guards against
    // polluting interactive state with invalid values in faceted displays
    // as the group marks are also data-driven. We force the update to account
    // for constant null states but varying toggles (e.g., shift-click in
    // whitespace followed by a click in whitespace; the store should only
    // be cleared on the second click).
    const update = `unit: ${_1.unitName(model)}, fields: ${fieldsSg}, values`;
    const events = selCmpt.events;
    return [
        {
            name: name + _1.TUPLE,
            on: events
                ? [
                    {
                        events,
                        update: `datum && item().mark.marktype !== 'group' ? {${update}: [${values}]} : null`,
                        force: true
                    }
                ]
                : []
        }
    ];
}
exports.singleOrMultiSignals = singleOrMultiSignals;
const multi = {
    signals: singleOrMultiSignals,
    modifyExpr: (model, selCmpt) => {
        const tpl = selCmpt.name + _1.TUPLE;
        return `${tpl}, ${selCmpt.resolve === 'global' ? 'null' : `{unit: ${_1.unitName(model)}}`}`;
    }
};
exports.default = multi;
//# sourceMappingURL=multi.js.map