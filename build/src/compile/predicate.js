"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expression = void 0;
const vega_util_1 = require("vega-util");
const predicate_1 = require("../predicate");
const util_1 = require("../util");
const parse_1 = require("./selection/parse");
/**
 * Converts a predicate into an expression.
 */
// model is only used for selection filters.
function expression(model, filterOp, node) {
    return util_1.logicalExpr(filterOp, (predicate) => {
        if (vega_util_1.isString(predicate)) {
            return predicate;
        }
        else if (predicate_1.isSelectionPredicate(predicate)) {
            return parse_1.parseSelectionPredicate(model, predicate.selection, node);
        }
        else {
            // Filter Object
            return predicate_1.fieldFilterExpression(predicate);
        }
    });
}
exports.expression = expression;
//# sourceMappingURL=predicate.js.map