"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFacetHeaders = exports.getHeaderType = void 0;
const vega_util_1 = require("vega-util");
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const util_1 = require("../../util");
const vega_schema_1 = require("../../vega.schema");
const assemble_1 = require("../axis/assemble");
const resolve_1 = require("../resolve");
const common_1 = require("./common");
function getHeaderType(orient) {
    if (orient === 'top' || orient === 'left' || vega_schema_1.isSignalRef(orient)) {
        // we always use header for orient signal since we can't dynamically make header becomes footer
        return 'header';
    }
    return 'footer';
}
exports.getHeaderType = getHeaderType;
function parseFacetHeaders(model) {
    for (const channel of channel_1.FACET_CHANNELS) {
        parseFacetHeader(model, channel);
    }
    mergeChildAxis(model, 'x');
    mergeChildAxis(model, 'y');
}
exports.parseFacetHeaders = parseFacetHeaders;
function parseFacetHeader(model, channel) {
    var _a;
    const { facet, config, child, component } = model;
    if (model.channelHasField(channel)) {
        const fieldDef = facet[channel];
        const titleConfig = common_1.getHeaderProperty('title', null, config, channel);
        let title = channeldef_1.title(fieldDef, config, {
            allowDisabling: true,
            includeDefault: titleConfig === undefined || !!titleConfig
        });
        if (child.component.layoutHeaders[channel].title) {
            // TODO: better handle multiline titles
            title = vega_util_1.isArray(title) ? title.join(', ') : title;
            // merge title with child to produce "Title / Subtitle / Sub-subtitle"
            title += ` / ${child.component.layoutHeaders[channel].title}`;
            child.component.layoutHeaders[channel].title = null;
        }
        const labelOrient = common_1.getHeaderProperty('labelOrient', fieldDef, config, channel);
        const header = (_a = fieldDef.header) !== null && _a !== void 0 ? _a : {};
        const labels = util_1.getFirstDefined(header.labels, config.header.labels, true);
        const headerType = util_1.contains(['bottom', 'right'], labelOrient) ? 'footer' : 'header';
        component.layoutHeaders[channel] = {
            title,
            facetFieldDef: fieldDef,
            [headerType]: channel === 'facet' ? [] : [makeHeaderComponent(model, channel, labels)]
        };
    }
}
function makeHeaderComponent(model, channel, labels) {
    const sizeType = channel === 'row' ? 'height' : 'width';
    return {
        labels,
        sizeSignal: model.child.component.layoutSize.get(sizeType) ? model.child.getSizeSignalRef(sizeType) : undefined,
        axes: []
    };
}
function mergeChildAxis(model, channel) {
    var _a;
    const { child } = model;
    if (child.component.axes[channel]) {
        const { layoutHeaders, resolve } = model.component;
        resolve.axis[channel] = resolve_1.parseGuideResolve(resolve, channel);
        if (resolve.axis[channel] === 'shared') {
            // For shared axis, move the axes to facet's header or footer
            const headerChannel = channel === 'x' ? 'column' : 'row';
            const layoutHeader = layoutHeaders[headerChannel];
            for (const axisComponent of child.component.axes[channel]) {
                const headerType = getHeaderType(axisComponent.get('orient'));
                layoutHeader[headerType] = (_a = layoutHeader[headerType]) !== null && _a !== void 0 ? _a : [makeHeaderComponent(model, headerChannel, false)];
                // FIXME: assemble shouldn't be called here, but we do it this way so we only extract the main part of the axes
                const mainAxis = assemble_1.assembleAxis(axisComponent, 'main', model.config, { header: true });
                if (mainAxis) {
                    // LayoutHeader no longer keep track of property precedence, thus let's combine.
                    layoutHeader[headerType][0].axes.push(mainAxis);
                }
                axisComponent.mainExtracted = true;
            }
        }
        else {
            // Otherwise do nothing for independent axes
        }
    }
}
//# sourceMappingURL=parse.js.map