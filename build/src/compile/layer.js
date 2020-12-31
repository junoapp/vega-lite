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
exports.LayerModel = void 0;
const log = __importStar(require("../log"));
const spec_1 = require("../spec");
const util_1 = require("../util");
const assemble_1 = require("./axis/assemble");
const parse_1 = require("./axis/parse");
const parse_2 = require("./data/parse");
const assemble_2 = require("./layoutsize/assemble");
const parse_3 = require("./layoutsize/parse");
const assemble_3 = require("./legend/assemble");
const model_1 = require("./model");
const assemble_4 = require("./selection/assemble");
const unit_1 = require("./unit");
class LayerModel extends model_1.Model {
    constructor(spec, parent, parentGivenName, parentGivenSize, config) {
        super(spec, 'layer', parent, parentGivenName, config, spec.resolve, spec.view);
        const layoutSize = Object.assign(Object.assign(Object.assign({}, parentGivenSize), (spec.width ? { width: spec.width } : {})), (spec.height ? { height: spec.height } : {}));
        this.children = spec.layer.map((layer, i) => {
            if (spec_1.isLayerSpec(layer)) {
                return new LayerModel(layer, this, this.getName(`layer_${i}`), layoutSize, config);
            }
            else if (spec_1.isUnitSpec(layer)) {
                return new unit_1.UnitModel(layer, this, this.getName(`layer_${i}`), layoutSize, config);
            }
            throw new Error(log.message.invalidSpec(layer));
        });
    }
    parseData() {
        this.component.data = parse_2.parseData(this);
        for (const child of this.children) {
            child.parseData();
        }
    }
    parseLayoutSize() {
        parse_3.parseLayerLayoutSize(this);
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
        parse_1.parseLayerAxes(this);
    }
    assembleSelectionTopLevelSignals(signals) {
        return this.children.reduce((sg, child) => child.assembleSelectionTopLevelSignals(sg), signals);
    }
    // TODO: Support same named selections across children.
    assembleSignals() {
        return this.children.reduce((signals, child) => {
            return signals.concat(child.assembleSignals());
        }, assemble_1.assembleAxisSignals(this));
    }
    assembleLayoutSignals() {
        return this.children.reduce((signals, child) => {
            return signals.concat(child.assembleLayoutSignals());
        }, assemble_2.assembleLayoutSignals(this));
    }
    assembleSelectionData(data) {
        return this.children.reduce((db, child) => child.assembleSelectionData(db), data);
    }
    assembleTitle() {
        let title = super.assembleTitle();
        if (title) {
            return title;
        }
        // If title does not provide layer, look into children
        for (const child of this.children) {
            title = child.assembleTitle();
            if (title) {
                return title;
            }
        }
        return undefined;
    }
    assembleLayout() {
        return null;
    }
    assembleMarks() {
        return assemble_4.assembleLayerSelectionMarks(this, this.children.flatMap(child => {
            return child.assembleMarks();
        }));
    }
    assembleLegends() {
        return this.children.reduce((legends, child) => {
            return legends.concat(child.assembleLegends());
        }, assemble_3.assembleLegends(this));
    }
}
exports.LayerModel = LayerModel;
//# sourceMappingURL=layer.js.map