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
exports.BinNode = exports.getBinSignalName = void 0;
const vega_util_1 = require("vega-util");
const bin_1 = require("../../bin");
const channeldef_1 = require("../../channeldef");
const util_1 = require("../../util");
const format_1 = require("../format");
const model_1 = require("../model");
const parse_1 = require("../selection/parse");
const dataflow_1 = require("./dataflow");
function rangeFormula(model, fieldDef, channel, config) {
    var _a, _b;
    if (channeldef_1.binRequiresRange(fieldDef, channel)) {
        // read format from axis or legend, if there is no format then use config.numberFormat
        const guide = model_1.isUnitModel(model)
            ? (_b = (_a = model.axis(channel)) !== null && _a !== void 0 ? _a : model.legend(channel)) !== null && _b !== void 0 ? _b : {} : {};
        const startField = channeldef_1.vgField(fieldDef, { expr: 'datum' });
        const endField = channeldef_1.vgField(fieldDef, { expr: 'datum', binSuffix: 'end' });
        return {
            formulaAs: channeldef_1.vgField(fieldDef, { binSuffix: 'range', forAs: true }),
            formula: format_1.binFormatExpression(startField, endField, guide.format, guide.formatType, config)
        };
    }
    return {};
}
function binKey(bin, field) {
    return `${bin_1.binToString(bin)}_${field}`;
}
function getSignalsFromModel(model, key) {
    return {
        signal: model.getName(`${key}_bins`),
        extentSignal: model.getName(`${key}_extent`)
    };
}
function getBinSignalName(model, field, bin) {
    var _a;
    const normalizedBin = (_a = channeldef_1.normalizeBin(bin, undefined)) !== null && _a !== void 0 ? _a : {};
    const key = binKey(normalizedBin, field);
    return model.getName(`${key}_bins`);
}
exports.getBinSignalName = getBinSignalName;
function isBinTransform(t) {
    return 'as' in t;
}
function createBinComponent(t, bin, model) {
    let as;
    let span;
    if (isBinTransform(t)) {
        as = vega_util_1.isString(t.as) ? [t.as, `${t.as}_end`] : [t.as[0], t.as[1]];
    }
    else {
        as = [channeldef_1.vgField(t, { forAs: true }), channeldef_1.vgField(t, { binSuffix: 'end', forAs: true })];
    }
    const normalizedBin = Object.assign({}, channeldef_1.normalizeBin(bin, undefined));
    const key = binKey(normalizedBin, t.field);
    const { signal, extentSignal } = getSignalsFromModel(model, key);
    if (bin_1.isSelectionExtent(normalizedBin.extent)) {
        const ext = normalizedBin.extent;
        const selName = ext.selection;
        span = parse_1.parseSelectionBinExtent(model.getSelectionComponent(util_1.varName(selName), selName), ext);
        delete normalizedBin.extent; // Vega-Lite selection extent map to Vega's span property.
    }
    const binComponent = Object.assign(Object.assign(Object.assign({ bin: normalizedBin, field: t.field, as: [as] }, (signal ? { signal } : {})), (extentSignal ? { extentSignal } : {})), (span ? { span } : {}));
    return { key, binComponent };
}
class BinNode extends dataflow_1.DataFlowNode {
    constructor(parent, bins) {
        super(parent);
        this.bins = bins;
    }
    clone() {
        return new BinNode(null, util_1.duplicate(this.bins));
    }
    static makeFromEncoding(parent, model) {
        const bins = model.reduceFieldDef((binComponentIndex, fieldDef, channel) => {
            if (channeldef_1.isTypedFieldDef(fieldDef) && bin_1.isBinning(fieldDef.bin)) {
                const { key, binComponent } = createBinComponent(fieldDef, fieldDef.bin, model);
                binComponentIndex[key] = Object.assign(Object.assign(Object.assign({}, binComponent), binComponentIndex[key]), rangeFormula(model, fieldDef, channel, model.config));
            }
            return binComponentIndex;
        }, {});
        if (util_1.isEmpty(bins)) {
            return null;
        }
        return new BinNode(parent, bins);
    }
    /**
     * Creates a bin node from BinTransform.
     * The optional parameter should provide
     */
    static makeFromTransform(parent, t, model) {
        const { key, binComponent } = createBinComponent(t, t.bin, model);
        return new BinNode(parent, {
            [key]: binComponent
        });
    }
    /**
     * Merge bin nodes. This method either integrates the bin config from the other node
     * or if this node already has a bin config, renames the corresponding signal in the model.
     */
    merge(other, renameSignal) {
        for (const key of util_1.keys(other.bins)) {
            if (key in this.bins) {
                renameSignal(other.bins[key].signal, this.bins[key].signal);
                // Ensure that we don't have duplicate names for signal pairs
                this.bins[key].as = util_1.unique([...this.bins[key].as, ...other.bins[key].as], util_1.hash);
            }
            else {
                this.bins[key] = other.bins[key];
            }
        }
        for (const child of other.children) {
            other.removeChild(child);
            child.parent = this;
        }
        other.remove();
    }
    producedFields() {
        return new Set(util_1.vals(this.bins)
            .map(c => c.as)
            .flat(2));
    }
    dependentFields() {
        return new Set(util_1.vals(this.bins).map(c => c.field));
    }
    hash() {
        return `Bin ${util_1.hash(this.bins)}`;
    }
    assemble() {
        return util_1.vals(this.bins).flatMap(bin => {
            const transform = [];
            const [binAs, ...remainingAs] = bin.as;
            const _a = bin.bin, { extent } = _a, params = __rest(_a, ["extent"]);
            const binTrans = Object.assign(Object.assign(Object.assign({ type: 'bin', field: util_1.replacePathInField(bin.field), as: binAs, signal: bin.signal }, (!bin_1.isSelectionExtent(extent) ? { extent } : { extent: null })), (bin.span ? { span: { signal: `span(${bin.span})` } } : {})), params);
            if (!extent && bin.extentSignal) {
                transform.push({
                    type: 'extent',
                    field: util_1.replacePathInField(bin.field),
                    signal: bin.extentSignal
                });
                binTrans.extent = { signal: bin.extentSignal };
            }
            transform.push(binTrans);
            for (const as of remainingAs) {
                for (let i = 0; i < 2; i++) {
                    transform.push({
                        type: 'formula',
                        expr: channeldef_1.vgField({ field: binAs[i] }, { expr: 'datum' }),
                        as: as[i]
                    });
                }
            }
            if (bin.formula) {
                transform.push({
                    type: 'formula',
                    expr: bin.formula,
                    as: bin.formulaAs
                });
            }
            return transform;
        });
    }
}
exports.BinNode = BinNode;
//# sourceMappingURL=bin.js.map