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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecMapper = void 0;
const log = __importStar(require("../log"));
const concat_1 = require("./concat");
const facet_1 = require("./facet");
const layer_1 = require("./layer");
const repeat_1 = require("./repeat");
const unit_1 = require("./unit");
class SpecMapper {
    map(spec, params) {
        if (facet_1.isFacetSpec(spec)) {
            return this.mapFacet(spec, params);
        }
        else if (repeat_1.isRepeatSpec(spec)) {
            return this.mapRepeat(spec, params);
        }
        else if (concat_1.isHConcatSpec(spec)) {
            return this.mapHConcat(spec, params);
        }
        else if (concat_1.isVConcatSpec(spec)) {
            return this.mapVConcat(spec, params);
        }
        else if (concat_1.isConcatSpec(spec)) {
            return this.mapConcat(spec, params);
        }
        else {
            return this.mapLayerOrUnit(spec, params);
        }
    }
    mapLayerOrUnit(spec, params) {
        if (layer_1.isLayerSpec(spec)) {
            return this.mapLayer(spec, params);
        }
        else if (unit_1.isUnitSpec(spec)) {
            return this.mapUnit(spec, params);
        }
        throw new Error(log.message.invalidSpec(spec));
    }
    mapLayer(spec, params) {
        return Object.assign(Object.assign({}, spec), { layer: spec.layer.map(subspec => this.mapLayerOrUnit(subspec, params)) });
    }
    mapHConcat(spec, params) {
        return Object.assign(Object.assign({}, spec), { hconcat: spec.hconcat.map(subspec => this.map(subspec, params)) });
    }
    mapVConcat(spec, params) {
        return Object.assign(Object.assign({}, spec), { vconcat: spec.vconcat.map(subspec => this.map(subspec, params)) });
    }
    mapConcat(spec, params) {
        const { concat } = spec, rest = __rest(spec, ["concat"]);
        return Object.assign(Object.assign({}, rest), { concat: concat.map(subspec => this.map(subspec, params)) });
    }
    mapFacet(spec, params) {
        return Object.assign(Object.assign({}, spec), { 
            // TODO: remove "any" once we support all facet listed in https://github.com/vega/vega-lite/issues/2760
            spec: this.map(spec.spec, params) });
    }
    mapRepeat(spec, params) {
        return Object.assign(Object.assign({}, spec), { 
            // as any is required here since TS cannot infer that the output type satisfies the input type
            spec: this.map(spec.spec, params) });
    }
}
exports.SpecMapper = SpecMapper;
//# sourceMappingURL=map.js.map