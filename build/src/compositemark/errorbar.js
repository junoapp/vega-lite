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
exports.errorBarParams = exports.normalizeErrorBar = exports.errorBarNormalizer = exports.ERRORBAR_PARTS = exports.ERRORBAR = void 0;
const channeldef_1 = require("../channeldef");
const encoding_1 = require("../encoding");
const log = __importStar(require("../log"));
const mark_1 = require("../mark");
const util_1 = require("../util");
const base_1 = require("./base");
const common_1 = require("./common");
exports.ERRORBAR = 'errorbar';
exports.ERRORBAR_PARTS = ['ticks', 'rule'];
exports.errorBarNormalizer = new base_1.CompositeMarkNormalizer(exports.ERRORBAR, normalizeErrorBar);
function normalizeErrorBar(spec, { config }) {
    // Need to initEncoding first so we can infer type
    spec = Object.assign(Object.assign({}, spec), { encoding: encoding_1.normalizeEncoding(spec.encoding, config) });
    const { transform, continuousAxisChannelDef, continuousAxis, encodingWithoutContinuousAxis, ticksOrient, markDef, outerSpec, tooltipEncoding } = errorBarParams(spec, exports.ERRORBAR, config);
    delete encodingWithoutContinuousAxis['size'];
    const makeErrorBarPart = common_1.makeCompositeAggregatePartFactory(markDef, continuousAxis, continuousAxisChannelDef, encodingWithoutContinuousAxis, config.errorbar);
    const thickness = markDef.thickness;
    const size = markDef.size;
    const tick = Object.assign(Object.assign({ type: 'tick', orient: ticksOrient, aria: false }, (thickness !== undefined ? { thickness } : {})), (size !== undefined ? { size } : {}));
    const layer = [
        ...makeErrorBarPart({
            partName: 'ticks',
            mark: tick,
            positionPrefix: 'lower',
            extraEncoding: tooltipEncoding
        }),
        ...makeErrorBarPart({
            partName: 'ticks',
            mark: tick,
            positionPrefix: 'upper',
            extraEncoding: tooltipEncoding
        }),
        ...makeErrorBarPart({
            partName: 'rule',
            mark: Object.assign({ type: 'rule', ariaRoleDescription: 'errorbar' }, (thickness !== undefined ? { size: thickness } : {})),
            positionPrefix: 'lower',
            endPositionPrefix: 'upper',
            extraEncoding: tooltipEncoding
        })
    ];
    return Object.assign(Object.assign(Object.assign({}, outerSpec), { transform }), (layer.length > 1 ? { layer } : Object.assign({}, layer[0])));
}
exports.normalizeErrorBar = normalizeErrorBar;
function errorBarOrientAndInputType(spec, compositeMark) {
    const { encoding } = spec;
    if (errorBarIsInputTypeRaw(encoding)) {
        return {
            orient: common_1.compositeMarkOrient(spec, compositeMark),
            inputType: 'raw'
        };
    }
    const isTypeAggregatedUpperLower = errorBarIsInputTypeAggregatedUpperLower(encoding);
    const isTypeAggregatedError = errorBarIsInputTypeAggregatedError(encoding);
    const x = encoding.x;
    const y = encoding.y;
    if (isTypeAggregatedUpperLower) {
        // type is aggregated-upper-lower
        if (isTypeAggregatedError) {
            throw new Error(`${compositeMark} cannot be both type aggregated-upper-lower and aggregated-error`);
        }
        const x2 = encoding.x2;
        const y2 = encoding.y2;
        if (channeldef_1.isFieldOrDatumDef(x2) && channeldef_1.isFieldOrDatumDef(y2)) {
            // having both x, x2 and y, y2
            throw new Error(`${compositeMark} cannot have both x2 and y2`);
        }
        else if (channeldef_1.isFieldOrDatumDef(x2)) {
            if (channeldef_1.isContinuousFieldOrDatumDef(x)) {
                // having x, x2 quantitative and field y, y2 are not specified
                return { orient: 'horizontal', inputType: 'aggregated-upper-lower' };
            }
            else {
                // having x, x2 that are not both quantitative
                throw new Error(`Both x and x2 have to be quantitative in ${compositeMark}`);
            }
        }
        else if (channeldef_1.isFieldOrDatumDef(y2)) {
            // y2 is a FieldDef
            if (channeldef_1.isContinuousFieldOrDatumDef(y)) {
                // having y, y2 quantitative and field x, x2 are not specified
                return { orient: 'vertical', inputType: 'aggregated-upper-lower' };
            }
            else {
                // having y, y2 that are not both quantitative
                throw new Error(`Both y and y2 have to be quantitative in ${compositeMark}`);
            }
        }
        throw new Error('No ranged axis');
    }
    else {
        // type is aggregated-error
        const xError = encoding.xError;
        const xError2 = encoding.xError2;
        const yError = encoding.yError;
        const yError2 = encoding.yError2;
        if (channeldef_1.isFieldOrDatumDef(xError2) && !channeldef_1.isFieldOrDatumDef(xError)) {
            // having xError2 without xError
            throw new Error(`${compositeMark} cannot have xError2 without xError`);
        }
        if (channeldef_1.isFieldOrDatumDef(yError2) && !channeldef_1.isFieldOrDatumDef(yError)) {
            // having yError2 without yError
            throw new Error(`${compositeMark} cannot have yError2 without yError`);
        }
        if (channeldef_1.isFieldOrDatumDef(xError) && channeldef_1.isFieldOrDatumDef(yError)) {
            // having both xError and yError
            throw new Error(`${compositeMark} cannot have both xError and yError with both are quantiative`);
        }
        else if (channeldef_1.isFieldOrDatumDef(xError)) {
            if (channeldef_1.isContinuousFieldOrDatumDef(x)) {
                // having x and xError that are all quantitative
                return { orient: 'horizontal', inputType: 'aggregated-error' };
            }
            else {
                // having x, xError, and xError2 that are not all quantitative
                throw new Error('All x, xError, and xError2 (if exist) have to be quantitative');
            }
        }
        else if (channeldef_1.isFieldOrDatumDef(yError)) {
            if (channeldef_1.isContinuousFieldOrDatumDef(y)) {
                // having y and yError that are all quantitative
                return { orient: 'vertical', inputType: 'aggregated-error' };
            }
            else {
                // having y, yError, and yError2 that are not all quantitative
                throw new Error('All y, yError, and yError2 (if exist) have to be quantitative');
            }
        }
        throw new Error('No ranged axis');
    }
}
function errorBarIsInputTypeRaw(encoding) {
    return ((channeldef_1.isFieldOrDatumDef(encoding.x) || channeldef_1.isFieldOrDatumDef(encoding.y)) &&
        !channeldef_1.isFieldOrDatumDef(encoding.x2) &&
        !channeldef_1.isFieldOrDatumDef(encoding.y2) &&
        !channeldef_1.isFieldOrDatumDef(encoding.xError) &&
        !channeldef_1.isFieldOrDatumDef(encoding.xError2) &&
        !channeldef_1.isFieldOrDatumDef(encoding.yError) &&
        !channeldef_1.isFieldOrDatumDef(encoding.yError2));
}
function errorBarIsInputTypeAggregatedUpperLower(encoding) {
    return channeldef_1.isFieldOrDatumDef(encoding.x2) || channeldef_1.isFieldOrDatumDef(encoding.y2);
}
function errorBarIsInputTypeAggregatedError(encoding) {
    return (channeldef_1.isFieldOrDatumDef(encoding.xError) ||
        channeldef_1.isFieldOrDatumDef(encoding.xError2) ||
        channeldef_1.isFieldOrDatumDef(encoding.yError) ||
        channeldef_1.isFieldOrDatumDef(encoding.yError2));
}
function errorBarParams(spec, compositeMark, config) {
    var _a;
    // TODO: use selection
    const { mark, encoding, selection, projection: _p } = spec, outerSpec = __rest(spec, ["mark", "encoding", "selection", "projection"]);
    const markDef = mark_1.isMarkDef(mark) ? mark : { type: mark };
    // TODO(https://github.com/vega/vega-lite/issues/3702): add selection support
    if (selection) {
        log.warn(log.message.selectionNotSupported(compositeMark));
    }
    const { orient, inputType } = errorBarOrientAndInputType(spec, compositeMark);
    const { continuousAxisChannelDef, continuousAxisChannelDef2, continuousAxisChannelDefError, continuousAxisChannelDefError2, continuousAxis } = common_1.compositeMarkContinuousAxis(spec, orient, compositeMark);
    const { errorBarSpecificAggregate, postAggregateCalculates, tooltipSummary, tooltipTitleWithFieldName } = errorBarAggregationAndCalculation(markDef, continuousAxisChannelDef, continuousAxisChannelDef2, continuousAxisChannelDefError, continuousAxisChannelDefError2, inputType, compositeMark, config);
    const _b = encoding, _c = continuousAxis, oldContinuousAxisChannelDef = _b[_c], _d = continuousAxis === 'x' ? 'x2' : 'y2', oldContinuousAxisChannelDef2 = _b[_d], _e = continuousAxis === 'x' ? 'xError' : 'yError', oldContinuousAxisChannelDefError = _b[_e], _f = continuousAxis === 'x' ? 'xError2' : 'yError2', oldContinuousAxisChannelDefError2 = _b[_f], oldEncodingWithoutContinuousAxis = __rest(_b, [typeof _c === "symbol" ? _c : _c + "", typeof _d === "symbol" ? _d : _d + "", typeof _e === "symbol" ? _e : _e + "", typeof _f === "symbol" ? _f : _f + ""]);
    const { bins, timeUnits, aggregate: oldAggregate, groupby: oldGroupBy, encoding: encodingWithoutContinuousAxis } = encoding_1.extractTransformsFromEncoding(oldEncodingWithoutContinuousAxis, config);
    const aggregate = [...oldAggregate, ...errorBarSpecificAggregate];
    const groupby = inputType !== 'raw' ? [] : oldGroupBy;
    const tooltipEncoding = common_1.getCompositeMarkTooltip(tooltipSummary, continuousAxisChannelDef, encodingWithoutContinuousAxis, tooltipTitleWithFieldName);
    return {
        transform: [
            ...((_a = outerSpec.transform) !== null && _a !== void 0 ? _a : []),
            ...bins,
            ...timeUnits,
            ...(aggregate.length === 0 ? [] : [{ aggregate, groupby }]),
            ...postAggregateCalculates
        ],
        groupby,
        continuousAxisChannelDef,
        continuousAxis,
        encodingWithoutContinuousAxis,
        ticksOrient: orient === 'vertical' ? 'horizontal' : 'vertical',
        markDef,
        outerSpec,
        tooltipEncoding
    };
}
exports.errorBarParams = errorBarParams;
function errorBarAggregationAndCalculation(markDef, continuousAxisChannelDef, continuousAxisChannelDef2, continuousAxisChannelDefError, continuousAxisChannelDefError2, inputType, compositeMark, config) {
    let errorBarSpecificAggregate = [];
    let postAggregateCalculates = [];
    const continuousFieldName = continuousAxisChannelDef.field;
    let tooltipSummary;
    let tooltipTitleWithFieldName = false;
    if (inputType === 'raw') {
        const center = markDef.center
            ? markDef.center
            : markDef.extent
                ? markDef.extent === 'iqr'
                    ? 'median'
                    : 'mean'
                : config.errorbar.center;
        const extent = markDef.extent ? markDef.extent : center === 'mean' ? 'stderr' : 'iqr';
        if ((center === 'median') !== (extent === 'iqr')) {
            log.warn(log.message.errorBarCenterIsUsedWithWrongExtent(center, extent, compositeMark));
        }
        if (extent === 'stderr' || extent === 'stdev') {
            errorBarSpecificAggregate = [
                { op: extent, field: continuousFieldName, as: `extent_${continuousFieldName}` },
                { op: center, field: continuousFieldName, as: `center_${continuousFieldName}` }
            ];
            postAggregateCalculates = [
                {
                    calculate: `datum["center_${continuousFieldName}"] + datum["extent_${continuousFieldName}"]`,
                    as: `upper_${continuousFieldName}`
                },
                {
                    calculate: `datum["center_${continuousFieldName}"] - datum["extent_${continuousFieldName}"]`,
                    as: `lower_${continuousFieldName}`
                }
            ];
            tooltipSummary = [
                { fieldPrefix: 'center_', titlePrefix: util_1.titleCase(center) },
                { fieldPrefix: 'upper_', titlePrefix: getTitlePrefix(center, extent, '+') },
                { fieldPrefix: 'lower_', titlePrefix: getTitlePrefix(center, extent, '-') }
            ];
            tooltipTitleWithFieldName = true;
        }
        else {
            let centerOp;
            let lowerExtentOp;
            let upperExtentOp;
            if (extent === 'ci') {
                centerOp = 'mean';
                lowerExtentOp = 'ci0';
                upperExtentOp = 'ci1';
            }
            else {
                centerOp = 'median';
                lowerExtentOp = 'q1';
                upperExtentOp = 'q3';
            }
            errorBarSpecificAggregate = [
                { op: lowerExtentOp, field: continuousFieldName, as: `lower_${continuousFieldName}` },
                { op: upperExtentOp, field: continuousFieldName, as: `upper_${continuousFieldName}` },
                { op: centerOp, field: continuousFieldName, as: `center_${continuousFieldName}` }
            ];
            tooltipSummary = [
                {
                    fieldPrefix: 'upper_',
                    titlePrefix: channeldef_1.title({ field: continuousFieldName, aggregate: upperExtentOp, type: 'quantitative' }, config, {
                        allowDisabling: false
                    })
                },
                {
                    fieldPrefix: 'lower_',
                    titlePrefix: channeldef_1.title({ field: continuousFieldName, aggregate: lowerExtentOp, type: 'quantitative' }, config, {
                        allowDisabling: false
                    })
                },
                {
                    fieldPrefix: 'center_',
                    titlePrefix: channeldef_1.title({ field: continuousFieldName, aggregate: centerOp, type: 'quantitative' }, config, {
                        allowDisabling: false
                    })
                }
            ];
        }
    }
    else {
        if (markDef.center || markDef.extent) {
            log.warn(log.message.errorBarCenterAndExtentAreNotNeeded(markDef.center, markDef.extent));
        }
        if (inputType === 'aggregated-upper-lower') {
            tooltipSummary = [];
            postAggregateCalculates = [
                { calculate: `datum["${continuousAxisChannelDef2.field}"]`, as: `upper_${continuousFieldName}` },
                { calculate: `datum["${continuousFieldName}"]`, as: `lower_${continuousFieldName}` }
            ];
        }
        else if (inputType === 'aggregated-error') {
            tooltipSummary = [{ fieldPrefix: '', titlePrefix: continuousFieldName }];
            postAggregateCalculates = [
                {
                    calculate: `datum["${continuousFieldName}"] + datum["${continuousAxisChannelDefError.field}"]`,
                    as: `upper_${continuousFieldName}`
                }
            ];
            if (continuousAxisChannelDefError2) {
                postAggregateCalculates.push({
                    calculate: `datum["${continuousFieldName}"] + datum["${continuousAxisChannelDefError2.field}"]`,
                    as: `lower_${continuousFieldName}`
                });
            }
            else {
                postAggregateCalculates.push({
                    calculate: `datum["${continuousFieldName}"] - datum["${continuousAxisChannelDefError.field}"]`,
                    as: `lower_${continuousFieldName}`
                });
            }
        }
        for (const postAggregateCalculate of postAggregateCalculates) {
            tooltipSummary.push({
                fieldPrefix: postAggregateCalculate.as.substring(0, 6),
                titlePrefix: util_1.replaceAll(util_1.replaceAll(postAggregateCalculate.calculate, 'datum["', ''), '"]', '')
            });
        }
    }
    return { postAggregateCalculates, errorBarSpecificAggregate, tooltipSummary, tooltipTitleWithFieldName };
}
function getTitlePrefix(center, extent, operation) {
    return `${util_1.titleCase(center)} ${operation} ${extent}`;
}
//# sourceMappingURL=errorbar.js.map