"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _modified;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopDownOptimizer = exports.BottomUpOptimizer = exports.Optimizer = exports.isDataSourceNode = void 0;
const graticule_1 = require("./graticule");
const sequence_1 = require("./sequence");
const source_1 = require("./source");
/**
 * Whether this dataflow node is the source of the dataflow that produces data i.e. a source or a generator.
 */
function isDataSourceNode(node) {
    return node instanceof source_1.SourceNode || node instanceof graticule_1.GraticuleNode || node instanceof sequence_1.SequenceNode;
}
exports.isDataSourceNode = isDataSourceNode;
/**
 * Abstract base class for Dataflow optimizers.
 * Contains only mutation handling logic. Subclasses need to implement iteration logic.
 */
class Optimizer {
    constructor() {
        _modified.set(this, void 0);
        __classPrivateFieldSet(this, _modified, false);
    }
    // Once true, #modified is never set to false
    setModified() {
        __classPrivateFieldSet(this, _modified, true);
    }
    get modifiedFlag() {
        return __classPrivateFieldGet(this, _modified);
    }
}
exports.Optimizer = Optimizer;
_modified = new WeakMap();
/**
 * Starts from a node and runs the optimization function (the "run" method) upwards to the root,
 * depending on the continue and modified flag values returned by the optimization function.
 */
class BottomUpOptimizer extends Optimizer {
    /**
     * Compute a map of node depths that we can use to determine a topological sort order.
     */
    getNodeDepths(node, depth, depths) {
        depths.set(node, depth);
        for (const child of node.children) {
            this.getNodeDepths(child, depth + 1, depths);
        }
        return depths;
    }
    /**
     * Run the optimizer on all nodes starting from the leaves.
     */
    optimize(node) {
        const depths = this.getNodeDepths(node, 0, new Map());
        const topologicalSort = [...depths.entries()].sort((a, b) => b[1] - a[1]);
        for (const tuple of topologicalSort) {
            this.run(tuple[0]);
        }
        return this.modifiedFlag;
    }
}
exports.BottomUpOptimizer = BottomUpOptimizer;
/**
 * The optimizer function (the "run" method), is invoked on the given node and then continues recursively.
 */
class TopDownOptimizer extends Optimizer {
    /**
     * Run the optimizer depth first on all nodes starting from the roots.
     */
    optimize(node) {
        this.run(node);
        for (const child of node.children) {
            this.optimize(child);
        }
        return this.modifiedFlag;
    }
}
exports.TopDownOptimizer = TopDownOptimizer;
//# sourceMappingURL=optimizer.js.map