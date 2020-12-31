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
exports.assembleAxes = exports.assembleAxisSignals = exports.assembleAxis = void 0;
const vega_util_1 = require("vega-util");
const axis_1 = require("../../axis");
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const title_1 = require("../../title");
const util_1 = require("../../util");
const vega_schema_1 = require("../../vega.schema");
const common_1 = require("../common");
const predicate_1 = require("../predicate");
function assembleTitle(title, config) {
    if (!title) {
        return undefined;
    }
    if (vega_util_1.isArray(title) && !title_1.isText(title)) {
        return title.map(fieldDef => channeldef_1.defaultTitle(fieldDef, config)).join(', ');
    }
    return title;
}
function setAxisEncode(axis, part, vgProp, vgRef) {
    var _a, _b, _c;
    axis.encode = (_a = axis.encode) !== null && _a !== void 0 ? _a : {};
    axis.encode[part] = (_b = axis.encode[part]) !== null && _b !== void 0 ? _b : {};
    axis.encode[part].update = (_c = axis.encode[part].update) !== null && _c !== void 0 ? _c : {};
    // TODO: remove as any after https://github.com/prisma/nexus-prisma/issues/291
    axis.encode[part].update[vgProp] = vgRef;
}
function assembleAxis(axisCmpt, kind, config, opt = { header: false }) {
    var _a, _b;
    const _c = axisCmpt.combine(), { disable, orient, scale, labelExpr, title, zindex } = _c, axis = __rest(_c, ["disable", "orient", "scale", "labelExpr", "title", "zindex"]);
    if (disable) {
        return undefined;
    }
    for (const prop in axis) {
        const propType = axis_1.AXIS_PROPERTY_TYPE[prop];
        const propValue = axis[prop];
        if (propType && propType !== kind && propType !== 'both') {
            // Remove properties that are not valid for this kind of axis
            delete axis[prop];
        }
        else if (axis_1.isConditionalAxisValue(propValue)) {
            // deal with conditional axis value
            const { condition } = propValue, valueOrSignalRef = __rest(propValue, ["condition"]);
            const conditions = vega_util_1.array(condition);
            const propIndex = axis_1.CONDITIONAL_AXIS_PROP_INDEX[prop];
            if (propIndex) {
                const { vgProp, part } = propIndex;
                // If there is a corresponding Vega property for the channel,
                // use Vega's custom axis encoding and delete the original axis property to avoid conflicts
                const vgRef = [
                    ...conditions.map(c => {
                        const { test } = c, valueOrSignalCRef = __rest(c, ["test"]);
                        return Object.assign({ test: predicate_1.expression(null, test) }, valueOrSignalCRef);
                    }),
                    valueOrSignalRef
                ];
                setAxisEncode(axis, part, vgProp, vgRef);
                delete axis[prop];
            }
            else if (propIndex === null) {
                // If propIndex is null, this means we support conditional axis property by converting the condition to signal instead.
                const signalRef = {
                    signal: conditions
                        .map(c => {
                        const { test } = c, valueOrSignalCRef = __rest(c, ["test"]);
                        return `${predicate_1.expression(null, test)} ? ${common_1.exprFromValueOrSignalRef(valueOrSignalCRef)} : `;
                    })
                        .join('') + common_1.exprFromValueOrSignalRef(valueOrSignalRef)
                };
                axis[prop] = signalRef;
            }
        }
        else if (vega_schema_1.isSignalRef(propValue)) {
            const propIndex = axis_1.CONDITIONAL_AXIS_PROP_INDEX[prop];
            if (propIndex) {
                const { vgProp, part } = propIndex;
                setAxisEncode(axis, part, vgProp, propValue);
                delete axis[prop];
            } // else do nothing since the property already supports signal
        }
    }
    if (kind === 'grid') {
        if (!axis.grid) {
            return undefined;
        }
        // Remove unnecessary encode block
        if (axis.encode) {
            // Only need to keep encode block for grid
            const { grid } = axis.encode;
            axis.encode = Object.assign({}, (grid ? { grid } : {}));
            if (util_1.isEmpty(axis.encode)) {
                delete axis.encode;
            }
        }
        return Object.assign(Object.assign({ scale,
            orient }, axis), { domain: false, labels: false, aria: false, 
            // Always set min/maxExtent to 0 to ensure that `config.axis*.minExtent` and `config.axis*.maxExtent`
            // would not affect gridAxis
            maxExtent: 0, minExtent: 0, ticks: false, zindex: util_1.getFirstDefined(zindex, 0) // put grid behind marks by default
         });
    }
    else {
        // kind === 'main'
        if (!opt.header && axisCmpt.mainExtracted) {
            // if mainExtracted has been extracted to a separate facet
            return undefined;
        }
        if (labelExpr !== undefined) {
            let expr = labelExpr;
            if (((_b = (_a = axis.encode) === null || _a === void 0 ? void 0 : _a.labels) === null || _b === void 0 ? void 0 : _b.update) && vega_schema_1.isSignalRef(axis.encode.labels.update.text)) {
                expr = util_1.replaceAll(labelExpr, 'datum.label', axis.encode.labels.update.text.signal);
            }
            setAxisEncode(axis, 'labels', 'text', { signal: expr });
        }
        if (axis.labelAlign === null) {
            delete axis.labelAlign;
        }
        // Remove unnecessary encode block
        if (axis.encode) {
            for (const part of axis_1.AXIS_PARTS) {
                if (!axisCmpt.hasAxisPart(part)) {
                    delete axis.encode[part];
                }
            }
            if (util_1.isEmpty(axis.encode)) {
                delete axis.encode;
            }
        }
        const titleString = assembleTitle(title, config);
        return Object.assign(Object.assign(Object.assign(Object.assign({ scale,
            orient, grid: false }, (titleString ? { title: titleString } : {})), axis), (config.aria === false ? { aria: false } : {})), { zindex: util_1.getFirstDefined(zindex, 0) // put axis line above marks by default
         });
    }
}
exports.assembleAxis = assembleAxis;
/**
 * Add axis signals so grid line works correctly
 * (Fix https://github.com/vega/vega-lite/issues/4226)
 */
function assembleAxisSignals(model) {
    const { axes } = model.component;
    const signals = [];
    for (const channel of channel_1.POSITION_SCALE_CHANNELS) {
        if (axes[channel]) {
            for (const axis of axes[channel]) {
                if (!axis.get('disable') && !axis.get('gridScale')) {
                    // If there is x-axis but no y-scale for gridScale, need to set height/width so x-axis can draw the grid with the right height. Same for y-axis and width.
                    const sizeType = channel === 'x' ? 'height' : 'width';
                    const update = model.getSizeSignalRef(sizeType).signal;
                    if (sizeType !== update) {
                        signals.push({
                            name: sizeType,
                            update: update
                        });
                    }
                }
            }
        }
    }
    return signals;
}
exports.assembleAxisSignals = assembleAxisSignals;
function assembleAxes(axisComponents, config) {
    const { x = [], y = [] } = axisComponents;
    return [
        ...x.map(a => assembleAxis(a, 'grid', config)),
        ...y.map(a => assembleAxis(a, 'grid', config)),
        ...x.map(a => assembleAxis(a, 'main', config)),
        ...y.map(a => assembleAxis(a, 'main', config))
    ].filter(a => a); // filter undefined
}
exports.assembleAxes = assembleAxes;
//# sourceMappingURL=assemble.js.map