"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImputeNode = void 0;
const channeldef_1 = require("../../channeldef");
const encoding_1 = require("../../encoding");
const transform_1 = require("../../transform");
const util_1 = require("../../util");
const dataflow_1 = require("./dataflow");
class ImputeNode extends dataflow_1.DataFlowNode {
    constructor(parent, transform) {
        super(parent);
        this.transform = transform;
    }
    clone() {
        return new ImputeNode(null, util_1.duplicate(this.transform));
    }
    dependentFields() {
        var _a;
        return new Set([this.transform.impute, this.transform.key, ...((_a = this.transform.groupby) !== null && _a !== void 0 ? _a : [])]);
    }
    producedFields() {
        return new Set([this.transform.impute]);
    }
    processSequence(keyvals) {
        const { start = 0, stop, step } = keyvals;
        const result = [start, stop, ...(step ? [step] : [])].join(',');
        return { signal: `sequence(${result})` };
    }
    static makeFromTransform(parent, imputeTransform) {
        return new ImputeNode(parent, imputeTransform);
    }
    static makeFromEncoding(parent, model) {
        const encoding = model.encoding;
        const xDef = encoding.x;
        const yDef = encoding.y;
        if (channeldef_1.isFieldDef(xDef) && channeldef_1.isFieldDef(yDef)) {
            const imputedChannel = xDef.impute ? xDef : yDef.impute ? yDef : undefined;
            if (imputedChannel === undefined) {
                return undefined;
            }
            const keyChannel = xDef.impute ? yDef : yDef.impute ? xDef : undefined;
            const { method, value, frame, keyvals } = imputedChannel.impute;
            const groupbyFields = encoding_1.pathGroupingFields(model.mark, encoding);
            return new ImputeNode(parent, Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ impute: imputedChannel.field, key: keyChannel.field }, (method ? { method } : {})), (value !== undefined ? { value } : {})), (frame ? { frame } : {})), (keyvals !== undefined ? { keyvals } : {})), (groupbyFields.length ? { groupby: groupbyFields } : {})));
        }
        return null;
    }
    hash() {
        return `Impute ${util_1.hash(this.transform)}`;
    }
    assemble() {
        const { impute, key, keyvals, method, groupby, value, frame = [null, null] } = this.transform;
        const imputeTransform = Object.assign(Object.assign(Object.assign(Object.assign({ type: 'impute', field: impute, key }, (keyvals ? { keyvals: transform_1.isImputeSequence(keyvals) ? this.processSequence(keyvals) : keyvals } : {})), { method: 'value' }), (groupby ? { groupby } : {})), { value: !method || method === 'value' ? value : null });
        if (method && method !== 'value') {
            const deriveNewField = Object.assign({ type: 'window', as: [`imputed_${impute}_value`], ops: [method], fields: [impute], frame, ignorePeers: false }, (groupby ? { groupby } : {}));
            const replaceOriginal = {
                type: 'formula',
                expr: `datum.${impute} === null ? datum.imputed_${impute}_value : datum.${impute}`,
                as: impute
            };
            return [imputeTransform, deriveNewField, replaceOriginal];
        }
        else {
            return [imputeTransform];
        }
    }
}
exports.ImputeNode = ImputeNode;
//# sourceMappingURL=impute.js.map