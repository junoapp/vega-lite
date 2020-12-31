"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapCondition = void 0;
const vega_util_1 = require("vega-util");
const channeldef_1 = require("../../../channeldef");
const predicate_1 = require("../../predicate");
const parse_1 = require("../../selection/parse");
/**
 * Return a mixin that includes a Vega production rule for a Vega-Lite conditional channel definition
 * or a simple mixin if channel def has no condition.
 */
function wrapCondition(model, channelDef, vgChannel, refFn) {
    const condition = channeldef_1.isConditionalDef(channelDef) && channelDef.condition;
    const valueRef = refFn(channelDef);
    if (condition) {
        const conditions = vega_util_1.array(condition);
        const vgConditions = conditions.map(c => {
            const conditionValueRef = refFn(c);
            const test = channeldef_1.isConditionalSelection(c)
                ? parse_1.parseSelectionPredicate(model, c.selection) // FIXME: remove casting once TS is no longer dumb about it
                : predicate_1.expression(model, c.test); // FIXME: remove casting once TS is no longer dumb about it
            return Object.assign({ test }, conditionValueRef);
        });
        return {
            [vgChannel]: [...vgConditions, ...(valueRef !== undefined ? [valueRef] : [])]
        };
    }
    else {
        return valueRef !== undefined ? { [vgChannel]: valueRef } : {};
    }
}
exports.wrapCondition = wrapCondition;
//# sourceMappingURL=conditional.js.map