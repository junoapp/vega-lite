"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoPointNode = void 0;
const vega_util_1 = require("vega-util");
const channel_1 = require("../../channel");
const channeldef_1 = require("../../channeldef");
const util_1 = require("../../util");
const dataflow_1 = require("./dataflow");
class GeoPointNode extends dataflow_1.DataFlowNode {
    constructor(parent, projection, fields, as) {
        super(parent);
        this.projection = projection;
        this.fields = fields;
        this.as = as;
    }
    clone() {
        return new GeoPointNode(null, this.projection, util_1.duplicate(this.fields), util_1.duplicate(this.as));
    }
    static parseAll(parent, model) {
        if (!model.projectionName()) {
            return parent;
        }
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
            const suffix = coordinates[0] === channel_1.LONGITUDE2 ? '2' : '';
            if (pair[0] || pair[1]) {
                parent = new GeoPointNode(parent, model.projectionName(), pair, [
                    model.getName(`x${suffix}`),
                    model.getName(`y${suffix}`)
                ]);
            }
        }
        return parent;
    }
    dependentFields() {
        return new Set(this.fields.filter(vega_util_1.isString));
    }
    producedFields() {
        return new Set(this.as);
    }
    hash() {
        return `Geopoint ${this.projection} ${util_1.hash(this.fields)} ${util_1.hash(this.as)}`;
    }
    assemble() {
        return {
            type: 'geopoint',
            projection: this.projection,
            fields: this.fields,
            as: this.as
        };
    }
}
exports.GeoPointNode = GeoPointNode;
//# sourceMappingURL=geopoint.js.map