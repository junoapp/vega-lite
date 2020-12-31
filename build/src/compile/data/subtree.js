"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveFacetDown = void 0;
const data_1 = require("../../data");
const aggregate_1 = require("./aggregate");
const dataflow_1 = require("./dataflow");
const facet_1 = require("./facet");
const joinaggregate_1 = require("./joinaggregate");
const optimize_1 = require("./optimize");
const stack_1 = require("./stack");
const window_1 = require("./window");
/**
 * Clones the subtree and ignores output nodes except for the leaves, which are renamed.
 */
function cloneSubtree(facet) {
    function clone(node) {
        if (!(node instanceof facet_1.FacetNode)) {
            const copy = node.clone();
            if (copy instanceof dataflow_1.OutputNode) {
                const newName = optimize_1.FACET_SCALE_PREFIX + copy.getSource();
                copy.setSource(newName);
                facet.model.component.data.outputNodes[newName] = copy;
            }
            else if (copy instanceof aggregate_1.AggregateNode ||
                copy instanceof stack_1.StackNode ||
                copy instanceof window_1.WindowTransformNode ||
                copy instanceof joinaggregate_1.JoinAggregateTransformNode) {
                copy.addDimensions(facet.fields);
            }
            for (const n of node.children.flatMap(clone)) {
                n.parent = copy;
            }
            return [copy];
        }
        return node.children.flatMap(clone);
    }
    return clone;
}
/**
 * Move facet nodes down to the next fork or output node. Also pull the main output with the facet node.
 * After moving down the facet node, make a copy of the subtree and make it a child of the main output.
 */
function moveFacetDown(node) {
    if (node instanceof facet_1.FacetNode) {
        if (node.numChildren() === 1 && !(node.children[0] instanceof dataflow_1.OutputNode)) {
            // move down until we hit a fork or output node
            const child = node.children[0];
            if (child instanceof aggregate_1.AggregateNode ||
                child instanceof stack_1.StackNode ||
                child instanceof window_1.WindowTransformNode ||
                child instanceof joinaggregate_1.JoinAggregateTransformNode) {
                child.addDimensions(node.fields);
            }
            child.swapWithParent();
            moveFacetDown(node);
        }
        else {
            // move main to facet
            const facetMain = node.model.component.data.main;
            moveMainDownToFacet(facetMain);
            // replicate the subtree and place it before the facet's main node
            const cloner = cloneSubtree(node);
            const copy = node.children.map(cloner).flat();
            for (const c of copy) {
                c.parent = facetMain;
            }
        }
    }
    else {
        node.children.map(moveFacetDown);
    }
}
exports.moveFacetDown = moveFacetDown;
function moveMainDownToFacet(node) {
    if (node instanceof dataflow_1.OutputNode && node.type === data_1.DataSourceType.Main) {
        if (node.numChildren() === 1) {
            const child = node.children[0];
            if (!(child instanceof facet_1.FacetNode)) {
                child.swapWithParent();
                moveMainDownToFacet(node);
            }
        }
    }
}
//# sourceMappingURL=subtree.js.map