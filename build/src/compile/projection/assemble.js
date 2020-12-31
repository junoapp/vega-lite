"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleProjectionForModel = exports.assembleProjectionsForModelAndChildren = exports.assembleProjections = void 0;
const util_1 = require("../../util");
const vega_schema_1 = require("../../vega.schema");
const model_1 = require("../model");
function assembleProjections(model) {
    if (model_1.isLayerModel(model) || model_1.isConcatModel(model)) {
        return assembleProjectionsForModelAndChildren(model);
    }
    else {
        return assembleProjectionForModel(model);
    }
}
exports.assembleProjections = assembleProjections;
function assembleProjectionsForModelAndChildren(model) {
    return model.children.reduce((projections, child) => {
        return projections.concat(child.assembleProjections());
    }, assembleProjectionForModel(model));
}
exports.assembleProjectionsForModelAndChildren = assembleProjectionsForModelAndChildren;
function assembleProjectionForModel(model) {
    const component = model.component.projection;
    if (!component || component.merged) {
        return [];
    }
    const projection = component.combine();
    const { name } = projection; // we need to extract name so that it is always present in the output and pass TS type validation
    if (!component.data) {
        // generate custom projection, no automatic fitting
        return [
            Object.assign(Object.assign({ name }, { translate: { signal: '[width / 2, height / 2]' } }), projection)
        ];
    }
    else {
        // generate projection that uses extent fitting
        const size = {
            signal: `[${component.size.map(ref => ref.signal).join(', ')}]`
        };
        const fits = component.data.reduce((sources, data) => {
            const source = vega_schema_1.isSignalRef(data) ? data.signal : `data('${model.lookupDataSource(data)}')`;
            if (!util_1.contains(sources, source)) {
                // build a unique list of sources
                sources.push(source);
            }
            return sources;
        }, []);
        if (fits.length <= 0) {
            throw new Error("Projection's fit didn't find any data sources");
        }
        return [
            Object.assign({ name,
                size, fit: {
                    signal: fits.length > 1 ? `[${fits.join(', ')}]` : fits[0]
                } }, projection)
        ];
    }
}
exports.assembleProjectionForModel = assembleProjectionForModel;
//# sourceMappingURL=assemble.js.map