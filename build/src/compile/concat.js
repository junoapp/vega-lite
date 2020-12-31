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
exports.ConcatModel = void 0;
const log = __importStar(require("../log"));
const spec_1 = require("../spec");
const util_1 = require("../util");
const buildmodel_1 = require("./buildmodel");
const parse_1 = require("./data/parse");
const assemble_1 = require("./layoutsize/assemble");
const parse_2 = require("./layoutsize/parse");
const model_1 = require("./model");
class ConcatModel extends model_1.Model {
    constructor(spec, parent, parentGivenName, config) {
        var _a, _b, _c, _d;
        super(spec, 'concat', parent, parentGivenName, config, spec.resolve);
        if (((_b = (_a = spec.resolve) === null || _a === void 0 ? void 0 : _a.axis) === null || _b === void 0 ? void 0 : _b.x) === 'shared' || ((_d = (_c = spec.resolve) === null || _c === void 0 ? void 0 : _c.axis) === null || _d === void 0 ? void 0 : _d.y) === 'shared') {
            log.warn(log.message.CONCAT_CANNOT_SHARE_AXIS);
        }
        this.children = this.getChildren(spec).map((child, i) => {
            return buildmodel_1.buildModel(child, this, this.getName(`concat_${i}`), undefined, config);
        });
    }
    parseData() {
        this.component.data = parse_1.parseData(this);
        for (const child of this.children) {
            child.parseData();
        }
    }
    parseSelections() {
        // Merge selections up the hierarchy so that they may be referenced
        // across unit specs. Persist their definitions within each child
        // to assemble signals which remain within output Vega unit groups.
        this.component.selection = {};
        for (const child of this.children) {
            child.parseSelections();
            for (const key of util_1.keys(child.component.selection)) {
                this.component.selection[key] = child.component.selection[key];
            }
        }
    }
    parseMarkGroup() {
        for (const child of this.children) {
            child.parseMarkGroup();
        }
    }
    parseAxesAndHeaders() {
        for (const child of this.children) {
            child.parseAxesAndHeaders();
        }
        // TODO(#2415): support shared axes
    }
    getChildren(spec) {
        if (spec_1.isVConcatSpec(spec)) {
            return spec.vconcat;
        }
        else if (spec_1.isHConcatSpec(spec)) {
            return spec.hconcat;
        }
        return spec.concat;
    }
    parseLayoutSize() {
        parse_2.parseConcatLayoutSize(this);
    }
    parseAxisGroup() {
        return null;
    }
    assembleSelectionTopLevelSignals(signals) {
        return this.children.reduce((sg, child) => child.assembleSelectionTopLevelSignals(sg), signals);
    }
    assembleSignals() {
        this.children.forEach(child => child.assembleSignals());
        return [];
    }
    assembleLayoutSignals() {
        const layoutSignals = assemble_1.assembleLayoutSignals(this);
        for (const child of this.children) {
            layoutSignals.push(...child.assembleLayoutSignals());
        }
        return layoutSignals;
    }
    assembleSelectionData(data) {
        return this.children.reduce((db, child) => child.assembleSelectionData(db), data);
    }
    assembleMarks() {
        // only children have marks
        return this.children.map(child => {
            const title = child.assembleTitle();
            const style = child.assembleGroupStyle();
            const encodeEntry = child.assembleGroupEncodeEntry(false);
            return Object.assign(Object.assign(Object.assign(Object.assign({ type: 'group', name: child.getName('group') }, (title ? { title } : {})), (style ? { style } : {})), (encodeEntry ? { encode: { update: encodeEntry } } : {})), child.assembleGroup());
        });
    }
    assembleDefaultLayout() {
        const columns = this.layout.columns;
        return Object.assign(Object.assign({}, (columns != null ? { columns: columns } : {})), { bounds: 'full', 
            // Use align each so it can work with multiple plots with different size
            align: 'each' });
    }
}
exports.ConcatModel = ConcatModel;
//# sourceMappingURL=concat.js.map