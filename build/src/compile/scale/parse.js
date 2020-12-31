"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseScaleCore = exports.parseScales = void 0;
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const mark_1 = require("../../mark");
const scale_1 = require("../../scale");
const type_1 = require("../../type");
const util_1 = require("../../util");
const model_1 = require("../model");
const resolve_1 = require("../resolve");
const split_1 = require("../split");
const component_1 = require("./component");
const domain_1 = require("./domain");
const properties_1 = require("./properties");
const type_2 = require("./type");
function parseScales(model, { ignoreRange } = {}) {
    parseScaleCore(model);
    domain_1.parseScaleDomain(model);
    for (const prop of scale_1.NON_TYPE_DOMAIN_RANGE_VEGA_SCALE_PROPERTIES) {
        properties_1.parseScaleProperty(model, prop);
    }
    if (!ignoreRange) {
        // range depends on zero
        properties_1.parseScaleRange(model);
    }
}
exports.parseScales = parseScales;
function parseScaleCore(model) {
    if (model_1.isUnitModel(model)) {
        model.component.scales = parseUnitScaleCore(model);
    }
    else {
        model.component.scales = parseNonUnitScaleCore(model);
    }
}
exports.parseScaleCore = parseScaleCore;
/**
 * Parse scales for all channels of a model.
 */
function parseUnitScaleCore(model) {
    const { encoding, mark } = model;
    return channel_1.SCALE_CHANNELS.reduce((scaleComponents, channel) => {
        const fieldOrDatumDef = channeldef_1.getFieldOrDatumDef(encoding[channel]); // must be typed def to have scale
        // Don't generate scale for shape of geoshape
        if (fieldOrDatumDef && mark === mark_1.GEOSHAPE && channel === channel_1.SHAPE && fieldOrDatumDef.type === type_1.GEOJSON) {
            return scaleComponents;
        }
        let specifiedScale = fieldOrDatumDef && fieldOrDatumDef['scale'];
        if (fieldOrDatumDef && specifiedScale !== null && specifiedScale !== false) {
            specifiedScale = specifiedScale !== null && specifiedScale !== void 0 ? specifiedScale : {};
            const sType = type_2.scaleType(specifiedScale, channel, fieldOrDatumDef, mark);
            scaleComponents[channel] = new component_1.ScaleComponent(model.scaleName(`${channel}`, true), {
                value: sType,
                explicit: specifiedScale.type === sType
            });
        }
        return scaleComponents;
    }, {});
}
const scaleTypeTieBreaker = split_1.tieBreakByComparing((st1, st2) => scale_1.scaleTypePrecedence(st1) - scale_1.scaleTypePrecedence(st2));
function parseNonUnitScaleCore(model) {
    var _a;
    const scaleComponents = (model.component.scales = {});
    const scaleTypeWithExplicitIndex = {};
    const resolve = model.component.resolve;
    // Parse each child scale and determine if a particular channel can be merged.
    for (const child of model.children) {
        parseScaleCore(child);
        // Instead of always merging right away -- check if it is compatible to merge first!
        for (const channel of util_1.keys(child.component.scales)) {
            // if resolve is undefined, set default first
            resolve.scale[channel] = (_a = resolve.scale[channel]) !== null && _a !== void 0 ? _a : resolve_1.defaultScaleResolve(channel, model);
            if (resolve.scale[channel] === 'shared') {
                const explicitScaleType = scaleTypeWithExplicitIndex[channel];
                const childScaleType = child.component.scales[channel].getWithExplicit('type');
                if (explicitScaleType) {
                    if (scale_1.scaleCompatible(explicitScaleType.value, childScaleType.value)) {
                        // merge scale component if type are compatible
                        scaleTypeWithExplicitIndex[channel] = split_1.mergeValuesWithExplicit(explicitScaleType, childScaleType, 'type', 'scale', scaleTypeTieBreaker);
                    }
                    else {
                        // Otherwise, update conflicting channel to be independent
                        resolve.scale[channel] = 'independent';
                        // Remove from the index so they don't get merged
                        delete scaleTypeWithExplicitIndex[channel];
                    }
                }
                else {
                    scaleTypeWithExplicitIndex[channel] = childScaleType;
                }
            }
        }
    }
    // Merge each channel listed in the index
    for (const channel of util_1.keys(scaleTypeWithExplicitIndex)) {
        // Create new merged scale component
        const name = model.scaleName(channel, true);
        const typeWithExplicit = scaleTypeWithExplicitIndex[channel];
        scaleComponents[channel] = new component_1.ScaleComponent(name, typeWithExplicit);
        // rename each child and mark them as merged
        for (const child of model.children) {
            const childScale = child.component.scales[channel];
            if (childScale) {
                child.renameScale(childScale.get('name'), name);
                childScale.merged = true;
            }
        }
    }
    return scaleComponents;
}
//# sourceMappingURL=parse.js.map