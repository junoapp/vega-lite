"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUnitSpec = exports.isRepeatSpec = exports.isLayerSpec = exports.isFacetSpec = exports.isVConcatSpec = exports.isHConcatSpec = exports.isAnyConcatSpec = void 0;
var concat_1 = require("./concat");
Object.defineProperty(exports, "isAnyConcatSpec", { enumerable: true, get: function () { return concat_1.isAnyConcatSpec; } });
Object.defineProperty(exports, "isHConcatSpec", { enumerable: true, get: function () { return concat_1.isHConcatSpec; } });
Object.defineProperty(exports, "isVConcatSpec", { enumerable: true, get: function () { return concat_1.isVConcatSpec; } });
var facet_1 = require("./facet");
Object.defineProperty(exports, "isFacetSpec", { enumerable: true, get: function () { return facet_1.isFacetSpec; } });
var layer_1 = require("./layer");
Object.defineProperty(exports, "isLayerSpec", { enumerable: true, get: function () { return layer_1.isLayerSpec; } });
var repeat_1 = require("./repeat");
Object.defineProperty(exports, "isRepeatSpec", { enumerable: true, get: function () { return repeat_1.isRepeatSpec; } });
var unit_1 = require("./unit");
Object.defineProperty(exports, "isUnitSpec", { enumerable: true, get: function () { return unit_1.isUnitSpec; } });
//# sourceMappingURL=index.js.map