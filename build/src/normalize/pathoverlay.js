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
exports.PathOverlayNormalizer = void 0;
const vega_util_1 = require("vega-util");
const encoding_1 = require("../encoding");
const mark_1 = require("../mark");
const unit_1 = require("../spec/unit");
const stack_1 = require("../stack");
const util_1 = require("../util");
function dropLineAndPoint(markDef) {
    const { point: _point, line: _line } = markDef, mark = __rest(markDef, ["point", "line"]);
    return util_1.keys(mark).length > 1 ? mark : mark.type;
}
function dropLineAndPointFromConfig(config) {
    for (const mark of ['line', 'area', 'rule', 'trail']) {
        if (config[mark]) {
            config = Object.assign(Object.assign({}, config), { 
                // TODO: remove as any
                [mark]: util_1.omit(config[mark], ['point', 'line']) });
        }
    }
    return config;
}
function getPointOverlay(markDef, markConfig = {}, encoding) {
    if (markDef.point === 'transparent') {
        return { opacity: 0 };
    }
    else if (markDef.point) {
        // truthy : true or object
        return vega_util_1.isObject(markDef.point) ? markDef.point : {};
    }
    else if (markDef.point !== undefined) {
        // false or null
        return null;
    }
    else {
        // undefined (not disabled)
        if (markConfig.point || encoding.shape) {
            // enable point overlay if config[mark].point is truthy or if encoding.shape is provided
            return vega_util_1.isObject(markConfig.point) ? markConfig.point : {};
        }
        // markDef.point is defined as falsy
        return undefined;
    }
}
function getLineOverlay(markDef, markConfig = {}) {
    if (markDef.line) {
        // true or object
        return markDef.line === true ? {} : markDef.line;
    }
    else if (markDef.line !== undefined) {
        // false or null
        return null;
    }
    else {
        // undefined (not disabled)
        if (markConfig.line) {
            // enable line overlay if config[mark].line is truthy
            return markConfig.line === true ? {} : markConfig.line;
        }
        // markDef.point is defined as falsy
        return undefined;
    }
}
class PathOverlayNormalizer {
    constructor() {
        this.name = 'path-overlay';
    }
    hasMatchingType(spec, config) {
        if (unit_1.isUnitSpec(spec)) {
            const { mark, encoding } = spec;
            const markDef = mark_1.isMarkDef(mark) ? mark : { type: mark };
            switch (markDef.type) {
                case 'line':
                case 'rule':
                case 'trail':
                    return !!getPointOverlay(markDef, config[markDef.type], encoding);
                case 'area':
                    return (
                    // false / null are also included as we want to remove the properties
                    !!getPointOverlay(markDef, config[markDef.type], encoding) ||
                        !!getLineOverlay(markDef, config[markDef.type]));
            }
        }
        return false;
    }
    run(spec, params, normalize) {
        const { config } = params;
        const { selection, projection, mark, encoding: e } = spec, outerSpec = __rest(spec, ["selection", "projection", "mark", "encoding"]);
        // Need to call normalizeEncoding because we need the inferred types to correctly determine stack
        const encoding = encoding_1.normalizeEncoding(e, config);
        const markDef = mark_1.isMarkDef(mark) ? mark : { type: mark };
        const pointOverlay = getPointOverlay(markDef, config[markDef.type], encoding);
        const lineOverlay = markDef.type === 'area' && getLineOverlay(markDef, config[markDef.type]);
        const layer = [
            Object.assign(Object.assign({}, (selection ? { selection } : {})), { mark: dropLineAndPoint(Object.assign(Object.assign({}, (markDef.type === 'area' && markDef.opacity === undefined && markDef.fillOpacity === undefined
                    ? { opacity: 0.7 }
                    : {})), markDef)), 
                // drop shape from encoding as this might be used to trigger point overlay
                encoding: util_1.omit(encoding, ['shape']) })
        ];
        // FIXME: determine rules for applying selections.
        // Need to copy stack config to overlayed layer
        const stackProps = stack_1.stack(markDef, encoding);
        let overlayEncoding = encoding;
        if (stackProps) {
            const { fieldChannel: stackFieldChannel, offset } = stackProps;
            overlayEncoding = Object.assign(Object.assign({}, encoding), { [stackFieldChannel]: Object.assign(Object.assign({}, encoding[stackFieldChannel]), (offset ? { stack: offset } : {})) });
        }
        if (lineOverlay) {
            layer.push(Object.assign(Object.assign({}, (projection ? { projection } : {})), { mark: Object.assign(Object.assign({ type: 'line' }, util_1.pick(markDef, ['clip', 'interpolate', 'tension', 'tooltip'])), lineOverlay), encoding: overlayEncoding }));
        }
        if (pointOverlay) {
            layer.push(Object.assign(Object.assign({}, (projection ? { projection } : {})), { mark: Object.assign(Object.assign({ type: 'point', opacity: 1, filled: true }, util_1.pick(markDef, ['clip', 'tooltip'])), pointOverlay), encoding: overlayEncoding }));
        }
        return normalize(Object.assign(Object.assign({}, outerSpec), { layer }), Object.assign(Object.assign({}, params), { config: dropLineAndPointFromConfig(config) }));
    }
}
exports.PathOverlayNormalizer = PathOverlayNormalizer;
//# sourceMappingURL=pathoverlay.js.map