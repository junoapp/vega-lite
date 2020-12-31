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
exports.optimizeDataflow = exports.checkLinks = exports.MAX_OPTIMIZATION_RUNS = exports.FACET_SCALE_PREFIX = void 0;
const log = __importStar(require("../../log"));
const optimizers = __importStar(require("./optimizers"));
const subtree_1 = require("./subtree");
exports.FACET_SCALE_PREFIX = 'scale_';
exports.MAX_OPTIMIZATION_RUNS = 5;
/**
 * Iterates over a dataflow graph and checks whether all links are consistent.
 */
function checkLinks(nodes) {
    for (const node of nodes) {
        for (const child of node.children) {
            if (child.parent !== node) {
                // log.error('Dataflow graph is inconsistent.', node, child);
                return false;
            }
        }
        if (!checkLinks(node.children)) {
            return false;
        }
    }
    return true;
}
exports.checkLinks = checkLinks;
/**
 * Run the specified optimizer on the provided nodes.
 *
 * @param optimizer The optimizer instance to run.
 * @param nodes A set of nodes to optimize.
 */
function runOptimizer(optimizer, nodes) {
    let modified = false;
    for (const node of nodes) {
        modified = optimizer.optimize(node) || modified;
    }
    return modified;
}
function optimizationDataflowHelper(dataComponent, model, firstPass) {
    let roots = dataComponent.sources;
    let modified = false;
    modified = runOptimizer(new optimizers.RemoveUnnecessaryOutputNodes(), roots) || modified;
    modified = runOptimizer(new optimizers.RemoveUnnecessaryIdentifierNodes(model), roots) || modified;
    // remove source nodes that don't have any children because they also don't have output nodes
    roots = roots.filter(r => r.numChildren() > 0);
    modified = runOptimizer(new optimizers.RemoveUnusedSubtrees(), roots) || modified;
    roots = roots.filter(r => r.numChildren() > 0);
    if (!firstPass) {
        // Only run these optimizations after the optimizer has moved down the facet node.
        // With this change, we can be more aggressive in the optimizations.
        modified = runOptimizer(new optimizers.MoveParseUp(), roots) || modified;
        modified = runOptimizer(new optimizers.MergeBins(model), roots) || modified;
        modified = runOptimizer(new optimizers.RemoveDuplicateTimeUnits(), roots) || modified;
        modified = runOptimizer(new optimizers.MergeParse(), roots) || modified;
        modified = runOptimizer(new optimizers.MergeAggregates(), roots) || modified;
        modified = runOptimizer(new optimizers.MergeTimeUnits(), roots) || modified;
        modified = runOptimizer(new optimizers.MergeIdenticalNodes(), roots) || modified;
        modified = runOptimizer(new optimizers.MergeOutputs(), roots) || modified;
    }
    dataComponent.sources = roots;
    return modified;
}
/**
 * Optimizes the dataflow of the passed in data component.
 */
function optimizeDataflow(data, model) {
    // check before optimizations
    checkLinks(data.sources);
    let firstPassCounter = 0;
    let secondPassCounter = 0;
    for (let i = 0; i < exports.MAX_OPTIMIZATION_RUNS; i++) {
        if (!optimizationDataflowHelper(data, model, true)) {
            break;
        }
        firstPassCounter++;
    }
    // move facets down and make a copy of the subtree so that we can have scales at the top level
    data.sources.map(subtree_1.moveFacetDown);
    for (let i = 0; i < exports.MAX_OPTIMIZATION_RUNS; i++) {
        if (!optimizationDataflowHelper(data, model, false)) {
            break;
        }
        secondPassCounter++;
    }
    // check after optimizations
    checkLinks(data.sources);
    if (Math.max(firstPassCounter, secondPassCounter) === exports.MAX_OPTIMIZATION_RUNS) {
        log.warn(`Maximum optimization runs(${exports.MAX_OPTIMIZATION_RUNS}) reached.`);
    }
}
exports.optimizeDataflow = optimizeDataflow;
//# sourceMappingURL=optimize.js.map