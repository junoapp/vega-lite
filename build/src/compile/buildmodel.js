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
exports.buildModel = void 0;
const log = __importStar(require("../log"));
const spec_1 = require("../spec");
const concat_1 = require("./concat");
const facet_1 = require("./facet");
const layer_1 = require("./layer");
const unit_1 = require("./unit");
function buildModel(spec, parent, parentGivenName, unitSize, config) {
    if (spec_1.isFacetSpec(spec)) {
        return new facet_1.FacetModel(spec, parent, parentGivenName, config);
    }
    else if (spec_1.isLayerSpec(spec)) {
        return new layer_1.LayerModel(spec, parent, parentGivenName, unitSize, config);
    }
    else if (spec_1.isUnitSpec(spec)) {
        return new unit_1.UnitModel(spec, parent, parentGivenName, unitSize, config);
    }
    else if (spec_1.isAnyConcatSpec(spec)) {
        return new concat_1.ConcatModel(spec, parent, parentGivenName, config);
    }
    throw new Error(log.message.invalidSpec(spec));
}
exports.buildModel = buildModel;
//# sourceMappingURL=buildmodel.js.map