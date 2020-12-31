"use strict";
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
exports.assembleScaleRange = exports.assembleScalesForModel = exports.assembleScales = void 0;
const vega_util_1 = require("vega-util");
const channel_1 = require("../../channel");
const util_1 = require("../../util");
const vega_schema_1 = require("../../vega.schema");
const model_1 = require("../model");
const assemble_1 = require("../selection/assemble");
const domain_1 = require("./domain");
function assembleScales(model) {
    if (model_1.isLayerModel(model) || model_1.isConcatModel(model)) {
        // For concat and layer, include scales of children too
        return model.children.reduce((scales, child) => {
            return scales.concat(assembleScales(child));
        }, assembleScalesForModel(model));
    }
    else {
        // For facet, child scales would not be included in the parent's scope.
        // For unit, there is no child.
        return assembleScalesForModel(model);
    }
}
exports.assembleScales = assembleScales;
function assembleScalesForModel(model) {
    return util_1.keys(model.component.scales).reduce((scales, channel) => {
        const scaleComponent = model.component.scales[channel];
        if (scaleComponent.merged) {
            // Skipped merged scales
            return scales;
        }
        const scale = scaleComponent.combine();
        const { name, type, selectionExtent, domains: _d, range: _r, reverse } = scale, otherScaleProps = __rest(scale, ["name", "type", "selectionExtent", "domains", "range", "reverse"]);
        const range = assembleScaleRange(scale.range, name, channel, model);
        let domainRaw;
        if (selectionExtent) {
            domainRaw = assemble_1.assembleSelectionScaleDomain(model, selectionExtent);
        }
        const domain = domain_1.assembleDomain(model, channel);
        scales.push(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ name,
            type }, (domain ? { domain } : {})), (domainRaw ? { domainRaw } : {})), { range }), (reverse !== undefined ? { reverse: reverse } : {})), otherScaleProps));
        return scales;
    }, []);
}
exports.assembleScalesForModel = assembleScalesForModel;
function assembleScaleRange(scaleRange, scaleName, channel, model) {
    // add signals to x/y range
    if (channel_1.isXorY(channel)) {
        if (vega_schema_1.isVgRangeStep(scaleRange)) {
            // For width/height step, use a signal created in layout assemble instead of a constant step.
            return {
                step: { signal: `${scaleName}_step` }
            };
        }
    }
    else if (vega_util_1.isObject(scaleRange) && vega_schema_1.isDataRefDomain(scaleRange)) {
        return Object.assign(Object.assign({}, scaleRange), { data: model.lookupDataSource(scaleRange.data) });
    }
    return scaleRange;
}
exports.assembleScaleRange = assembleScaleRange;
//# sourceMappingURL=assemble.js.map