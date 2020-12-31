"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requiresSelectionId = exports.unitName = exports.forEachSelection = exports.VL_SELECTION_RESOLVE = exports.SELECTION_DOMAIN = exports.MODIFY = exports.TUPLE = exports.STORE = void 0;
const vega_util_1 = require("vega-util");
const channel_1 = require("../../channel");
const selection_1 = require("../../selection");
const util_1 = require("../../util");
const model_1 = require("../model");
const interval_1 = __importDefault(require("./interval"));
const multi_1 = __importDefault(require("./multi"));
const single_1 = __importDefault(require("./single"));
exports.STORE = '_store';
exports.TUPLE = '_tuple';
exports.MODIFY = '_modify';
exports.SELECTION_DOMAIN = '_selection_domain_';
exports.VL_SELECTION_RESOLVE = 'vlSelectionResolve';
const compilers = { single: single_1.default, multi: multi_1.default, interval: interval_1.default };
function forEachSelection(model, cb) {
    const selections = model.component.selection;
    if (selections) {
        for (const sel of util_1.vals(selections)) {
            const success = cb(sel, compilers[sel.type]);
            if (success === true)
                break;
        }
    }
}
exports.forEachSelection = forEachSelection;
function getFacetModel(model) {
    let parent = model.parent;
    while (parent) {
        if (model_1.isFacetModel(parent)) {
            break;
        }
        parent = parent.parent;
    }
    return parent;
}
function unitName(model, { escape } = { escape: true }) {
    let name = escape ? vega_util_1.stringValue(model.name) : model.name;
    const facetModel = getFacetModel(model);
    if (facetModel) {
        const { facet } = facetModel;
        for (const channel of channel_1.FACET_CHANNELS) {
            if (facet[channel]) {
                name += ` + '__facet_${channel}_' + (facet[${vega_util_1.stringValue(facetModel.vgField(channel))}])`;
            }
        }
    }
    return name;
}
exports.unitName = unitName;
function requiresSelectionId(model) {
    let identifier = false;
    forEachSelection(model, selCmpt => {
        identifier = identifier || selCmpt.project.items.some(proj => proj.field === selection_1.SELECTION_ID);
    });
    return identifier;
}
exports.requiresSelectionId = requiresSelectionId;
//# sourceMappingURL=index.js.map