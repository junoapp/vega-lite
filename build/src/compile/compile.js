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
exports.compile = void 0;
const vega_util_1 = require("vega-util");
const channel_1 = require("../channel");
const vlFieldDef = __importStar(require("../channeldef"));
const config_1 = require("../config");
const log = __importStar(require("../log"));
const normalize_1 = require("../normalize");
const parameter_1 = require("../parameter");
const toplevel_1 = require("../spec/toplevel");
const util_1 = require("../util");
const buildmodel_1 = require("./buildmodel");
const assemble_1 = require("./data/assemble");
const optimize_1 = require("./data/optimize");
/**
 * Vega-Lite's main function, for compiling Vega-Lite spec into Vega spec.
 *
 * At a high-level, we make the following transformations in different phases:
 *
 * Input spec
 *     |
 *     |  (Normalization)
 *     v
 * Normalized Spec (Row/Column channels in single-view specs becomes faceted specs, composite marks becomes layered specs.)
 *     |
 *     |  (Build Model)
 *     v
 * A model tree of the spec
 *     |
 *     |  (Parse)
 *     v
 * A model tree with parsed components (intermediate structure of visualization primitives in a format that can be easily merged)
 *     |
 *     | (Optimize)
 *     v
 * A model tree with parsed components with the data component optimized
 *     |
 *     | (Assemble)
 *     v
 * Vega spec
 *
 * @param inputSpec The Vega-Lite specification.
 * @param opt       Optional arguments passed to the Vega-Lite compiler.
 * @returns         An object containing the compiled Vega spec and normalized Vega-Lite spec.
 */
function compile(inputSpec, opt = {}) {
    // 0. Augment opt with default opts
    if (opt.logger) {
        // set the singleton logger to the provided logger
        log.set(opt.logger);
    }
    if (opt.fieldTitle) {
        // set the singleton field title formatter
        vlFieldDef.setTitleFormatter(opt.fieldTitle);
    }
    try {
        // 1. Initialize config by deep merging default config with the config provided via option and the input spec.
        const config = config_1.initConfig(vega_util_1.mergeConfig(opt.config, inputSpec.config));
        // 2. Normalize: Convert input spec -> normalized spec
        // - Decompose all extended unit specs into composition of unit spec. For example, a box plot get expanded into multiple layers of bars, ticks, and rules. The shorthand row/column channel is also expanded to a facet spec.
        // - Normalize autosize and width or height spec
        const spec = normalize_1.normalize(inputSpec, config);
        // 3. Build Model: normalized spec -> Model (a tree structure)
        // This phases instantiates the models with default config by doing a top-down traversal. This allows us to pass properties that child models derive from their parents via their constructors.
        // See the abstract `Model` class and its children (UnitModel, LayerModel, FacetModel, ConcatModel) for different types of models.
        const model = buildmodel_1.buildModel(spec, null, '', undefined, config);
        // 4 Parse: Model --> Model with components
        // Note that components = intermediate representations that are equivalent to Vega specs.
        // We need these intermediate representation because we need to merge many visualization "components" like projections, scales, axes, and legends.
        // We will later convert these components into actual Vega specs in the assemble phase.
        // In this phase, we do a bottom-up traversal over the whole tree to
        // parse for each type of components once (e.g., data, layout, mark, scale).
        // By doing bottom-up traversal, we start parsing components of unit specs and
        // then merge child components of parent composite specs.
        //
        // Please see inside model.parse() for order of different components parsed.
        model.parse();
        // drawDataflow(model.component.data.sources);
        // 5. Optimize the dataflow. This will modify the data component of the model.
        optimize_1.optimizeDataflow(model.component.data, model);
        // drawDataflow(model.component.data.sources);
        // 6. Assemble: convert model components --> Vega Spec.
        const vgSpec = assembleTopLevelModel(model, getTopLevelProperties(inputSpec, spec.autosize, config, model), inputSpec.datasets, inputSpec.usermeta);
        return {
            spec: vgSpec,
            normalized: spec
        };
    }
    finally {
        // Reset the singleton logger if a logger is provided
        if (opt.logger) {
            log.reset();
        }
        // Reset the singleton field title formatter if provided
        if (opt.fieldTitle) {
            vlFieldDef.resetTitleFormatter();
        }
    }
}
exports.compile = compile;
function getTopLevelProperties(inputSpec, autosize, config, model) {
    const width = model.component.layoutSize.get('width');
    const height = model.component.layoutSize.get('height');
    if (autosize === undefined) {
        autosize = { type: 'pad' };
        if (model.hasAxisOrientSignalRef()) {
            autosize.resize = true;
        }
    }
    else if (vega_util_1.isString(autosize)) {
        autosize = { type: autosize };
    }
    if (width && height && toplevel_1.isFitType(autosize.type)) {
        if (width === 'step' && height === 'step') {
            log.warn(log.message.droppingFit());
            autosize.type = 'pad';
        }
        else if (width === 'step' || height === 'step') {
            // effectively XOR, because else if
            // get step dimension
            const sizeType = width === 'step' ? 'width' : 'height';
            // log that we're dropping fit for respective channel
            log.warn(log.message.droppingFit(channel_1.getPositionScaleChannel(sizeType)));
            // setting type to inverse fit (so if we dropped fit-x, type is now fit-y)
            const inverseSizeType = sizeType === 'width' ? 'height' : 'width';
            autosize.type = toplevel_1.getFitType(inverseSizeType);
        }
    }
    return Object.assign(Object.assign(Object.assign({}, (util_1.keys(autosize).length === 1 && autosize.type
        ? autosize.type === 'pad'
            ? {}
            : { autosize: autosize.type }
        : { autosize })), toplevel_1.extractTopLevelProperties(config, false)), toplevel_1.extractTopLevelProperties(inputSpec, true));
}
/*
 * Assemble the top-level model to a Vega spec.
 *
 * Note: this couldn't be `model.assemble()` since the top-level model
 * needs some special treatment to generate top-level properties.
 */
function assembleTopLevelModel(model, topLevelProperties, datasets = {}, usermeta) {
    // Config with Vega-Lite only config removed.
    const vgConfig = model.config ? config_1.stripAndRedirectConfig(model.config) : undefined;
    const data = [].concat(model.assembleSelectionData([]), 
    // only assemble data in the root
    assemble_1.assembleRootData(model.component.data, datasets));
    const projections = model.assembleProjections();
    const title = model.assembleTitle();
    const style = model.assembleGroupStyle();
    const encodeEntry = model.assembleGroupEncodeEntry(true);
    let layoutSignals = model.assembleLayoutSignals();
    // move width and height signals with values to top level
    layoutSignals = layoutSignals.filter(signal => {
        if ((signal.name === 'width' || signal.name === 'height') && signal.value !== undefined) {
            topLevelProperties[signal.name] = +signal.value;
            return false;
        }
        return true;
    });
    const { params } = topLevelProperties, otherTopLevelProps = __rest(topLevelProperties, ["params"]);
    return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ $schema: 'https://vega.github.io/schema/vega/v5.json' }, (model.description ? { description: model.description } : {})), otherTopLevelProps), (title ? { title } : {})), (style ? { style } : {})), (encodeEntry ? { encode: { update: encodeEntry } } : {})), { data }), (projections.length > 0 ? { projections: projections } : {})), model.assembleGroup([
        ...layoutSignals,
        ...model.assembleSelectionTopLevelSignals([]),
        ...parameter_1.assembleParameterSignals(params)
    ])), (vgConfig ? { config: vgConfig } : {})), (usermeta ? { usermeta } : {}));
}
//# sourceMappingURL=compile.js.map