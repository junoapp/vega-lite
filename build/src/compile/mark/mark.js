"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSort = exports.parseMarkGroups = void 0;
const vega_util_1 = require("vega-util");
const channeldef_1 = require("../../channeldef");
const data_1 = require("../../data");
const encoding_1 = require("../../encoding");
const mark_1 = require("../../mark");
const sort_1 = require("../../sort");
const util_1 = require("../../util");
const vega_schema_1 = require("../../vega.schema");
const common_1 = require("../common");
const arc_1 = require("./arc");
const area_1 = require("./area");
const bar_1 = require("./bar");
const geoshape_1 = require("./geoshape");
const image_1 = require("./image");
const line_1 = require("./line");
const point_1 = require("./point");
const rect_1 = require("./rect");
const rule_1 = require("./rule");
const text_1 = require("./text");
const tick_1 = require("./tick");
const markCompiler = {
    arc: arc_1.arc,
    area: area_1.area,
    bar: bar_1.bar,
    circle: point_1.circle,
    geoshape: geoshape_1.geoshape,
    image: image_1.image,
    line: line_1.line,
    point: point_1.point,
    rect: rect_1.rect,
    rule: rule_1.rule,
    square: point_1.square,
    text: text_1.text,
    tick: tick_1.tick,
    trail: line_1.trail
};
function parseMarkGroups(model) {
    if (util_1.contains([mark_1.LINE, mark_1.AREA, mark_1.TRAIL], model.mark)) {
        const details = encoding_1.pathGroupingFields(model.mark, model.encoding);
        if (details.length > 0) {
            return getPathGroups(model, details);
        }
        // otherwise use standard mark groups
    }
    else if (model.mark === mark_1.BAR) {
        const hasCornerRadius = vega_schema_1.VG_CORNERRADIUS_CHANNELS.some(prop => common_1.getMarkPropOrConfig(prop, model.markDef, model.config));
        if (model.stack && !model.fieldDef('size') && hasCornerRadius) {
            return getGroupsForStackedBarWithCornerRadius(model);
        }
    }
    return getMarkGroup(model);
}
exports.parseMarkGroups = parseMarkGroups;
const FACETED_PATH_PREFIX = 'faceted_path_';
function getPathGroups(model, details) {
    // TODO: for non-stacked plot, map order to zindex. (Maybe rename order for layer to zindex?)
    return [
        {
            name: model.getName('pathgroup'),
            type: 'group',
            from: {
                facet: {
                    name: FACETED_PATH_PREFIX + model.requestDataName(data_1.DataSourceType.Main),
                    data: model.requestDataName(data_1.DataSourceType.Main),
                    groupby: details
                }
            },
            encode: {
                update: {
                    width: { field: { group: 'width' } },
                    height: { field: { group: 'height' } }
                }
            },
            // With subfacet for line/area group, need to use faceted data from above.
            marks: getMarkGroup(model, { fromPrefix: FACETED_PATH_PREFIX })
        }
    ];
}
const STACK_GROUP_PREFIX = 'stack_group_';
/**
 * We need to put stacked bars into groups in order to enable cornerRadius for stacks.
 * If stack is used and the model doesn't have size encoding, we put the mark into groups,
 * and apply cornerRadius properties at the group.
 */
function getGroupsForStackedBarWithCornerRadius(model) {
    // Generate the mark
    const [mark] = getMarkGroup(model, { fromPrefix: STACK_GROUP_PREFIX });
    // Get the scale for the stacked field
    const fieldScale = model.scaleName(model.stack.fieldChannel);
    const stackField = (opt = {}) => model.vgField(model.stack.fieldChannel, opt);
    // Find the min/max of the pixel value on the stacked direction
    const stackFieldGroup = (func, expr) => {
        const vgFieldMinMax = [
            stackField({ prefix: 'min', suffix: 'start', expr }),
            stackField({ prefix: 'max', suffix: 'start', expr }),
            stackField({ prefix: 'min', suffix: 'end', expr }),
            stackField({ prefix: 'max', suffix: 'end', expr })
        ];
        return `${func}(${vgFieldMinMax.map(field => `scale('${fieldScale}',${field})`).join(',')})`;
    };
    let groupUpdate;
    let innerGroupUpdate;
    // Build the encoding for group and an inner group
    if (model.stack.fieldChannel === 'x') {
        // Move cornerRadius, y/yc/y2/height properties to group
        // Group x/x2 should be the min/max of the marks within
        groupUpdate = Object.assign(Object.assign({}, util_1.pick(mark.encode.update, ['y', 'yc', 'y2', 'height', ...vega_schema_1.VG_CORNERRADIUS_CHANNELS])), { x: { signal: stackFieldGroup('min', 'datum') }, x2: { signal: stackFieldGroup('max', 'datum') }, clip: { value: true } });
        // Inner group should revert the x translation, and pass height through
        innerGroupUpdate = {
            x: { field: { group: 'x' }, mult: -1 },
            height: { field: { group: 'height' } }
        };
        // The marks should use the same height as group, without y/yc/y2 properties (because it's already done by group)
        // This is why size encoding is not supported yet
        mark.encode.update = Object.assign(Object.assign({}, util_1.omit(mark.encode.update, ['y', 'yc', 'y2'])), { height: { field: { group: 'height' } } });
    }
    else {
        groupUpdate = Object.assign(Object.assign({}, util_1.pick(mark.encode.update, ['x', 'xc', 'x2', 'width'])), { y: { signal: stackFieldGroup('min', 'datum') }, y2: { signal: stackFieldGroup('max', 'datum') }, clip: { value: true } });
        innerGroupUpdate = {
            y: { field: { group: 'y' }, mult: -1 },
            width: { field: { group: 'width' } }
        };
        mark.encode.update = Object.assign(Object.assign({}, util_1.omit(mark.encode.update, ['x', 'xc', 'x2'])), { width: { field: { group: 'width' } } });
    }
    // Deal with cornerRadius properties
    for (const key of vega_schema_1.VG_CORNERRADIUS_CHANNELS) {
        const configValue = common_1.getMarkConfig(key, model.markDef, model.config);
        // Move from mark to group
        if (mark.encode.update[key]) {
            groupUpdate[key] = mark.encode.update[key];
            delete mark.encode.update[key];
        }
        else if (configValue) {
            groupUpdate[key] = common_1.signalOrValueRef(configValue);
        }
        // Overwrite any cornerRadius on mark set by config --- they are already moved to the group
        if (configValue) {
            mark.encode.update[key] = { value: 0 };
        }
    }
    const groupby = [];
    if (model.stack.groupbyChannel) {
        // For bin and time unit, we have to add bin/timeunit -end channels.
        const groupByField = model.fieldDef(model.stack.groupbyChannel);
        const field = channeldef_1.vgField(groupByField);
        if (field) {
            groupby.push(field);
        }
        if ((groupByField === null || groupByField === void 0 ? void 0 : groupByField.bin) || (groupByField === null || groupByField === void 0 ? void 0 : groupByField.timeUnit)) {
            groupby.push(channeldef_1.vgField(groupByField, { binSuffix: 'end' }));
        }
    }
    const strokeProperties = [
        'stroke',
        'strokeWidth',
        'strokeJoin',
        'strokeCap',
        'strokeDash',
        'strokeDashOffset',
        'strokeMiterLimit',
        'strokeOpacity'
    ];
    // Generate stroke properties for the group
    groupUpdate = strokeProperties.reduce((encode, prop) => {
        if (mark.encode.update[prop]) {
            return Object.assign(Object.assign({}, encode), { [prop]: mark.encode.update[prop] });
        }
        else {
            const configValue = common_1.getMarkConfig(prop, model.markDef, model.config);
            if (configValue !== undefined) {
                return Object.assign(Object.assign({}, encode), { [prop]: common_1.signalOrValueRef(configValue) });
            }
            else {
                return encode;
            }
        }
    }, groupUpdate);
    // Apply strokeForeground and strokeOffset if stroke is used
    if (groupUpdate.stroke) {
        groupUpdate.strokeForeground = { value: true };
        groupUpdate.strokeOffset = { value: 0 };
    }
    return [
        {
            type: 'group',
            from: {
                facet: {
                    data: model.requestDataName(data_1.DataSourceType.Main),
                    name: STACK_GROUP_PREFIX + model.requestDataName(data_1.DataSourceType.Main),
                    groupby,
                    aggregate: {
                        fields: [
                            stackField({ suffix: 'start' }),
                            stackField({ suffix: 'start' }),
                            stackField({ suffix: 'end' }),
                            stackField({ suffix: 'end' })
                        ],
                        ops: ['min', 'max', 'min', 'max']
                    }
                }
            },
            encode: {
                update: groupUpdate
            },
            marks: [
                {
                    type: 'group',
                    encode: { update: innerGroupUpdate },
                    marks: [mark]
                }
            ]
        }
    ];
}
function getSort(model) {
    const { encoding, stack, mark, markDef, config } = model;
    const order = encoding.order;
    if ((!vega_util_1.isArray(order) && channeldef_1.isValueDef(order) && util_1.isNullOrFalse(order.value)) ||
        (!order && util_1.isNullOrFalse(common_1.getMarkPropOrConfig('order', markDef, config)))) {
        return undefined;
    }
    else if ((vega_util_1.isArray(order) || channeldef_1.isFieldDef(order)) && !stack) {
        // Sort by the order field if it is specified and the field is not stacked. (For stacked field, order specify stack order.)
        return common_1.sortParams(order, { expr: 'datum' });
    }
    else if (mark_1.isPathMark(mark)) {
        // For both line and area, we sort values based on dimension by default
        const dimensionChannel = markDef.orient === 'horizontal' ? 'y' : 'x';
        const dimensionChannelDef = encoding[dimensionChannel];
        if (channeldef_1.isFieldDef(dimensionChannelDef)) {
            const s = dimensionChannelDef.sort;
            if (vega_util_1.isArray(s)) {
                return {
                    field: channeldef_1.vgField(dimensionChannelDef, { prefix: dimensionChannel, suffix: 'sort_index', expr: 'datum' })
                };
            }
            else if (sort_1.isSortField(s)) {
                return {
                    field: channeldef_1.vgField({
                        // FIXME: this op might not already exist?
                        // FIXME: what if dimensionChannel (x or y) contains custom domain?
                        aggregate: encoding_1.isAggregate(model.encoding) ? s.op : undefined,
                        field: s.field
                    }, { expr: 'datum' })
                };
            }
            else if (sort_1.isSortByEncoding(s)) {
                const fieldDefToSort = model.fieldDef(s.encoding);
                return {
                    field: channeldef_1.vgField(fieldDefToSort, { expr: 'datum' }),
                    order: s.order
                };
            }
            else if (s === null) {
                return undefined;
            }
            else {
                return {
                    field: channeldef_1.vgField(dimensionChannelDef, {
                        // For stack with imputation, we only have bin_mid
                        binSuffix: model.stack && model.stack.impute ? 'mid' : undefined,
                        expr: 'datum'
                    })
                };
            }
        }
        return undefined;
    }
    return undefined;
}
exports.getSort = getSort;
function getMarkGroup(model, opt = { fromPrefix: '' }) {
    const { mark, markDef, encoding, config } = model;
    const clip = util_1.getFirstDefined(markDef.clip, scaleClip(model), projectionClip(model));
    const style = common_1.getStyles(markDef);
    const key = encoding.key;
    const sort = getSort(model);
    const interactive = interactiveFlag(model);
    const aria = common_1.getMarkPropOrConfig('aria', markDef, config);
    const postEncodingTransform = markCompiler[mark].postEncodingTransform
        ? markCompiler[mark].postEncodingTransform(model)
        : null;
    return [
        Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ name: model.getName('marks'), type: markCompiler[mark].vgMark }, (clip ? { clip: true } : {})), (style ? { style } : {})), (key ? { key: key.field } : {})), (sort ? { sort } : {})), (interactive ? interactive : {})), (aria === false ? { aria } : {})), { from: { data: opt.fromPrefix + model.requestDataName(data_1.DataSourceType.Main) }, encode: {
                update: markCompiler[mark].encodeEntry(model)
            } }), (postEncodingTransform
            ? {
                transform: postEncodingTransform
            }
            : {}))
    ];
}
/**
 * If scales are bound to interval selections, we want to automatically clip
 * marks to account for panning/zooming interactions. We identify bound scales
 * by the selectionExtent property, which gets added during scale parsing.
 */
function scaleClip(model) {
    const xScale = model.getScaleComponent('x');
    const yScale = model.getScaleComponent('y');
    return (xScale && xScale.get('selectionExtent')) || (yScale && yScale.get('selectionExtent')) ? true : undefined;
}
/**
 * If we use a custom projection with auto-fitting to the geodata extent,
 * we need to clip to ensure the chart size doesn't explode.
 */
function projectionClip(model) {
    const projection = model.component.projection;
    return projection && !projection.isFit ? true : undefined;
}
/**
 * Only output interactive flags if we have selections defined somewhere in our model hierarchy.
 */
function interactiveFlag(model) {
    if (!model.component.selection)
        return null;
    const unitCount = util_1.keys(model.component.selection).length;
    let parentCount = unitCount;
    let parent = model.parent;
    while (parent && parentCount === 0) {
        parentCount = util_1.keys(parent.component.selection).length;
        parent = parent.parent;
    }
    return parentCount
        ? {
            interactive: unitCount > 0 || !!model.encoding.tooltip
        }
        : null;
}
//# sourceMappingURL=mark.js.map