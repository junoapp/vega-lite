"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scaleTypeNotWorkWithChannel = exports.cannotApplySizeToNonOrientedMark = exports.unaggregatedDomainWithLogScale = exports.unaggregateDomainWithNonSharedDomainOp = exports.unaggregateDomainHasNoEffectForRawField = exports.cannotUseScalePropertyWithNonColor = exports.CANNOT_UNION_CUSTOM_DOMAIN_WITH_FIELD_DOMAIN = exports.orientOverridden = exports.lineWithRange = exports.rangeMarkAlignmentCannotBeExpression = exports.discreteChannelCannotEncode = exports.facetChannelDropped = exports.facetChannelShouldBeDiscrete = exports.invalidEncodingChannel = exports.incompatibleChannel = exports.LINE_WITH_VARYING_SIZE = exports.emptyFieldDef = exports.droppingColor = exports.missingFieldType = exports.invalidAggregate = exports.invalidFieldTypeForCountAggregate = exports.invalidFieldType = exports.primitiveChannelDef = exports.REPLACE_ANGLE_WITH_THETA = exports.projectionOverridden = exports.customFormatTypeNotAllowed = exports.NO_FIELDS_NEEDS_AS = exports.invalidTransformIgnored = exports.ADD_SAME_CHILD_TWICE = exports.differentParse = exports.unrecognizedParse = exports.CONCAT_CANNOT_SHARE_AXIS = exports.columnsNotSupportByRowCol = exports.noSuchRepeatedValue = exports.INTERVAL_INITIALIZED_WITH_X_Y = exports.NEEDS_SAME_SELECTION = exports.noSameUnitLookup = exports.LEGEND_BINDINGS_MUST_HAVE_PROJECTION = exports.SCALE_BINDINGS_CONTINUOUS = exports.selectionNotFound = exports.selectionNotSupported = exports.nearestNotSupportForContinuous = exports.cannotProjectAggregate = exports.cannotProjectOnChannelWithoutField = exports.unknownField = exports.droppingFit = exports.containerSizeNotCompatibleWithAutosize = exports.containerSizeNonSingle = exports.FIT_NON_SINGLE = exports.invalidSpec = void 0;
exports.domainRequiredForThresholdScale = exports.channelShouldNotBeUsedForBinned = exports.channelRequiredForBinned = exports.errorBand1DNotSupport = exports.errorBarContinuousAxisHasCustomizedAggregate = exports.errorBarCenterIsUsedWithWrongExtent = exports.errorBarCenterAndExtentAreNotNeeded = exports.droppedDay = exports.invalidTimeUnit = exports.stackNonSummativeAggregate = exports.cannotStackNonLinearScale = exports.cannotStackRangedMark = exports.INVALID_CHANNEL_FOR_AXIS = exports.FACETED_INDEPENDENT_SAME_SOURCE = exports.FACETED_INDEPENDENT_SAME_FIELDS_DIFFERENT_SOURCES = exports.FACETED_INDEPENDENT_DIFFERENT_SOURCES = exports.MORE_THAN_ONE_SORT = exports.domainSortDropped = exports.independentScaleMeansIndependentGuide = exports.mergeConflictingDomainProperty = exports.mergeConflictingProperty = exports.stepDropped = exports.scaleTypeNotWorkWithMark = exports.scalePropertyNotWorkWithScaleType = exports.scaleTypeNotWorkWithFieldDef = void 0;
const channel_1 = require("../channel");
const util_1 = require("../util");
function invalidSpec(spec) {
    return `Invalid specification ${util_1.stringify(spec)}. Make sure the specification includes at least one of the following properties: "mark", "layer", "facet", "hconcat", "vconcat", "concat", or "repeat".`;
}
exports.invalidSpec = invalidSpec;
// FIT
exports.FIT_NON_SINGLE = 'Autosize "fit" only works for single views and layered views.';
function containerSizeNonSingle(name) {
    const uName = name == 'width' ? 'Width' : 'Height';
    return `${uName} "container" only works for single views and layered views.`;
}
exports.containerSizeNonSingle = containerSizeNonSingle;
function containerSizeNotCompatibleWithAutosize(name) {
    const uName = name == 'width' ? 'Width' : 'Height';
    const fitDirection = name == 'width' ? 'x' : 'y';
    return `${uName} "container" only works well with autosize "fit" or "fit-${fitDirection}".`;
}
exports.containerSizeNotCompatibleWithAutosize = containerSizeNotCompatibleWithAutosize;
function droppingFit(channel) {
    return channel
        ? `Dropping "fit-${channel}" because spec has discrete ${channel_1.getSizeChannel(channel)}.`
        : `Dropping "fit" because spec has discrete size.`;
}
exports.droppingFit = droppingFit;
// VIEW SIZE
function unknownField(channel) {
    return `Unknown field for ${channel}. Cannot calculate view size.`;
}
exports.unknownField = unknownField;
// SELECTION
function cannotProjectOnChannelWithoutField(channel) {
    return `Cannot project a selection on encoding channel "${channel}", which has no field.`;
}
exports.cannotProjectOnChannelWithoutField = cannotProjectOnChannelWithoutField;
function cannotProjectAggregate(channel, aggregate) {
    return `Cannot project a selection on encoding channel "${channel}" as it uses an aggregate function ("${aggregate}").`;
}
exports.cannotProjectAggregate = cannotProjectAggregate;
function nearestNotSupportForContinuous(mark) {
    return `The "nearest" transform is not supported for ${mark} marks.`;
}
exports.nearestNotSupportForContinuous = nearestNotSupportForContinuous;
function selectionNotSupported(mark) {
    return `Selection not supported for ${mark} yet.`;
}
exports.selectionNotSupported = selectionNotSupported;
function selectionNotFound(name) {
    return `Cannot find a selection named "${name}".`;
}
exports.selectionNotFound = selectionNotFound;
exports.SCALE_BINDINGS_CONTINUOUS = 'Scale bindings are currently only supported for scales with unbinned, continuous domains.';
exports.LEGEND_BINDINGS_MUST_HAVE_PROJECTION = 'Legend bindings are only supported for selections over an individual field or encoding channel.';
function noSameUnitLookup(name) {
    return (`Cannot define and lookup the "${name}" selection in the same view. ` +
        `Try moving the lookup into a second, layered view?`);
}
exports.noSameUnitLookup = noSameUnitLookup;
exports.NEEDS_SAME_SELECTION = 'The same selection must be used to override scale domains in a layered view.';
exports.INTERVAL_INITIALIZED_WITH_X_Y = 'Interval selections should be initialized using "x" and/or "y" keys.';
// REPEAT
function noSuchRepeatedValue(field) {
    return `Unknown repeated value "${field}".`;
}
exports.noSuchRepeatedValue = noSuchRepeatedValue;
function columnsNotSupportByRowCol(type) {
    return `The "columns" property cannot be used when "${type}" has nested row/column.`;
}
exports.columnsNotSupportByRowCol = columnsNotSupportByRowCol;
// CONCAT / REPEAT
exports.CONCAT_CANNOT_SHARE_AXIS = 'Axes cannot be shared in concatenated or repeated views yet (https://github.com/vega/vega-lite/issues/2415).';
// DATA
function unrecognizedParse(p) {
    return `Unrecognized parse "${p}".`;
}
exports.unrecognizedParse = unrecognizedParse;
function differentParse(field, local, ancestor) {
    return `An ancestor parsed field "${field}" as ${ancestor} but a child wants to parse the field as ${local}.`;
}
exports.differentParse = differentParse;
exports.ADD_SAME_CHILD_TWICE = 'Attempt to add the same child twice.';
// TRANSFORMS
function invalidTransformIgnored(transform) {
    return `Ignoring an invalid transform: ${util_1.stringify(transform)}.`;
}
exports.invalidTransformIgnored = invalidTransformIgnored;
exports.NO_FIELDS_NEEDS_AS = 'If "from.fields" is not specified, "as" has to be a string that specifies the key to be used for the data from the secondary source.';
// ENCODING & FACET
function customFormatTypeNotAllowed(channel) {
    return `Config.customFormatTypes is not true, thus custom format type and format for channel ${channel} are dropped.`;
}
exports.customFormatTypeNotAllowed = customFormatTypeNotAllowed;
function projectionOverridden(opt) {
    const { parentProjection, projection } = opt;
    return `Layer's shared projection ${util_1.stringify(parentProjection)} is overridden by a child projection ${util_1.stringify(projection)}.`;
}
exports.projectionOverridden = projectionOverridden;
exports.REPLACE_ANGLE_WITH_THETA = 'Arc marks uses theta channel rather than angle, replacing angle with theta.';
function primitiveChannelDef(channel, type, value) {
    return `Channel ${channel} is a ${type}. Converted to {value: ${util_1.stringify(value)}}.`;
}
exports.primitiveChannelDef = primitiveChannelDef;
function invalidFieldType(type) {
    return `Invalid field type "${type}".`;
}
exports.invalidFieldType = invalidFieldType;
function invalidFieldTypeForCountAggregate(type, aggregate) {
    return `Invalid field type "${type}" for aggregate: "${aggregate}", using "quantitative" instead.`;
}
exports.invalidFieldTypeForCountAggregate = invalidFieldTypeForCountAggregate;
function invalidAggregate(aggregate) {
    return `Invalid aggregation operator "${aggregate}".`;
}
exports.invalidAggregate = invalidAggregate;
function missingFieldType(channel, newType) {
    return `Missing type for channel "${channel}", using "${newType}" instead.`;
}
exports.missingFieldType = missingFieldType;
function droppingColor(type, opt) {
    const { fill, stroke } = opt;
    return `Dropping color ${type} as the plot also has ${fill && stroke ? 'fill and stroke' : fill ? 'fill' : 'stroke'}.`;
}
exports.droppingColor = droppingColor;
function emptyFieldDef(fieldDef, channel) {
    return `Dropping ${util_1.stringify(fieldDef)} from channel "${channel}" since it does not contain any data field, datum, value, or signal.`;
}
exports.emptyFieldDef = emptyFieldDef;
exports.LINE_WITH_VARYING_SIZE = 'Line marks cannot encode size with a non-groupby field. You may want to use trail marks instead.';
function incompatibleChannel(channel, markOrFacet, when) {
    return `${channel} dropped as it is incompatible with "${markOrFacet}"${when ? ` when ${when}` : ''}.`;
}
exports.incompatibleChannel = incompatibleChannel;
function invalidEncodingChannel(channel) {
    return `${channel}-encoding is dropped as ${channel} is not a valid encoding channel.`;
}
exports.invalidEncodingChannel = invalidEncodingChannel;
function facetChannelShouldBeDiscrete(channel) {
    return `${channel} encoding should be discrete (ordinal / nominal / binned).`;
}
exports.facetChannelShouldBeDiscrete = facetChannelShouldBeDiscrete;
function facetChannelDropped(channels) {
    return `Facet encoding dropped as ${channels.join(' and ')} ${channels.length > 1 ? 'are' : 'is'} also specified.`;
}
exports.facetChannelDropped = facetChannelDropped;
function discreteChannelCannotEncode(channel, type) {
    return `Using discrete channel "${channel}" to encode "${type}" field can be misleading as it does not encode ${type === 'ordinal' ? 'order' : 'magnitude'}.`;
}
exports.discreteChannelCannotEncode = discreteChannelCannotEncode;
// MARK
function rangeMarkAlignmentCannotBeExpression(align) {
    return `The ${align} for range marks cannot be an expression`;
}
exports.rangeMarkAlignmentCannotBeExpression = rangeMarkAlignmentCannotBeExpression;
function lineWithRange(hasX2, hasY2) {
    const channels = hasX2 && hasY2 ? 'x2 and y2' : hasX2 ? 'x2' : 'y2';
    return `Line mark is for continuous lines and thus cannot be used with ${channels}. We will use the rule mark (line segments) instead.`;
}
exports.lineWithRange = lineWithRange;
function orientOverridden(original, actual) {
    return `Specified orient "${original}" overridden with "${actual}".`;
}
exports.orientOverridden = orientOverridden;
// SCALE
exports.CANNOT_UNION_CUSTOM_DOMAIN_WITH_FIELD_DOMAIN = 'Custom domain scale cannot be unioned with default field-based domain.';
function cannotUseScalePropertyWithNonColor(prop) {
    return `Cannot use the scale property "${prop}" with non-color channel.`;
}
exports.cannotUseScalePropertyWithNonColor = cannotUseScalePropertyWithNonColor;
function unaggregateDomainHasNoEffectForRawField(fieldDef) {
    return `Using unaggregated domain with raw field has no effect (${util_1.stringify(fieldDef)}).`;
}
exports.unaggregateDomainHasNoEffectForRawField = unaggregateDomainHasNoEffectForRawField;
function unaggregateDomainWithNonSharedDomainOp(aggregate) {
    return `Unaggregated domain not applicable for "${aggregate}" since it produces values outside the origin domain of the source data.`;
}
exports.unaggregateDomainWithNonSharedDomainOp = unaggregateDomainWithNonSharedDomainOp;
function unaggregatedDomainWithLogScale(fieldDef) {
    return `Unaggregated domain is currently unsupported for log scale (${util_1.stringify(fieldDef)}).`;
}
exports.unaggregatedDomainWithLogScale = unaggregatedDomainWithLogScale;
function cannotApplySizeToNonOrientedMark(mark) {
    return `Cannot apply size to non-oriented mark "${mark}".`;
}
exports.cannotApplySizeToNonOrientedMark = cannotApplySizeToNonOrientedMark;
function scaleTypeNotWorkWithChannel(channel, scaleType, defaultScaleType) {
    return `Channel "${channel}" does not work with "${scaleType}" scale. We are using "${defaultScaleType}" scale instead.`;
}
exports.scaleTypeNotWorkWithChannel = scaleTypeNotWorkWithChannel;
function scaleTypeNotWorkWithFieldDef(scaleType, defaultScaleType) {
    return `FieldDef does not work with "${scaleType}" scale. We are using "${defaultScaleType}" scale instead.`;
}
exports.scaleTypeNotWorkWithFieldDef = scaleTypeNotWorkWithFieldDef;
function scalePropertyNotWorkWithScaleType(scaleType, propName, channel) {
    return `${channel}-scale's "${propName}" is dropped as it does not work with ${scaleType} scale.`;
}
exports.scalePropertyNotWorkWithScaleType = scalePropertyNotWorkWithScaleType;
function scaleTypeNotWorkWithMark(mark, scaleType) {
    return `Scale type "${scaleType}" does not work with mark "${mark}".`;
}
exports.scaleTypeNotWorkWithMark = scaleTypeNotWorkWithMark;
function stepDropped(channel) {
    return `The step for "${channel}" is dropped because the ${channel === 'width' ? 'x' : 'y'} is continuous.`;
}
exports.stepDropped = stepDropped;
function mergeConflictingProperty(property, propertyOf, v1, v2) {
    return `Conflicting ${propertyOf.toString()} property "${property.toString()}" (${util_1.stringify(v1)} and ${util_1.stringify(v2)}). Using ${util_1.stringify(v1)}.`;
}
exports.mergeConflictingProperty = mergeConflictingProperty;
function mergeConflictingDomainProperty(property, propertyOf, v1, v2) {
    return `Conflicting ${propertyOf.toString()} property "${property.toString()}" (${util_1.stringify(v1)} and ${util_1.stringify(v2)}). Using the union of the two domains.`;
}
exports.mergeConflictingDomainProperty = mergeConflictingDomainProperty;
function independentScaleMeansIndependentGuide(channel) {
    return `Setting the scale to be independent for "${channel}" means we also have to set the guide (axis or legend) to be independent.`;
}
exports.independentScaleMeansIndependentGuide = independentScaleMeansIndependentGuide;
function domainSortDropped(sort) {
    return `Dropping sort property ${util_1.stringify(sort)} as unioned domains only support boolean or op "count", "min", and "max".`;
}
exports.domainSortDropped = domainSortDropped;
exports.MORE_THAN_ONE_SORT = 'Domains that should be unioned has conflicting sort properties. Sort will be set to true.';
exports.FACETED_INDEPENDENT_DIFFERENT_SOURCES = 'Detected faceted independent scales that union domain of multiple fields from different data sources. We will use the first field. The result view size may be incorrect.';
exports.FACETED_INDEPENDENT_SAME_FIELDS_DIFFERENT_SOURCES = 'Detected faceted independent scales that union domain of the same fields from different source. We will assume that this is the same field from a different fork of the same data source. However, if this is not the case, the result view size may be incorrect.';
exports.FACETED_INDEPENDENT_SAME_SOURCE = 'Detected faceted independent scales that union domain of multiple fields from the same data source. We will use the first field. The result view size may be incorrect.';
// AXIS
exports.INVALID_CHANNEL_FOR_AXIS = 'Invalid channel for axis.';
// STACK
function cannotStackRangedMark(channel) {
    return `Cannot stack "${channel}" if there is already "${channel}2".`;
}
exports.cannotStackRangedMark = cannotStackRangedMark;
function cannotStackNonLinearScale(scaleType) {
    return `Cannot stack non-linear scale (${scaleType}).`;
}
exports.cannotStackNonLinearScale = cannotStackNonLinearScale;
function stackNonSummativeAggregate(aggregate) {
    return `Stacking is applied even though the aggregate function is non-summative ("${aggregate}").`;
}
exports.stackNonSummativeAggregate = stackNonSummativeAggregate;
// TIMEUNIT
function invalidTimeUnit(unitName, value) {
    return `Invalid ${unitName}: ${util_1.stringify(value)}.`;
}
exports.invalidTimeUnit = invalidTimeUnit;
function droppedDay(d) {
    return `Dropping day from datetime ${util_1.stringify(d)} as day cannot be combined with other units.`;
}
exports.droppedDay = droppedDay;
function errorBarCenterAndExtentAreNotNeeded(center, extent) {
    return `${extent ? 'extent ' : ''}${extent && center ? 'and ' : ''}${center ? 'center ' : ''}${extent && center ? 'are ' : 'is '}not needed when data are aggregated.`;
}
exports.errorBarCenterAndExtentAreNotNeeded = errorBarCenterAndExtentAreNotNeeded;
function errorBarCenterIsUsedWithWrongExtent(center, extent, mark) {
    return `${center} is not usually used with ${extent} for ${mark}.`;
}
exports.errorBarCenterIsUsedWithWrongExtent = errorBarCenterIsUsedWithWrongExtent;
function errorBarContinuousAxisHasCustomizedAggregate(aggregate, compositeMark) {
    return `Continuous axis should not have customized aggregation function ${aggregate}; ${compositeMark} already agregates the axis.`;
}
exports.errorBarContinuousAxisHasCustomizedAggregate = errorBarContinuousAxisHasCustomizedAggregate;
function errorBand1DNotSupport(property) {
    return `1D error band does not support ${property}.`;
}
exports.errorBand1DNotSupport = errorBand1DNotSupport;
// CHANNEL
function channelRequiredForBinned(channel) {
    return `Channel ${channel} is required for "binned" bin.`;
}
exports.channelRequiredForBinned = channelRequiredForBinned;
function channelShouldNotBeUsedForBinned(channel) {
    return `Channel ${channel} should not be used with "binned" bin.`;
}
exports.channelShouldNotBeUsedForBinned = channelShouldNotBeUsedForBinned;
function domainRequiredForThresholdScale(channel) {
    return `Domain for ${channel} is required for threshold scale.`;
}
exports.domainRequiredForThresholdScale = domainRequiredForThresholdScale;
//# sourceMappingURL=message.js.map