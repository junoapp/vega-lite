"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceNode = void 0;
const data_1 = require("../../data");
const util_1 = require("../../util");
const dataflow_1 = require("./dataflow");
class SourceNode extends dataflow_1.DataFlowNode {
    constructor(data) {
        super(null); // source cannot have parent
        data = data !== null && data !== void 0 ? data : { name: 'source' };
        let format;
        if (!data_1.isGenerator(data)) {
            format = data.format ? Object.assign({}, util_1.omit(data.format, ['parse'])) : {};
        }
        if (data_1.isInlineData(data)) {
            this._data = { values: data.values };
        }
        else if (data_1.isUrlData(data)) {
            this._data = { url: data.url };
            if (!format.type) {
                // Extract extension from URL using snippet from
                // http://stackoverflow.com/questions/680929/how-to-extract-extension-from-filename-string-in-javascript
                let defaultExtension = /(?:\.([^.]+))?$/.exec(data.url)[1];
                if (!util_1.contains(['json', 'csv', 'tsv', 'dsv', 'topojson'], defaultExtension)) {
                    defaultExtension = 'json';
                }
                // defaultExtension has type string but we ensure that it is DataFormatType above
                format.type = defaultExtension;
            }
        }
        else if (data_1.isSphereGenerator(data)) {
            // hardwire GeoJSON sphere data into output specification
            this._data = { values: [{ type: 'Sphere' }] };
        }
        else if (data_1.isNamedData(data) || data_1.isGenerator(data)) {
            this._data = {};
        }
        // set flag to check if generator
        this._generator = data_1.isGenerator(data);
        // any dataset can be named
        if (data.name) {
            this._name = data.name;
        }
        if (format && !util_1.isEmpty(format)) {
            this._data.format = format;
        }
    }
    dependentFields() {
        return new Set();
    }
    producedFields() {
        return undefined; // we don't know what this source produces
    }
    get data() {
        return this._data;
    }
    hasName() {
        return !!this._name;
    }
    get isGenerator() {
        return this._generator;
    }
    get dataName() {
        return this._name;
    }
    set dataName(name) {
        this._name = name;
    }
    set parent(parent) {
        throw new Error('Source nodes have to be roots.');
    }
    remove() {
        throw new Error('Source nodes are roots and cannot be removed.');
    }
    hash() {
        throw new Error('Cannot hash sources');
    }
    assemble() {
        return Object.assign(Object.assign({ name: this._name }, this._data), { transform: [] });
    }
}
exports.SourceNode = SourceNode;
//# sourceMappingURL=source.js.map