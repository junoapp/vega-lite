"use strict";
/*
 * Constants and utilities for encoding channels (Visual variables)
 * such as 'x', 'y', 'color'.
 */
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
exports.getSecondaryRangeChannel = exports.getVgPositionChannel = exports.getMainRangeChannel = exports.isSecondaryRangeChannel = exports.SECONDARY_RANGE_CHANNEL = exports.isChannel = exports.isSingleDefUnitChannel = exports.SINGLE_DEF_UNIT_CHANNELS = exports.SINGLE_DEF_CHANNELS = exports.CHANNELS = exports.FACET_CHANNELS = exports.isColorChannel = exports.GEOPOSITION_CHANNELS = exports.isGeoPositionChannel = exports.getPositionChannelFromLatLong = exports.isPolarPositionChannel = exports.DESCRIPTION = exports.URL = exports.HREF = exports.TOOLTIP = exports.KEY = exports.DETAIL = exports.ORDER = exports.TEXT = exports.STROKEDASH = exports.STROKEWIDTH = exports.STROKEOPACITY = exports.FILLOPACITY = exports.OPACITY = exports.ANGLE = exports.SIZE = exports.SHAPE = exports.STROKE = exports.FILL = exports.COLOR = exports.LONGITUDE2 = exports.LATITUDE2 = exports.LONGITUDE = exports.LATITUDE = exports.THETA2 = exports.THETA = exports.RADIUS2 = exports.RADIUS = exports.Y2 = exports.X2 = exports.Y = exports.X = exports.FACET = exports.COLUMN = exports.ROW = void 0;
exports.rangeType = exports.supportMark = exports.isScaleChannel = exports.SCALE_CHANNELS = exports.supportLegend = exports.isNonPositionScaleChannel = exports.NONPOSITION_SCALE_CHANNELS = exports.getPositionScaleChannel = exports.POLAR_POSITION_SCALE_CHANNELS = exports.POLAR_POSITION_SCALE_CHANNEL_INDEX = exports.isXorY = exports.POSITION_SCALE_CHANNELS = exports.POSITION_SCALE_CHANNEL_INDEX = exports.NONPOSITION_CHANNELS = exports.UNIT_CHANNELS = exports.getOffsetChannel = exports.getSizeChannel = void 0;
const util_1 = require("./util");
// Facet
exports.ROW = 'row';
exports.COLUMN = 'column';
exports.FACET = 'facet';
// Position
exports.X = 'x';
exports.Y = 'y';
exports.X2 = 'x2';
exports.Y2 = 'y2';
// Arc-Position
exports.RADIUS = 'radius';
exports.RADIUS2 = 'radius2';
exports.THETA = 'theta';
exports.THETA2 = 'theta2';
// Geo Position
exports.LATITUDE = 'latitude';
exports.LONGITUDE = 'longitude';
exports.LATITUDE2 = 'latitude2';
exports.LONGITUDE2 = 'longitude2';
// Mark property with scale
exports.COLOR = 'color';
exports.FILL = 'fill';
exports.STROKE = 'stroke';
exports.SHAPE = 'shape';
exports.SIZE = 'size';
exports.ANGLE = 'angle';
exports.OPACITY = 'opacity';
exports.FILLOPACITY = 'fillOpacity';
exports.STROKEOPACITY = 'strokeOpacity';
exports.STROKEWIDTH = 'strokeWidth';
exports.STROKEDASH = 'strokeDash';
// Non-scale channel
exports.TEXT = 'text';
exports.ORDER = 'order';
exports.DETAIL = 'detail';
exports.KEY = 'key';
exports.TOOLTIP = 'tooltip';
exports.HREF = 'href';
exports.URL = 'url';
exports.DESCRIPTION = 'description';
const POSITION_CHANNEL_INDEX = {
    x: 1,
    y: 1,
    x2: 1,
    y2: 1
};
const POLAR_POSITION_CHANNEL_INDEX = {
    theta: 1,
    theta2: 1,
    radius: 1,
    radius2: 1
};
function isPolarPositionChannel(c) {
    return c in POLAR_POSITION_CHANNEL_INDEX;
}
exports.isPolarPositionChannel = isPolarPositionChannel;
const GEO_POSIITON_CHANNEL_INDEX = {
    longitude: 1,
    longitude2: 1,
    latitude: 1,
    latitude2: 1
};
function getPositionChannelFromLatLong(channel) {
    switch (channel) {
        case exports.LATITUDE:
            return 'y';
        case exports.LATITUDE2:
            return 'y2';
        case exports.LONGITUDE:
            return 'x';
        case exports.LONGITUDE2:
            return 'x2';
    }
}
exports.getPositionChannelFromLatLong = getPositionChannelFromLatLong;
function isGeoPositionChannel(c) {
    return c in GEO_POSIITON_CHANNEL_INDEX;
}
exports.isGeoPositionChannel = isGeoPositionChannel;
exports.GEOPOSITION_CHANNELS = util_1.keys(GEO_POSIITON_CHANNEL_INDEX);
const UNIT_CHANNEL_INDEX = Object.assign(Object.assign(Object.assign(Object.assign({}, POSITION_CHANNEL_INDEX), POLAR_POSITION_CHANNEL_INDEX), GEO_POSIITON_CHANNEL_INDEX), { 
    // color
    color: 1, fill: 1, stroke: 1, 
    // other non-position with scale
    opacity: 1, fillOpacity: 1, strokeOpacity: 1, strokeWidth: 1, strokeDash: 1, size: 1, angle: 1, shape: 1, 
    // channels without scales
    order: 1, text: 1, detail: 1, key: 1, tooltip: 1, href: 1, url: 1, description: 1 });
function isColorChannel(channel) {
    return channel === exports.COLOR || channel === exports.FILL || channel === exports.STROKE;
}
exports.isColorChannel = isColorChannel;
const FACET_CHANNEL_INDEX = {
    row: 1,
    column: 1,
    facet: 1
};
exports.FACET_CHANNELS = util_1.keys(FACET_CHANNEL_INDEX);
const CHANNEL_INDEX = Object.assign(Object.assign({}, UNIT_CHANNEL_INDEX), FACET_CHANNEL_INDEX);
exports.CHANNELS = util_1.keys(CHANNEL_INDEX);
const { order: _o, detail: _d, tooltip: _tt1 } = CHANNEL_INDEX, SINGLE_DEF_CHANNEL_INDEX = __rest(CHANNEL_INDEX, ["order", "detail", "tooltip"]);
const { row: _r, column: _c, facet: _f } = SINGLE_DEF_CHANNEL_INDEX, SINGLE_DEF_UNIT_CHANNEL_INDEX = __rest(SINGLE_DEF_CHANNEL_INDEX, ["row", "column", "facet"]);
/**
 * Channels that cannot have an array of channelDef.
 * model.fieldDef, getFieldDef only work for these channels.
 *
 * (The only two channels that can have an array of channelDefs are "detail" and "order".
 * Since there can be multiple fieldDefs for detail and order, getFieldDef/model.fieldDef
 * are not applicable for them. Similarly, selection projection won't work with "detail" and "order".)
 */
exports.SINGLE_DEF_CHANNELS = util_1.keys(SINGLE_DEF_CHANNEL_INDEX);
exports.SINGLE_DEF_UNIT_CHANNELS = util_1.keys(SINGLE_DEF_UNIT_CHANNEL_INDEX);
function isSingleDefUnitChannel(str) {
    return !!SINGLE_DEF_UNIT_CHANNEL_INDEX[str];
}
exports.isSingleDefUnitChannel = isSingleDefUnitChannel;
function isChannel(str) {
    return !!CHANNEL_INDEX[str];
}
exports.isChannel = isChannel;
exports.SECONDARY_RANGE_CHANNEL = [exports.X2, exports.Y2, exports.LATITUDE2, exports.LONGITUDE2, exports.THETA2, exports.RADIUS2];
function isSecondaryRangeChannel(c) {
    const main = getMainRangeChannel(c);
    return main !== c;
}
exports.isSecondaryRangeChannel = isSecondaryRangeChannel;
/**
 * Get the main channel for a range channel. E.g. `x` for `x2`.
 */
function getMainRangeChannel(channel) {
    switch (channel) {
        case exports.X2:
            return exports.X;
        case exports.Y2:
            return exports.Y;
        case exports.LATITUDE2:
            return exports.LATITUDE;
        case exports.LONGITUDE2:
            return exports.LONGITUDE;
        case exports.THETA2:
            return exports.THETA;
        case exports.RADIUS2:
            return exports.RADIUS;
    }
    return channel;
}
exports.getMainRangeChannel = getMainRangeChannel;
function getVgPositionChannel(channel) {
    if (isPolarPositionChannel(channel)) {
        switch (channel) {
            case exports.THETA:
                return 'startAngle';
            case exports.THETA2:
                return 'endAngle';
            case exports.RADIUS:
                return 'outerRadius';
            case exports.RADIUS2:
                return 'innerRadius';
        }
    }
    return channel;
}
exports.getVgPositionChannel = getVgPositionChannel;
/**
 * Get the main channel for a range channel. E.g. `x` for `x2`.
 */
function getSecondaryRangeChannel(channel) {
    switch (channel) {
        case exports.X:
            return exports.X2;
        case exports.Y:
            return exports.Y2;
        case exports.LATITUDE:
            return exports.LATITUDE2;
        case exports.LONGITUDE:
            return exports.LONGITUDE2;
        case exports.THETA:
            return exports.THETA2;
        case exports.RADIUS:
            return exports.RADIUS2;
    }
    return undefined;
}
exports.getSecondaryRangeChannel = getSecondaryRangeChannel;
function getSizeChannel(channel) {
    switch (channel) {
        case exports.X:
        case exports.X2:
            return 'width';
        case exports.Y:
        case exports.Y2:
            return 'height';
    }
    return undefined;
}
exports.getSizeChannel = getSizeChannel;
/**
 * Get the main channel for a range channel. E.g. `x` for `x2`.
 */
function getOffsetChannel(channel) {
    switch (channel) {
        case exports.X:
            return 'xOffset';
        case exports.Y:
            return 'yOffset';
        case exports.X2:
            return 'x2Offset';
        case exports.Y2:
            return 'y2Offset';
        case exports.THETA:
            return 'thetaOffset';
        case exports.RADIUS:
            return 'radiusOffset';
        case exports.THETA2:
            return 'theta2Offset';
        case exports.RADIUS2:
            return 'radius2Offset';
    }
    return undefined;
}
exports.getOffsetChannel = getOffsetChannel;
// CHANNELS without COLUMN, ROW
exports.UNIT_CHANNELS = util_1.keys(UNIT_CHANNEL_INDEX);
// NONPOSITION_CHANNELS = UNIT_CHANNELS without X, Y, X2, Y2;
const { x: _x, y: _y, 
// x2 and y2 share the same scale as x and y
x2: _x2, y2: _y2, latitude: _latitude, longitude: _longitude, latitude2: _latitude2, longitude2: _longitude2, theta: _theta, theta2: _theta2, radius: _radius, radius2: _radius2 } = UNIT_CHANNEL_INDEX, 
// The rest of unit channels then have scale
NONPOSITION_CHANNEL_INDEX = __rest(UNIT_CHANNEL_INDEX, ["x", "y", "x2", "y2", "latitude", "longitude", "latitude2", "longitude2", "theta", "theta2", "radius", "radius2"]);
exports.NONPOSITION_CHANNELS = util_1.keys(NONPOSITION_CHANNEL_INDEX);
exports.POSITION_SCALE_CHANNEL_INDEX = {
    x: 1,
    y: 1
};
exports.POSITION_SCALE_CHANNELS = util_1.keys(exports.POSITION_SCALE_CHANNEL_INDEX);
function isXorY(channel) {
    return channel in exports.POSITION_SCALE_CHANNEL_INDEX;
}
exports.isXorY = isXorY;
exports.POLAR_POSITION_SCALE_CHANNEL_INDEX = {
    theta: 1,
    radius: 1
};
exports.POLAR_POSITION_SCALE_CHANNELS = util_1.keys(exports.POLAR_POSITION_SCALE_CHANNEL_INDEX);
function getPositionScaleChannel(sizeType) {
    return sizeType === 'width' ? exports.X : exports.Y;
}
exports.getPositionScaleChannel = getPositionScaleChannel;
// NON_POSITION_SCALE_CHANNEL = SCALE_CHANNELS without X, Y
const { 
// x2 and y2 share the same scale as x and y
// text and tooltip have format instead of scale,
// href has neither format, nor scale
text: _t, tooltip: _tt, href: _hr, url: _u, description: _al, 
// detail and order have no scale
detail: _dd, key: _k, order: _oo } = NONPOSITION_CHANNEL_INDEX, NONPOSITION_SCALE_CHANNEL_INDEX = __rest(NONPOSITION_CHANNEL_INDEX, ["text", "tooltip", "href", "url", "description", "detail", "key", "order"]);
exports.NONPOSITION_SCALE_CHANNELS = util_1.keys(NONPOSITION_SCALE_CHANNEL_INDEX);
function isNonPositionScaleChannel(channel) {
    return !!NONPOSITION_CHANNEL_INDEX[channel];
}
exports.isNonPositionScaleChannel = isNonPositionScaleChannel;
/**
 * @returns whether Vega supports legends for a particular channel
 */
function supportLegend(channel) {
    switch (channel) {
        case exports.COLOR:
        case exports.FILL:
        case exports.STROKE:
        case exports.SIZE:
        case exports.SHAPE:
        case exports.OPACITY:
        case exports.STROKEWIDTH:
        case exports.STROKEDASH:
            return true;
        case exports.FILLOPACITY:
        case exports.STROKEOPACITY:
        case exports.ANGLE:
            return false;
    }
}
exports.supportLegend = supportLegend;
// Declare SCALE_CHANNEL_INDEX
const SCALE_CHANNEL_INDEX = Object.assign(Object.assign(Object.assign({}, exports.POSITION_SCALE_CHANNEL_INDEX), exports.POLAR_POSITION_SCALE_CHANNEL_INDEX), NONPOSITION_SCALE_CHANNEL_INDEX);
/** List of channels with scales */
exports.SCALE_CHANNELS = util_1.keys(SCALE_CHANNEL_INDEX);
function isScaleChannel(channel) {
    return !!SCALE_CHANNEL_INDEX[channel];
}
exports.isScaleChannel = isScaleChannel;
/**
 * Return whether a channel supports a particular mark type.
 * @param channel  channel name
 * @param mark the mark type
 * @return whether the mark supports the channel
 */
function supportMark(channel, mark) {
    return getSupportedMark(channel)[mark];
}
exports.supportMark = supportMark;
const ALL_MARKS = {
    // all marks
    arc: 'always',
    area: 'always',
    bar: 'always',
    circle: 'always',
    geoshape: 'always',
    image: 'always',
    line: 'always',
    rule: 'always',
    point: 'always',
    rect: 'always',
    square: 'always',
    trail: 'always',
    text: 'always',
    tick: 'always'
};
const { geoshape: _g } = ALL_MARKS, ALL_MARKS_EXCEPT_GEOSHAPE = __rest(ALL_MARKS, ["geoshape"]);
/**
 * Return a dictionary showing whether a channel supports mark type.
 * @param channel
 * @return A dictionary mapping mark types to 'always', 'binned', or undefined
 */
function getSupportedMark(channel) {
    switch (channel) {
        case exports.COLOR:
        case exports.FILL:
        case exports.STROKE:
        // falls through
        case exports.DESCRIPTION:
        case exports.DETAIL:
        case exports.KEY:
        case exports.TOOLTIP:
        case exports.HREF:
        case exports.ORDER: // TODO: revise (order might not support rect, which is not stackable?)
        case exports.OPACITY:
        case exports.FILLOPACITY:
        case exports.STROKEOPACITY:
        case exports.STROKEWIDTH:
        // falls through
        case exports.FACET:
        case exports.ROW: // falls through
        case exports.COLUMN:
            return ALL_MARKS;
        case exports.X:
        case exports.Y:
        case exports.LATITUDE:
        case exports.LONGITUDE:
            // all marks except geoshape. geoshape does not use X, Y -- it uses a projection
            return ALL_MARKS_EXCEPT_GEOSHAPE;
        case exports.X2:
        case exports.Y2:
        case exports.LATITUDE2:
        case exports.LONGITUDE2:
            return {
                area: 'always',
                bar: 'always',
                image: 'always',
                rect: 'always',
                rule: 'always',
                circle: 'binned',
                point: 'binned',
                square: 'binned',
                tick: 'binned',
                line: 'binned',
                trail: 'binned'
            };
        case exports.SIZE:
            return {
                point: 'always',
                tick: 'always',
                rule: 'always',
                circle: 'always',
                square: 'always',
                bar: 'always',
                text: 'always',
                line: 'always',
                trail: 'always'
            };
        case exports.STROKEDASH:
            return {
                line: 'always',
                point: 'always',
                tick: 'always',
                rule: 'always',
                circle: 'always',
                square: 'always',
                bar: 'always',
                geoshape: 'always'
            };
        case exports.SHAPE:
            return { point: 'always', geoshape: 'always' };
        case exports.TEXT:
            return { text: 'always' };
        case exports.ANGLE:
            return { point: 'always', square: 'always', text: 'always' };
        case exports.URL:
            return { image: 'always' };
        case exports.THETA:
            return { text: 'always', arc: 'always' };
        case exports.RADIUS:
            return { text: 'always', arc: 'always' };
        case exports.THETA2:
        case exports.RADIUS2:
            return { arc: 'always' };
    }
}
function rangeType(channel) {
    switch (channel) {
        case exports.X:
        case exports.Y:
        case exports.THETA:
        case exports.RADIUS:
        case exports.SIZE:
        case exports.ANGLE:
        case exports.STROKEWIDTH:
        case exports.OPACITY:
        case exports.FILLOPACITY:
        case exports.STROKEOPACITY:
        // X2 and Y2 use X and Y scales, so they similarly have continuous range. [falls through]
        case exports.X2:
        case exports.Y2:
        case exports.THETA2:
        case exports.RADIUS2:
            return undefined;
        case exports.FACET:
        case exports.ROW:
        case exports.COLUMN:
        case exports.SHAPE:
        case exports.STROKEDASH:
        // TEXT, TOOLTIP, URL, and HREF have no scale but have discrete output [falls through]
        case exports.TEXT:
        case exports.TOOLTIP:
        case exports.HREF:
        case exports.URL:
        case exports.DESCRIPTION:
            return 'discrete';
        // Color can be either continuous or discrete, depending on scale type.
        case exports.COLOR:
        case exports.FILL:
        case exports.STROKE:
            return 'flexible';
        // No scale, no range type.
        case exports.LATITUDE:
        case exports.LONGITUDE:
        case exports.LATITUDE2:
        case exports.LONGITUDE2:
        case exports.DETAIL:
        case exports.KEY:
        case exports.ORDER:
            return undefined;
    }
}
exports.rangeType = rangeType;
//# sourceMappingURL=channel.js.map