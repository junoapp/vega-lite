"use strict";
/**
 * Utility for generating row / column headers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleHeaderProperties = exports.assembleLayoutTitleBand = exports.getLayoutTitleBand = exports.assembleHeaderGroup = exports.assembleLabelTitle = exports.assembleHeaderGroups = exports.defaultHeaderGuideBaseline = exports.defaultHeaderGuideAlign = exports.assembleTitleGroup = void 0;
const vega_util_1 = require("vega-util");
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const header_1 = require("../../header");
const sort_1 = require("../../sort");
const facet_1 = require("../../spec/facet");
const util_1 = require("../../util");
const properties_1 = require("../axis/properties");
const calculate_1 = require("../data/calculate");
const format_1 = require("../format");
const model_1 = require("../model");
const common_1 = require("./common");
const component_1 = require("./component");
// TODO: rename to assembleHeaderTitleGroup
function assembleTitleGroup(model, channel) {
    const title = model.component.layoutHeaders[channel].title;
    const config = model.config ? model.config : undefined;
    const facetFieldDef = model.component.layoutHeaders[channel].facetFieldDef
        ? model.component.layoutHeaders[channel].facetFieldDef
        : undefined;
    const { titleAnchor, titleAngle: ta, titleOrient } = common_1.getHeaderProperties(['titleAnchor', 'titleAngle', 'titleOrient'], facetFieldDef.header, config, channel);
    const headerChannel = common_1.getHeaderChannel(channel, titleOrient);
    const titleAngle = util_1.normalizeAngle(ta);
    return {
        name: `${channel}-title`,
        type: 'group',
        role: `${headerChannel}-title`,
        title: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ text: title }, (channel === 'row' ? { orient: 'left' } : {})), { style: 'guide-title' }), defaultHeaderGuideBaseline(titleAngle, headerChannel)), defaultHeaderGuideAlign(headerChannel, titleAngle, titleAnchor)), assembleHeaderProperties(config, facetFieldDef, channel, header_1.HEADER_TITLE_PROPERTIES, header_1.HEADER_TITLE_PROPERTIES_MAP))
    };
}
exports.assembleTitleGroup = assembleTitleGroup;
function defaultHeaderGuideAlign(headerChannel, angle, anchor = 'middle') {
    switch (anchor) {
        case 'start':
            return { align: 'left' };
        case 'end':
            return { align: 'right' };
    }
    const align = properties_1.defaultLabelAlign(angle, headerChannel === 'row' ? 'left' : 'top', headerChannel === 'row' ? 'y' : 'x');
    return align ? { align } : {};
}
exports.defaultHeaderGuideAlign = defaultHeaderGuideAlign;
function defaultHeaderGuideBaseline(angle, channel) {
    const baseline = properties_1.defaultLabelBaseline(angle, channel === 'row' ? 'left' : 'top', channel === 'row' ? 'y' : 'x', true);
    return baseline ? { baseline } : {};
}
exports.defaultHeaderGuideBaseline = defaultHeaderGuideBaseline;
function assembleHeaderGroups(model, channel) {
    const layoutHeader = model.component.layoutHeaders[channel];
    const groups = [];
    for (const headerType of component_1.HEADER_TYPES) {
        if (layoutHeader[headerType]) {
            for (const headerComponent of layoutHeader[headerType]) {
                const group = assembleHeaderGroup(model, channel, headerType, layoutHeader, headerComponent);
                if (group != null) {
                    groups.push(group);
                }
            }
        }
    }
    return groups;
}
exports.assembleHeaderGroups = assembleHeaderGroups;
function getSort(facetFieldDef, channel) {
    var _a;
    const { sort } = facetFieldDef;
    if (sort_1.isSortField(sort)) {
        return {
            field: channeldef_1.vgField(sort, { expr: 'datum' }),
            order: (_a = sort.order) !== null && _a !== void 0 ? _a : 'ascending'
        };
    }
    else if (vega_util_1.isArray(sort)) {
        return {
            field: calculate_1.sortArrayIndexField(facetFieldDef, channel, { expr: 'datum' }),
            order: 'ascending'
        };
    }
    else {
        return {
            field: channeldef_1.vgField(facetFieldDef, { expr: 'datum' }),
            order: sort !== null && sort !== void 0 ? sort : 'ascending'
        };
    }
}
function assembleLabelTitle(facetFieldDef, channel, config) {
    const { format, formatType, labelAngle, labelAnchor, labelOrient, labelExpr } = common_1.getHeaderProperties(['format', 'formatType', 'labelAngle', 'labelAnchor', 'labelOrient', 'labelExpr'], facetFieldDef.header, config, channel);
    const titleTextExpr = format_1.formatSignalRef({ fieldOrDatumDef: facetFieldDef, format, formatType, expr: 'parent', config })
        .signal;
    const headerChannel = common_1.getHeaderChannel(channel, labelOrient);
    return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ text: {
            signal: labelExpr
                ? util_1.replaceAll(util_1.replaceAll(labelExpr, 'datum.label', titleTextExpr), 'datum.value', channeldef_1.vgField(facetFieldDef, { expr: 'parent' }))
                : titleTextExpr
        } }, (channel === 'row' ? { orient: 'left' } : {})), { style: 'guide-label', frame: 'group' }), defaultHeaderGuideBaseline(labelAngle, headerChannel)), defaultHeaderGuideAlign(headerChannel, labelAngle, labelAnchor)), assembleHeaderProperties(config, facetFieldDef, channel, header_1.HEADER_LABEL_PROPERTIES, header_1.HEADER_LABEL_PROPERTIES_MAP));
}
exports.assembleLabelTitle = assembleLabelTitle;
function assembleHeaderGroup(model, channel, headerType, layoutHeader, headerComponent) {
    if (headerComponent) {
        let title = null;
        const { facetFieldDef } = layoutHeader;
        const config = model.config ? model.config : undefined;
        if (facetFieldDef && headerComponent.labels) {
            const { labelOrient } = common_1.getHeaderProperties(['labelOrient'], facetFieldDef.header, config, channel);
            // Include label title in the header if orient aligns with the channel
            if ((channel === 'row' && !util_1.contains(['top', 'bottom'], labelOrient)) ||
                (channel === 'column' && !util_1.contains(['left', 'right'], labelOrient))) {
                title = assembleLabelTitle(facetFieldDef, channel, config);
            }
        }
        const isFacetWithoutRowCol = model_1.isFacetModel(model) && !facet_1.isFacetMapping(model.facet);
        const axes = headerComponent.axes;
        const hasAxes = (axes === null || axes === void 0 ? void 0 : axes.length) > 0;
        if (title || hasAxes) {
            const sizeChannel = channel === 'row' ? 'height' : 'width';
            return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ name: model.getName(`${channel}_${headerType}`), type: 'group', role: `${channel}-${headerType}` }, (layoutHeader.facetFieldDef
                ? {
                    from: { data: model.getName(`${channel}_domain`) },
                    sort: getSort(facetFieldDef, channel)
                }
                : {})), (hasAxes && isFacetWithoutRowCol
                ? {
                    from: { data: model.getName(`facet_domain_${channel}`) }
                }
                : {})), (title ? { title } : {})), (headerComponent.sizeSignal
                ? {
                    encode: {
                        update: {
                            [sizeChannel]: headerComponent.sizeSignal
                        }
                    }
                }
                : {})), (hasAxes ? { axes } : {}));
        }
    }
    return null;
}
exports.assembleHeaderGroup = assembleHeaderGroup;
const LAYOUT_TITLE_BAND = {
    column: {
        start: 0,
        end: 1
    },
    row: {
        start: 1,
        end: 0
    }
};
function getLayoutTitleBand(titleAnchor, headerChannel) {
    return LAYOUT_TITLE_BAND[headerChannel][titleAnchor];
}
exports.getLayoutTitleBand = getLayoutTitleBand;
function assembleLayoutTitleBand(headerComponentIndex, config) {
    const titleBand = {};
    for (const channel of channel_1.FACET_CHANNELS) {
        const headerComponent = headerComponentIndex[channel];
        if (headerComponent === null || headerComponent === void 0 ? void 0 : headerComponent.facetFieldDef) {
            const { titleAnchor, titleOrient } = common_1.getHeaderProperties(['titleAnchor', 'titleOrient'], headerComponent.facetFieldDef.header, config, channel);
            const headerChannel = common_1.getHeaderChannel(channel, titleOrient);
            const band = getLayoutTitleBand(titleAnchor, headerChannel);
            if (band !== undefined) {
                titleBand[headerChannel] = band;
            }
        }
    }
    return util_1.isEmpty(titleBand) ? undefined : titleBand;
}
exports.assembleLayoutTitleBand = assembleLayoutTitleBand;
function assembleHeaderProperties(config, facetFieldDef, channel, properties, propertiesMap) {
    const props = {};
    for (const prop of properties) {
        if (!propertiesMap[prop]) {
            continue;
        }
        const value = common_1.getHeaderProperty(prop, facetFieldDef === null || facetFieldDef === void 0 ? void 0 : facetFieldDef.header, config, channel);
        if (value !== undefined) {
            props[propertiesMap[prop]] = value;
        }
    }
    return props;
}
exports.assembleHeaderProperties = assembleHeaderProperties;
//# sourceMappingURL=assemble.js.map