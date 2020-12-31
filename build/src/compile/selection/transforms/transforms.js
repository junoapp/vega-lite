"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forEachTransform = void 0;
const clear_1 = __importDefault(require("./clear"));
const inputs_1 = __importDefault(require("./inputs"));
const nearest_1 = __importDefault(require("./nearest"));
const project_1 = __importDefault(require("./project"));
const scales_1 = __importDefault(require("./scales"));
const legends_1 = __importDefault(require("./legends"));
const toggle_1 = __importDefault(require("./toggle"));
const translate_1 = __importDefault(require("./translate"));
const zoom_1 = __importDefault(require("./zoom"));
const compilers = [project_1.default, toggle_1.default, scales_1.default, legends_1.default, translate_1.default, zoom_1.default, inputs_1.default, nearest_1.default, clear_1.default];
function forEachTransform(selCmpt, cb) {
    for (const t of compilers) {
        if (t.has(selCmpt)) {
            cb(t);
        }
    }
}
exports.forEachTransform = forEachTransform;
//# sourceMappingURL=transforms.js.map