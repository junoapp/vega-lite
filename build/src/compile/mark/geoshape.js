"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geoshape = void 0;
const channeldef_1 = require("../../channeldef");
const type_1 = require("../../type");
const encode = __importStar(require("./encode"));
exports.geoshape = {
    vgMark: 'shape',
    encodeEntry: (model) => {
        return Object.assign({}, encode.baseEncodeEntry(model, {
            align: 'ignore',
            baseline: 'ignore',
            color: 'include',
            size: 'ignore',
            orient: 'ignore',
            theta: 'ignore'
        }));
    },
    postEncodingTransform: (model) => {
        const { encoding } = model;
        const shapeDef = encoding.shape;
        const transform = Object.assign({ type: 'geoshape', projection: model.projectionName() }, (shapeDef && channeldef_1.isFieldDef(shapeDef) && shapeDef.type === type_1.GEOJSON
            ? { field: channeldef_1.vgField(shapeDef, { expr: 'datum' }) }
            : {}));
        return [transform];
    }
};
//# sourceMappingURL=geoshape.js.map