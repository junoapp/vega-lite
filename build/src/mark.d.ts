import { Align, Color, Gradient, MarkConfig as VgMarkConfig, Orientation, SignalRef, TextBaseline } from 'vega';
import { CompositeMark, CompositeMarkDef } from './compositemark';
import { ExprRef } from './expr';
import { MapExcludeValueRefAndReplaceSignalWith } from './vega.schema';
/**
 * All types of primitive marks.
 */
export declare const Mark: {
    readonly arc: "arc";
    readonly area: "area";
    readonly bar: "bar";
    readonly image: "image";
    readonly line: "line";
    readonly point: "point";
    readonly rect: "rect";
    readonly rule: "rule";
    readonly text: "text";
    readonly tick: "tick";
    readonly trail: "trail";
    readonly circle: "circle";
    readonly square: "square";
    readonly geoshape: "geoshape";
};
export declare const ARC: "arc";
export declare const AREA: "area";
export declare const BAR: "bar";
export declare const IMAGE: "image";
export declare const LINE: "line";
export declare const POINT: "point";
export declare const RECT: "rect";
export declare const RULE: "rule";
export declare const TEXT: "text";
export declare const TICK: "tick";
export declare const TRAIL: "trail";
export declare const CIRCLE: "circle";
export declare const SQUARE: "square";
export declare const GEOSHAPE: "geoshape";
export declare type Mark = keyof typeof Mark;
export declare function isMark(m: string): m is Mark;
export declare function isPathMark(m: Mark | CompositeMark): m is 'line' | 'area' | 'trail';
export declare function isRectBasedMark(m: Mark | CompositeMark): m is 'rect' | 'bar' | 'image' | 'arc';
export declare const PRIMITIVE_MARKS: ("square" | "area" | "circle" | "image" | "line" | "rect" | "text" | "point" | "arc" | "rule" | "trail" | "geoshape" | "bar" | "tick")[];
export interface ColorMixins<ES extends ExprRef | SignalRef> {
    /**
     * Default color.
     *
     * __Default value:__ <span style="color: #4682b4;">&#9632;</span> `"#4682b4"`
     *
     * __Note:__
     * - This property cannot be used in a [style config](https://vega.github.io/vega-lite/docs/mark.html#style-config).
     * - The `fill` and `stroke` properties have higher precedence than `color` and will override `color`.
     */
    color?: Color | Gradient | ES;
}
export interface TooltipContent {
    content: 'encoding' | 'data';
}
/** @hidden */
export declare type Hide = 'hide';
export interface VLOnlyMarkConfig<ES extends ExprRef | SignalRef> extends ColorMixins<ES> {
    /**
     * Whether the mark's color should be used as fill color instead of stroke color.
     *
     * __Default value:__ `false` for all `point`, `line`, and `rule` marks as well as `geoshape` marks for [`graticule`](https://vega.github.io/vega-lite/docs/data.html#graticule) data sources; otherwise, `true`.
     *
     * __Note:__ This property cannot be used in a [style config](https://vega.github.io/vega-lite/docs/mark.html#style-config).
     *
     */
    filled?: boolean;
    /**
     * Defines how Vega-Lite should handle marks for invalid values (`null` and `NaN`).
     * - If set to `"filter"` (default), all data items with null values will be skipped (for line, trail, and area marks) or filtered (for other marks).
     * - If `null`, all data items are included. In this case, invalid values will be interpreted as zeroes.
     */
    invalid?: 'filter' | Hide | null;
    /**
     * For line and trail marks, this `order` property can be set to `null` or `false` to make the lines use the original order in the data sources.
     */
    order?: null | boolean;
    /**
     * Default relative band position for a time unit. If set to `0`, the marks will be positioned at the beginning of the time unit band step.
     * If set to `0.5`, the marks will be positioned in the middle of the time unit band step.
     */
    timeUnitBandPosition?: number;
    /**
     * Default relative band size for a time unit. If set to `1`, the bandwidth of the marks will be equal to the time unit band step.
     * If set to `0.5`, bandwidth of the marks will be half of the time unit band step.
     */
    timeUnitBand?: number;
    /**
     * The end angle of arc marks in radians. A value of 0 indicates up or “north”, increasing values proceed clockwise.
     */
    theta2?: number | ES;
    /**
     * The secondary (inner) radius in pixels of arc marks.
     *
     * @minimum 0
     * __Default value:__ `0`
     */
    radius2?: number | ES;
}
export interface MarkConfig<ES extends ExprRef | SignalRef> extends VLOnlyMarkConfig<ES>, MapExcludeValueRefAndReplaceSignalWith<Omit<VgMarkConfig, 'tooltip' | 'fill' | 'stroke'>, ES> {
    /**
     * The tooltip text string to show upon mouse hover or an object defining which fields should the tooltip be derived from.
     *
     * - If `tooltip` is `true` or `{"content": "encoding"}`, then all fields from `encoding` will be used.
     * - If `tooltip` is `{"content": "data"}`, then all fields that appear in the highlighted data point will be used.
     * - If set to `null` or `false`, then no tooltip will be used.
     *
     * See the [`tooltip`](https://vega.github.io/vega-lite/docs/tooltip.html) documentation for a detailed discussion about tooltip  in Vega-Lite.
     *
     * __Default value:__ `null`
     */
    tooltip?: number | string | boolean | TooltipContent | ES | null;
    /**
     * Default size for marks.
     * - For `point`/`circle`/`square`, this represents the pixel area of the marks. Note that this value sets the area of the symbol; the side lengths will increase with the square root of this value.
     * - For `bar`, this represents the band size of the bar, in pixels.
     * - For `text`, this represents the font size, in pixels.
     *
     * __Default value:__
     * - `30` for point, circle, square marks; width/height's `step`
     * - `2` for bar marks with discrete dimensions;
     * - `5` for bar marks with continuous dimensions;
     * - `11` for text marks.
     *
     * @minimum 0
     */
    size?: number | ES;
    /**
     * X coordinates of the marks, or width of horizontal `"bar"` and `"area"` without specified `x2` or `width`.
     *
     * The `value` of this channel can be a number or a string `"width"` for the width of the plot.
     */
    x?: number | 'width' | ES;
    /**
     * Y coordinates of the marks, or height of vertical `"bar"` and `"area"` without specified `y2` or `height`.
     *
     * The `value` of this channel can be a number or a string `"height"` for the height of the plot.
     */
    y?: number | 'height' | ES;
    /**
     * X2 coordinates for ranged `"area"`, `"bar"`, `"rect"`, and  `"rule"`.
     *
     * The `value` of this channel can be a number or a string `"width"` for the width of the plot.
     */
    x2?: number | 'width' | ES;
    /**
     * Y2 coordinates for ranged `"area"`, `"bar"`, `"rect"`, and  `"rule"`.
     *
     * The `value` of this channel can be a number or a string `"height"` for the height of the plot.
     */
    y2?: number | 'height' | ES;
    /**
     * Default fill color. This property has higher precedence than `config.color`. Set to `null` to remove fill.
     *
     * __Default value:__ (None)
     *
     */
    fill?: Color | Gradient | null | ES;
    /**
     * Default stroke color. This property has higher precedence than `config.color`. Set to `null` to remove stroke.
     *
     * __Default value:__ (None)
     *
     */
    stroke?: Color | Gradient | null | ES;
    /**
     * The overall opacity (value between [0,1]).
     *
     * __Default value:__ `0.7` for non-aggregate plots with `point`, `tick`, `circle`, or `square` marks or layered `bar` charts and `1` otherwise.
     *
     * @minimum 0
     * @maximum 1
     */
    opacity?: number | ES;
    /**
     * The orientation of a non-stacked bar, tick, area, and line charts.
     * The value is either horizontal (default) or vertical.
     * - For bar, rule and tick, this determines whether the size of the bar and tick
     * should be applied to x or y dimension.
     * - For area, this property determines the orient property of the Vega output.
     * - For line and trail marks, this property determines the sort order of the points in the line
     * if `config.sortLineBy` is not specified.
     * For stacked charts, this is always determined by the orientation of the stack;
     * therefore explicitly specified value will be ignored.
     */
    orient?: Orientation;
    /**
     * The horizontal alignment of the text or ranged marks (area, bar, image, rect, rule). One of `"left"`, `"right"`, `"center"`.
     *
     * __Note:__ Expression reference is *not* supported for range marks.
     */
    align?: Align | ES;
    /**
     * For text marks, the vertical text baseline. One of `"alphabetic"` (default), `"top"`, `"middle"`, `"bottom"`, `"line-top"`, `"line-bottom"`, or an expression reference that provides one of the valid values.
     * The `"line-top"` and `"line-bottom"` values operate similarly to `"top"` and `"bottom"`,
     * but are calculated relative to the `lineHeight` rather than `fontSize` alone.
     *
     * For range marks, the vertical alignment of the marks. One of `"top"`, `"middle"`, `"bottom"`.
     *
     * __Note:__ Expression reference is *not* supported for range marks.
     *
     */
    baseline?: TextBaseline | ES;
    /**
     * - For arc marks, the arc length in radians if theta2 is not specified, otherwise the start arc angle. (A value of 0 indicates up or “north”, increasing values proceed clockwise.)
     *
     * - For text marks, polar coordinate angle in radians.
     *
     * @minimum 0
     * @maximum 360
     */
    theta?: number | ES;
    /**
     *
     * For arc mark, the primary (outer) radius in pixels.
     *
     * For text marks, polar coordinate radial offset, in pixels, of the text from the origin determined by the `x` and `y` properties.
     *
     * @minimum 0
     *
     * __Default value:__ `min(plot_width, plot_height)/2`
     */
    radius?: number | ES;
    /**
     * The inner radius in pixels of arc marks. `innerRadius` is an alias for `radius2`.
     *
     * @minimum 0
     * __Default value:__ `0`
     */
    innerRadius?: number | ES;
    /**
     * The outer radius in pixels of arc marks. `outerRadius` is an alias for `radius`.
     *
     * @minimum 0
     * __Default value:__ `0`
     */
    outerRadius?: number | ES;
}
export interface RectBinSpacingMixins {
    /**
     * Offset between bars for binned field. The ideal value for this is either 0 (preferred by statisticians) or 1 (Vega-Lite default, D3 example style).
     *
     * __Default value:__ `1`
     *
     * @minimum 0
     */
    binSpacing?: number;
}
export declare type AnyMark = CompositeMark | CompositeMarkDef | Mark | MarkDef;
export declare function isMarkDef(mark: string | GenericMarkDef<any>): mark is GenericMarkDef<any>;
export declare function isPrimitiveMark(mark: AnyMark): mark is Mark;
export declare const STROKE_CONFIG: readonly ["stroke", "strokeWidth", "strokeDash", "strokeDashOffset", "strokeOpacity", "strokeJoin", "strokeMiterLimit"];
export declare const FILL_CONFIG: readonly ["fill", "fillOpacity"];
export declare const FILL_STROKE_CONFIG: ("fill" | "stroke" | "strokeWidth" | "fillOpacity" | "strokeOpacity" | "strokeDash" | "strokeDashOffset" | "strokeMiterLimit" | "strokeJoin")[];
export declare const VL_ONLY_MARK_CONFIG_PROPERTIES: ("invalid" | "color" | "filled" | "order" | "timeUnitBandPosition" | "timeUnitBand" | "theta2" | "radius2")[];
export declare const VL_ONLY_MARK_SPECIFIC_CONFIG_PROPERTY_INDEX: {
    [k in Mark]?: (keyof Required<MarkConfigMixins<any>>[k])[];
};
export declare const defaultMarkConfig: MarkConfig<SignalRef>;
export declare type AnyMarkConfig<ES extends ExprRef | SignalRef> = MarkConfig<SignalRef> | AreaConfig<ES> | BarConfig<ES> | RectConfig<ES> | LineConfig<ES> | TickConfig<ES>;
export interface MarkConfigMixins<ES extends ExprRef | SignalRef> {
    /** Mark Config */
    mark?: MarkConfig<ES>;
    /** Arc-specific Config */
    arc?: RectConfig<ES>;
    /** Area-Specific Config */
    area?: AreaConfig<ES>;
    /** Bar-Specific Config */
    bar?: BarConfig<ES>;
    /** Circle-Specific Config */
    circle?: MarkConfig<ES>;
    /** Image-specific Config */
    image?: RectConfig<ES>;
    /** Line-Specific Config */
    line?: LineConfig<ES>;
    /** Point-Specific Config */
    point?: MarkConfig<ES>;
    /** Rect-Specific Config */
    rect?: RectConfig<ES>;
    /** Rule-Specific Config */
    rule?: MarkConfig<ES>;
    /** Square-Specific Config */
    square?: MarkConfig<ES>;
    /** Text-Specific Config */
    text?: MarkConfig<ES>;
    /** Tick-Specific Config */
    tick?: TickConfig<ES>;
    /** Trail-Specific Config */
    trail?: LineConfig<ES>;
    /** Geoshape-Specific Config */
    geoshape?: MarkConfig<ES>;
}
export declare const MARK_CONFIGS: ("square" | "area" | "mark" | "circle" | "image" | "line" | "rect" | "text" | "point" | "arc" | "rule" | "trail" | "geoshape" | "bar" | "tick")[];
export interface RectConfig<ES extends ExprRef | SignalRef> extends RectBinSpacingMixins, MarkConfig<ES> {
    /**
     * The default size of the bars on continuous scales.
     *
     * __Default value:__ `5`
     *
     * @minimum 0
     */
    continuousBandSize?: number;
    /**
     * The default size of the bars with discrete dimensions. If unspecified, the default size is  `step-2`, which provides 2 pixel offset between bars.
     * @minimum 0
     */
    discreteBandSize?: number;
}
export declare const BAR_CORNER_RADIUS_INDEX: Partial<Record<Orientation, ('cornerRadiusTopLeft' | 'cornerRadiusTopRight' | 'cornerRadiusBottomLeft' | 'cornerRadiusBottomRight')[]>>;
export interface BarCornerRadiusMixins<ES extends ExprRef | SignalRef> {
    /**
     * - For vertical bars, top-left and top-right corner radius.
     * - For horizontal bars, top-right and bottom-right corner radius.
     */
    cornerRadiusEnd?: number | ES;
}
export declare type BarConfig<ES extends ExprRef | SignalRef> = RectConfig<ES> & BarCornerRadiusMixins<ES>;
export declare type OverlayMarkDef<ES extends ExprRef | SignalRef> = MarkConfig<ES> & MarkDefMixins<ES>;
export interface PointOverlayMixins<ES extends ExprRef | SignalRef> {
    /**
     * A flag for overlaying points on top of line or area marks, or an object defining the properties of the overlayed points.
     *
     * - If this property is `"transparent"`, transparent points will be used (for enhancing tooltips and selections).
     *
     * - If this property is an empty object (`{}`) or `true`, filled points with default properties will be used.
     *
     * - If this property is `false`, no points would be automatically added to line or area marks.
     *
     * __Default value:__ `false`.
     */
    point?: boolean | OverlayMarkDef<ES> | 'transparent';
}
export interface LineConfig<ES extends ExprRef | SignalRef> extends MarkConfig<ES>, PointOverlayMixins<ES> {
}
export interface LineOverlayMixins<ES extends ExprRef | SignalRef> {
    /**
     * A flag for overlaying line on top of area marks, or an object defining the properties of the overlayed lines.
     *
     * - If this value is an empty object (`{}`) or `true`, lines with default properties will be used.
     *
     * - If this value is `false`, no lines would be automatically added to area marks.
     *
     * __Default value:__ `false`.
     */
    line?: boolean | OverlayMarkDef<ES>;
}
export interface AreaConfig<ES extends ExprRef | SignalRef> extends MarkConfig<ES>, PointOverlayMixins<ES>, LineOverlayMixins<ES> {
}
export interface TickThicknessMixins {
    /**
     * Thickness of the tick mark.
     *
     * __Default value:__  `1`
     *
     * @minimum 0
     */
    thickness?: number | SignalRef;
}
export interface GenericMarkDef<M> {
    /**
     * The mark type. This could a primitive mark type
     * (one of `"bar"`, `"circle"`, `"square"`, `"tick"`, `"line"`,
     * `"area"`, `"point"`, `"geoshape"`, `"rule"`, and `"text"`)
     * or a composite mark type (`"boxplot"`, `"errorband"`, `"errorbar"`).
     */
    type: M;
}
export interface MarkDefMixins<ES extends ExprRef | SignalRef> {
    /**
     * A string or array of strings indicating the name of custom styles to apply to the mark. A style is a named collection of mark property defaults defined within the [style configuration](https://vega.github.io/vega-lite/docs/mark.html#style-config). If style is an array, later styles will override earlier styles. Any [mark properties](https://vega.github.io/vega-lite/docs/encoding.html#mark-prop) explicitly defined within the `encoding` will override a style default.
     *
     * __Default value:__ The mark's name. For example, a bar mark will have style `"bar"` by default.
     * __Note:__ Any specified style will augment the default style. For example, a bar mark with `"style": "foo"` will receive from `config.style.bar` and `config.style.foo` (the specified style `"foo"` has higher precedence).
     */
    style?: string | string[];
    /**
     * Whether a mark be clipped to the enclosing group’s width and height.
     */
    clip?: boolean;
    /**
     * Offset for x-position.
     */
    xOffset?: number | ES;
    /**
     * Offset for y-position.
     */
    yOffset?: number | ES;
    /**
     * Offset for x2-position.
     */
    x2Offset?: number | ES;
    /**
     * Offset for y2-position.
     */
    y2Offset?: number | ES;
    /**
     * Offset for theta.
     */
    thetaOffset?: number | ES;
    /**
     * Offset for theta2.
     */
    theta2Offset?: number | ES;
    /**
     * Offset for radius.
     */
    radiusOffset?: number | ES;
    /**
     * Offset for radius2.
     */
    radius2Offset?: number | ES;
}
export interface MarkDef<M extends string | Mark = Mark, ES extends ExprRef | SignalRef = ExprRef | SignalRef> extends GenericMarkDef<M>, Omit<MarkConfig<ES> & AreaConfig<ES> & BarConfig<ES> & // always extends RectConfig
LineConfig<ES> & TickConfig<ES>, 'startAngle' | 'endAngle'>, MarkDefMixins<ES> {
    /**
     * @hidden
     */
    startAngle?: number | ES;
    /**
     * @hidden
     */
    endAngle?: number | ES;
}
export declare const defaultBarConfig: RectConfig<SignalRef>;
export declare const defaultRectConfig: RectConfig<SignalRef>;
export interface TickConfig<ES extends ExprRef | SignalRef> extends MarkConfig<ES>, TickThicknessMixins {
    /**
     * The width of the ticks.
     *
     * __Default value:__  3/4 of step (width step for horizontal ticks and height step for vertical ticks).
     * @minimum 0
     */
    bandSize?: number;
}
export declare const defaultTickConfig: TickConfig<SignalRef>;
export declare function getMarkType(m: string | GenericMarkDef<any>): any;
//# sourceMappingURL=mark.d.ts.map