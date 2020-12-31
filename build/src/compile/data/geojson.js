"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoJSONNode = void 0;
const vega_util_1 = require("vega-util");
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const type_1 = require("../../type");
const util_1 = require("../../util");
const dataflow_1 = require("./dataflow");
class GeoJSONNode extends dataflow_1.DataFlowNode {
    constructor(parent, fields, geojson, signal) {
        super(parent);
        this.fields = fields;
        this.geojson = geojson;
        this.signal = signal;
    }
    clone() {
        return new GeoJSONNode(null, util_1.duplicate(this.fields), this.geojson, this.signal);
    }
    static parseAll(parent, model) {
        if (model.component.projection && !model.component.projection.isFit) {
            return parent;
        }
        let geoJsonCounter = 0;
        for (const coordinates of [
            [channel_1.LONGITUDE, channel_1.LATITUDE],
            [channel_1.LONGITUDE2, channel_1.LATITUDE2]
        ]) {
            const pair = coordinates.map(channel => {
                const def = channeldef_1.getFieldOrDatumDef(model.encoding[channel]);
                return channeldef_1.isFieldDef(def)
                    ? def.field
                    : channeldef_1.isDatumDef(def)
                        ? { expr: `${def.datum}` }
                        : channeldef_1.isValueDef(def)
                            ? { expr: `${def['value']}` }
                            : undefined;
            });
            if (pair[0] || pair[1]) {
                parent = new GeoJSONNode(parent, pair, null, model.getName(`geojson_${geoJsonCounter++}`));
            }
        }
        if (model.channelHasField(channel_1.SHAPE)) {
            const fieldDef = model.typedFieldDef(channel_1.SHAPE);
            if (fieldDef.type === type_1.GEOJSON) {
                parent = new GeoJSONNode(parent, null, fieldDef.field, model.getName(`geojson_${geoJsonCounter++}`));
            }
        }
        return parent;
    }
    dependentFields() {
        var _a;
        const fields = ((_a = this.fields) !== null && _a !== void 0 ? _a : []).filter(vega_util_1.isString);
        return new Set([...(this.geojson ? [this.geojson] : []), ...fields]);
    }
    producedFields() {
        return new Set();
    }
    hash() {
        return `GeoJSON ${this.geojson} ${this.signal} ${util_1.hash(this.fields)}`;
    }
    assemble() {
        return [
            ...(this.geojson
                ? [
                    {
                        type: 'filter',
                        expr: `isValid(datum["${this.geojson}"])`
                    }
                ]
                : []),
            Object.assign(Object.assign(Object.assign({ type: 'geojson' }, (this.fields ? { fields: this.fields } : {})), (this.geojson ? { geojson: this.geojson } : {})), { signal: this.signal })
        ];
    }
}
exports.GeoJSONNode = GeoJSONNode;
//# sourceMappingURL=geojson.js.map