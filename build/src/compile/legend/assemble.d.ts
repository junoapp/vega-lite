import { Legend as VgLegend, LegendEncode } from 'vega';
import { Config } from '../../config';
import { Model } from '../model';
import { LegendComponent } from './component';
export declare function assembleLegends(model: Model): VgLegend[];
export declare function assembleLegend(legendCmpt: LegendComponent, config: Config): {
    size?: string;
    shape?: string;
    fill?: string;
    stroke?: string;
    strokeDash?: string;
    strokeWidth?: string;
    opacity?: string;
    type?: import("vega").LegendType;
    direction?: import("vega").Orientation;
    format?: string | import("vega").SignalRef | import("vega").TimeFormatSpecifier;
    formatType?: "number" | "time" | import("vega").SignalRef | "utc";
    title?: string | string[] | import("vega").SignalRef;
    tickMinStep?: number | import("vega").SignalRef;
    values?: any[] | import("vega").SignalRef;
    encode?: LegendEncode;
    orient?: "left" | "right" | "none" | "bottom" | "top" | import("vega").SignalRef | "top-left" | "top-right" | "bottom-left" | "bottom-right";
    symbolLimit?: import("vega").NumberValue;
    tickCount?: import("vega").TickCount;
    aria?: boolean;
    description?: string;
    cornerRadius?: import("vega").NumberValue;
    fillColor?: import("vega").ColorValue;
    offset?: import("vega").NumberValue;
    padding?: import("vega").NumberValue;
    strokeColor?: import("vega").ColorValue;
    legendX?: import("vega").NumberValue;
    legendY?: import("vega").NumberValue;
    titleAlign?: import("vega").AlignValue;
    titleAnchor?: import("vega").AnchorValue;
    titleBaseline?: import("vega").TextBaselineValue;
    titleColor?: import("vega").ColorValue;
    titleFont?: import("vega").FontStyleValue;
    titleFontSize?: import("vega").NumberValue;
    titleFontStyle?: import("vega").FontStyleValue;
    titleFontWeight?: import("vega").FontWeightValue;
    titleLimit?: import("vega").NumberValue;
    titleLineHeight?: import("vega").NumberValue;
    titleOpacity?: import("vega").NumberValue;
    titleOrient?: import("vega").OrientValue;
    titlePadding?: import("vega").NumberValue;
    gradientLength?: number | import("vega").SignalRef;
    gradientOpacity?: import("vega").NumberValue;
    gradientThickness?: number | import("vega").SignalRef;
    gradientStrokeColor?: import("vega").ColorValue;
    gradientStrokeWidth?: import("vega").NumberValue;
    clipHeight?: number | import("vega").SignalRef;
    columns?: number | import("vega").SignalRef;
    columnPadding?: number | import("vega").SignalRef;
    rowPadding?: number | import("vega").SignalRef;
    gridAlign?: "all" | "none" | import("vega").SignalRef | "each";
    symbolDash?: import("vega").DashArrayValue;
    symbolDashOffset?: import("vega").NumberValue;
    symbolFillColor?: import("vega").ColorValue;
    symbolOffset?: import("vega").NumberValue;
    symbolOpacity?: import("vega").NumberValue;
    symbolSize?: import("vega").NumberValue;
    symbolStrokeColor?: import("vega").ColorValue;
    symbolStrokeWidth?: import("vega").NumberValue;
    symbolType?: import("vega").FontStyleValue;
    labelAlign?: import("vega").AlignValue;
    labelBaseline?: import("vega").TextBaselineValue;
    labelColor?: import("vega").ColorValue;
    labelFont?: import("vega").FontStyleValue;
    labelFontSize?: import("vega").NumberValue;
    labelFontStyle?: import("vega").FontStyleValue;
    labelFontWeight?: import("vega").FontWeightValue;
    labelLimit?: import("vega").NumberValue;
    labelOpacity?: import("vega").NumberValue;
    labelPadding?: import("vega").NumberValue;
    labelOffset?: import("vega").NumberValue;
    labelOverlap?: boolean | import("vega").SignalRef | "parity" | "greedy";
    labelSeparation?: number | import("vega").SignalRef;
    zindex?: number;
};
//# sourceMappingURL=assemble.d.ts.map