"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDependentFields = void 0;
const vega_expression_1 = require("vega-expression");
function getName(node) {
    const name = [];
    if (node.type === 'Identifier') {
        return [node.name];
    }
    if (node.type === 'Literal') {
        return [node.value];
    }
    if (node.type === 'MemberExpression') {
        name.push(...getName(node.object));
        name.push(...getName(node.property));
    }
    return name;
}
function startsWithDatum(node) {
    if (node.object.type === 'MemberExpression') {
        return startsWithDatum(node.object);
    }
    return node.object.name === 'datum';
}
function getDependentFields(expression) {
    const ast = vega_expression_1.parse(expression);
    const dependents = new Set();
    ast.visit((node) => {
        if (node.type === 'MemberExpression' && startsWithDatum(node)) {
            dependents.add(getName(node).slice(1).join('.'));
        }
    });
    return dependents;
}
exports.getDependentFields = getDependentFields;
//# sourceMappingURL=expressions.js.map