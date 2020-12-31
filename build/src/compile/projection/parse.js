"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseProjection = void 0;
const vega_util_1 = require("vega-util");
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const data_1 = require("../../data");
const expr_1 = require("../../expr");
const projection_1 = require("../../projection");
const type_1 = require("../../type");
const util_1 = require("../../util");
const model_1 = require("../model");
const component_1 = require("./component");
function parseProjection(model) {
    model.component.projection = model_1.isUnitModel(model) ? parseUnitProjection(model) : parseNonUnitProjections(model);
}
exports.parseProjection = parseProjection;
function parseUnitProjection(model) {
    var _a;
    if (model.hasProjection) {
        const proj = expr_1.replaceExprRef(model.specifiedProjection);
        const fit = !(proj && (proj.scale != null || proj.translate != null));
        const size = fit ? [model.getSizeSignalRef('width'), model.getSizeSignalRef('height')] : undefined;
        const data = fit ? gatherFitData(model) : undefined;
        const projComp = new component_1.ProjectionComponent(model.projectionName(true), Object.assign(Object.assign({}, ((_a = expr_1.replaceExprRef(model.config.projection)) !== null && _a !== void 0 ? _a : {})), (proj !== null && proj !== void 0 ? proj : {})), size, data);
        if (!projComp.get('type')) {
            projComp.set('type', 'equalEarth', false);
        }
        return projComp;
    }
    return undefined;
}
function gatherFitData(model) {
    const data = [];
    const { encoding } = model;
    for (const posssiblePair of [
        [channel_1.LONGITUDE, channel_1.LATITUDE],
        [channel_1.LONGITUDE2, channel_1.LATITUDE2]
    ]) {
        if (channeldef_1.getFieldOrDatumDef(encoding[posssiblePair[0]]) || channeldef_1.getFieldOrDatumDef(encoding[posssiblePair[1]])) {
            data.push({
                signal: model.getName(`geojson_${data.length}`)
            });
        }
    }
    if (model.channelHasField(channel_1.SHAPE) && model.typedFieldDef(channel_1.SHAPE).type === type_1.GEOJSON) {
        data.push({
            signal: model.getName(`geojson_${data.length}`)
        });
    }
    if (data.length === 0) {
        // main source is geojson, so we can just use that
        data.push(model.requestDataName(data_1.DataSourceType.Main));
    }
    return data;
}
function mergeIfNoConflict(first, second) {
    const allPropertiesShared = util_1.every(projection_1.PROJECTION_PROPERTIES, prop => {
        // neither has the property
        if (!vega_util_1.hasOwnProperty(first.explicit, prop) && !vega_util_1.hasOwnProperty(second.explicit, prop)) {
            return true;
        }
        // both have property and an equal value for property
        if (vega_util_1.hasOwnProperty(first.explicit, prop) &&
            vega_util_1.hasOwnProperty(second.explicit, prop) &&
            // some properties might be signals or objects and require hashing for comparison
            util_1.deepEqual(first.get(prop), second.get(prop))) {
            return true;
        }
        return false;
    });
    const size = util_1.deepEqual(first.size, second.size);
    if (size) {
        if (allPropertiesShared) {
            return first;
        }
        else if (util_1.deepEqual(first.explicit, {})) {
            return second;
        }
        else if (util_1.deepEqual(second.explicit, {})) {
            return first;
        }
    }
    // if all properties don't match, let each unit spec have its own projection
    return null;
}
function parseNonUnitProjections(model) {
    if (model.children.length === 0) {
        return undefined;
    }
    let nonUnitProjection;
    // parse all children first
    for (const child of model.children) {
        parseProjection(child);
    }
    // analyze parsed projections, attempt to merge
    const mergable = util_1.every(model.children, child => {
        const projection = child.component.projection;
        if (!projection) {
            // child layer does not use a projection
            return true;
        }
        else if (!nonUnitProjection) {
            // cached 'projection' is null, cache this one
            nonUnitProjection = projection;
            return true;
        }
        else {
            const merge = mergeIfNoConflict(nonUnitProjection, projection);
            if (merge) {
                nonUnitProjection = merge;
            }
            return !!merge;
        }
    });
    // if cached one and all other children share the same projection,
    if (nonUnitProjection && mergable) {
        // so we can elevate it to the layer level
        const name = model.projectionName(true);
        const modelProjection = new component_1.ProjectionComponent(name, nonUnitProjection.specifiedProjection, nonUnitProjection.size, util_1.duplicate(nonUnitProjection.data));
        // rename and assign all others as merged
        for (const child of model.children) {
            const projection = child.component.projection;
            if (projection) {
                if (projection.isFit) {
                    modelProjection.data.push(...child.component.projection.data);
                }
                child.renameProjection(projection.get('name'), name);
                projection.merged = true;
            }
        }
        return modelProjection;
    }
    return undefined;
}
//# sourceMappingURL=parse.js.map