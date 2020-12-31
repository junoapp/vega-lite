"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUnitLayoutSize = exports.parseChildrenLayoutSize = exports.parseConcatLayoutSize = exports.parseLayerLayoutSize = void 0;
const channel_1 = require("../../channel");
const config_1 = require("../../config");
const scale_1 = require("../../scale");
const base_1 = require("../../spec/base");
const vega_schema_1 = require("../../vega.schema");
const resolve_1 = require("../resolve");
const split_1 = require("../split");
const component_1 = require("./component");
function parseLayerLayoutSize(model) {
    parseChildrenLayoutSize(model);
    parseNonUnitLayoutSizeForChannel(model, 'width');
    parseNonUnitLayoutSizeForChannel(model, 'height');
}
exports.parseLayerLayoutSize = parseLayerLayoutSize;
function parseConcatLayoutSize(model) {
    parseChildrenLayoutSize(model);
    // for columns === 1 (vconcat), we can completely merge width. Otherwise, we can treat merged width as childWidth.
    const widthType = model.layout.columns === 1 ? 'width' : 'childWidth';
    // for columns === undefined (hconcat), we can completely merge height. Otherwise, we can treat merged height as childHeight.
    const heightType = model.layout.columns === undefined ? 'height' : 'childHeight';
    parseNonUnitLayoutSizeForChannel(model, widthType);
    parseNonUnitLayoutSizeForChannel(model, heightType);
}
exports.parseConcatLayoutSize = parseConcatLayoutSize;
function parseChildrenLayoutSize(model) {
    for (const child of model.children) {
        child.parseLayoutSize();
    }
}
exports.parseChildrenLayoutSize = parseChildrenLayoutSize;
/**
 * Merge child layout size (width or height).
 */
function parseNonUnitLayoutSizeForChannel(model, layoutSizeType) {
    var _a;
    /*
     * For concat, the parent width or height might not be the same as the children's shared height.
     * For example, hconcat's subviews may share width, but the shared width is not the hconcat view's width.
     *
     * layoutSizeType represents the output of the view (could be childWidth/childHeight/width/height)
     * while the sizeType represents the properties of the child.
     */
    const sizeType = component_1.getSizeTypeFromLayoutSizeType(layoutSizeType);
    const channel = channel_1.getPositionScaleChannel(sizeType);
    const resolve = model.component.resolve;
    const layoutSizeCmpt = model.component.layoutSize;
    let mergedSize;
    // Try to merge layout size
    for (const child of model.children) {
        const childSize = child.component.layoutSize.getWithExplicit(sizeType);
        const scaleResolve = (_a = resolve.scale[channel]) !== null && _a !== void 0 ? _a : resolve_1.defaultScaleResolve(channel, model);
        if (scaleResolve === 'independent' && childSize.value === 'step') {
            // Do not merge independent scales with range-step as their size depends
            // on the scale domains, which can be different between scales.
            mergedSize = undefined;
            break;
        }
        if (mergedSize) {
            if (scaleResolve === 'independent' && mergedSize.value !== childSize.value) {
                // For independent scale, only merge if all the sizes are the same.
                // If the values are different, abandon the merge!
                mergedSize = undefined;
                break;
            }
            mergedSize = split_1.mergeValuesWithExplicit(mergedSize, childSize, sizeType, '');
        }
        else {
            mergedSize = childSize;
        }
    }
    if (mergedSize) {
        // If merged, rename size and set size of all children.
        for (const child of model.children) {
            model.renameSignal(child.getName(sizeType), model.getName(layoutSizeType));
            child.component.layoutSize.set(sizeType, 'merged', false);
        }
        layoutSizeCmpt.setWithExplicit(layoutSizeType, mergedSize);
    }
    else {
        layoutSizeCmpt.setWithExplicit(layoutSizeType, {
            explicit: false,
            value: undefined
        });
    }
}
function parseUnitLayoutSize(model) {
    const { size, component } = model;
    for (const channel of channel_1.POSITION_SCALE_CHANNELS) {
        const sizeType = channel_1.getSizeChannel(channel);
        if (size[sizeType]) {
            const specifiedSize = size[sizeType];
            component.layoutSize.set(sizeType, base_1.isStep(specifiedSize) ? 'step' : specifiedSize, true);
        }
        else {
            const defaultSize = defaultUnitSize(model, sizeType);
            component.layoutSize.set(sizeType, defaultSize, false);
        }
    }
}
exports.parseUnitLayoutSize = parseUnitLayoutSize;
function defaultUnitSize(model, sizeType) {
    const channel = sizeType === 'width' ? 'x' : 'y';
    const config = model.config;
    const scaleComponent = model.getScaleComponent(channel);
    if (scaleComponent) {
        const scaleType = scaleComponent.get('type');
        const range = scaleComponent.get('range');
        if (scale_1.hasDiscreteDomain(scaleType)) {
            const size = config_1.getViewConfigDiscreteSize(config.view, sizeType);
            if (vega_schema_1.isVgRangeStep(range) || base_1.isStep(size)) {
                // For discrete domain with range.step, use dynamic width/height
                return 'step';
            }
            else {
                return size;
            }
        }
        else {
            return config_1.getViewConfigContinuousSize(config.view, sizeType);
        }
    }
    else if (model.hasProjection || model.mark === 'arc') {
        // arc should use continuous size by default otherwise the pie is extremely small
        return config_1.getViewConfigContinuousSize(config.view, sizeType);
    }
    else {
        const size = config_1.getViewConfigDiscreteSize(config.view, sizeType);
        return base_1.isStep(size) ? size.step : size;
    }
}
//# sourceMappingURL=parse.js.map