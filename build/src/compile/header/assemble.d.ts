/**
 * Utility for generating row / column headers
 */
import { SignalRef, TitleAnchor, TitleConfig } from 'vega';
import { FacetChannel } from '../../channel';
import { Config } from '../../config';
import { CoreHeader } from '../../header';
import { FacetFieldDef } from '../../spec/facet';
import { RowCol, VgComparator, VgMarkGroup, VgTitle } from '../../vega.schema';
import { Model } from '../model';
import { HeaderChannel, HeaderComponent, HeaderType, LayoutHeaderComponent, LayoutHeaderComponentIndex } from './component';
export declare function assembleTitleGroup(model: Model, channel: FacetChannel): {
    name: string;
    type: string;
    role: string;
    title: {
        text: string | string[] | SignalRef;
        subtitle?: string | string[] | SignalRef;
        name?: string;
        interactive?: boolean;
        style: string | string[];
        encode?: import("vega").TitleEncode | Partial<Record<import("vega").EncodeEntryName, import("vega").TextEncodeEntry>>;
        anchor?: import("vega").AnchorValue;
        frame?: import("vega").FontStyleValue;
        offset?: import("vega").NumberValue;
        orient?: import("vega").ScaleField;
        aria?: boolean;
        align: string | SignalRef | {
            field: import("vega").Field;
        } | {
            scale: import("vega").Field;
            value: string | number | boolean;
        } | {
            scale: import("vega").Field;
            field: import("vega").Field;
        } | {
            scale: import("vega").Field;
            band: number | boolean;
        } | {
            scale: import("vega").Field;
            range: number | boolean;
        } | {
            value: import("vega").Align;
        };
        angle?: import("vega").NumberValue;
        baseline: string | SignalRef | {
            field: import("vega").Field;
        } | {
            scale: import("vega").Field;
            value: string | number | boolean;
        } | {
            scale: import("vega").Field;
            field: import("vega").Field;
        } | {
            scale: import("vega").Field;
            band: number | boolean;
        } | {
            scale: import("vega").Field;
            range: number | boolean;
        } | {
            value: import("vega").TextBaseline;
        } | {
            signal: string;
        };
        dx?: import("vega").NumberValue;
        dy?: import("vega").NumberValue;
        limit?: import("vega").NumberValue;
        color?: import("vega").ColorValue;
        font?: import("vega").FontStyleValue;
        fontSize?: import("vega").NumberValue;
        fontStyle?: import("vega").FontStyleValue;
        fontWeight?: import("vega").FontWeightValue;
        lineHeight?: import("vega").NumberValue;
        subtitleColor?: import("vega").ColorValue;
        subtitleFont?: import("vega").FontStyleValue;
        subtitleFontSize?: import("vega").NumberValue;
        subtitleFontStyle?: import("vega").FontStyleValue;
        subtitleFontWeight?: import("vega").FontWeightValue;
        subtitleLineHeight?: import("vega").NumberValue;
        subtitlePadding?: import("vega").NumberValue;
        zindex?: number;
    } | {
        text: string | string[] | SignalRef;
        subtitle?: string | string[] | SignalRef;
        name?: string;
        interactive?: boolean;
        style: string | string[];
        encode?: import("vega").TitleEncode | Partial<Record<import("vega").EncodeEntryName, import("vega").TextEncodeEntry>>;
        anchor?: import("vega").AnchorValue;
        frame?: import("vega").FontStyleValue;
        offset?: import("vega").NumberValue;
        orient?: import("vega").ScaleField;
        aria?: boolean;
        align: import("vega").AlignValue;
        angle?: import("vega").NumberValue;
        baseline: string | SignalRef | {
            field: import("vega").Field;
        } | {
            scale: import("vega").Field;
            value: string | number | boolean;
        } | {
            scale: import("vega").Field;
            field: import("vega").Field;
        } | {
            scale: import("vega").Field;
            band: number | boolean;
        } | {
            scale: import("vega").Field;
            range: number | boolean;
        } | {
            value: import("vega").TextBaseline;
        } | {
            signal: string;
        };
        dx?: import("vega").NumberValue;
        dy?: import("vega").NumberValue;
        limit?: import("vega").NumberValue;
        color?: import("vega").ColorValue;
        font?: import("vega").FontStyleValue;
        fontSize?: import("vega").NumberValue;
        fontStyle?: import("vega").FontStyleValue;
        fontWeight?: import("vega").FontWeightValue;
        lineHeight?: import("vega").NumberValue;
        subtitleColor?: import("vega").ColorValue;
        subtitleFont?: import("vega").FontStyleValue;
        subtitleFontSize?: import("vega").NumberValue;
        subtitleFontStyle?: import("vega").FontStyleValue;
        subtitleFontWeight?: import("vega").FontWeightValue;
        subtitleLineHeight?: import("vega").NumberValue;
        subtitlePadding?: import("vega").NumberValue;
        zindex?: number;
    } | {
        text: string | string[] | SignalRef;
        subtitle?: string | string[] | SignalRef;
        name?: string;
        interactive?: boolean;
        style: string | string[];
        encode?: import("vega").TitleEncode | Partial<Record<import("vega").EncodeEntryName, import("vega").TextEncodeEntry>>;
        anchor?: import("vega").AnchorValue;
        frame?: import("vega").FontStyleValue;
        offset?: import("vega").NumberValue;
        orient?: import("vega").ScaleField;
        aria?: boolean;
        align?: import("vega").AlignValue;
        angle?: import("vega").NumberValue;
        baseline: string | SignalRef | {
            field: import("vega").Field;
        } | {
            scale: import("vega").Field;
            value: string | number | boolean;
        } | {
            scale: import("vega").Field;
            field: import("vega").Field;
        } | {
            scale: import("vega").Field;
            band: number | boolean;
        } | {
            scale: import("vega").Field;
            range: number | boolean;
        } | {
            value: import("vega").TextBaseline;
        } | {
            signal: string;
        };
        dx?: import("vega").NumberValue;
        dy?: import("vega").NumberValue;
        limit?: import("vega").NumberValue;
        color?: import("vega").ColorValue;
        font?: import("vega").FontStyleValue;
        fontSize?: import("vega").NumberValue;
        fontStyle?: import("vega").FontStyleValue;
        fontWeight?: import("vega").FontWeightValue;
        lineHeight?: import("vega").NumberValue;
        subtitleColor?: import("vega").ColorValue;
        subtitleFont?: import("vega").FontStyleValue;
        subtitleFontSize?: import("vega").NumberValue;
        subtitleFontStyle?: import("vega").FontStyleValue;
        subtitleFontWeight?: import("vega").FontWeightValue;
        subtitleLineHeight?: import("vega").NumberValue;
        subtitlePadding?: import("vega").NumberValue;
        zindex?: number;
    } | {
        text: string | string[] | SignalRef;
        subtitle?: string | string[] | SignalRef;
        name?: string;
        interactive?: boolean;
        style: string | string[];
        encode?: import("vega").TitleEncode | Partial<Record<import("vega").EncodeEntryName, import("vega").TextEncodeEntry>>;
        anchor?: import("vega").AnchorValue;
        frame?: import("vega").FontStyleValue;
        offset?: import("vega").NumberValue;
        orient?: import("vega").ScaleField;
        aria?: boolean;
        align: string | SignalRef | {
            field: import("vega").Field;
        } | {
            scale: import("vega").Field;
            value: string | number | boolean;
        } | {
            scale: import("vega").Field;
            field: import("vega").Field;
        } | {
            scale: import("vega").Field;
            band: number | boolean;
        } | {
            scale: import("vega").Field;
            range: number | boolean;
        } | {
            value: import("vega").Align;
        };
        angle?: import("vega").NumberValue;
        baseline?: import("vega").TextBaselineValue;
        dx?: import("vega").NumberValue;
        dy?: import("vega").NumberValue;
        limit?: import("vega").NumberValue;
        color?: import("vega").ColorValue;
        font?: import("vega").FontStyleValue;
        fontSize?: import("vega").NumberValue;
        fontStyle?: import("vega").FontStyleValue;
        fontWeight?: import("vega").FontWeightValue;
        lineHeight?: import("vega").NumberValue;
        subtitleColor?: import("vega").ColorValue;
        subtitleFont?: import("vega").FontStyleValue;
        subtitleFontSize?: import("vega").NumberValue;
        subtitleFontStyle?: import("vega").FontStyleValue;
        subtitleFontWeight?: import("vega").FontWeightValue;
        subtitleLineHeight?: import("vega").NumberValue;
        subtitlePadding?: import("vega").NumberValue;
        zindex?: number;
    } | {
        text: string | string[] | SignalRef;
        subtitle?: string | string[] | SignalRef;
        name?: string;
        interactive?: boolean;
        style: string | string[];
        encode?: import("vega").TitleEncode | Partial<Record<import("vega").EncodeEntryName, import("vega").TextEncodeEntry>>;
        anchor?: import("vega").AnchorValue;
        frame?: import("vega").FontStyleValue;
        offset?: import("vega").NumberValue;
        orient?: import("vega").ScaleField;
        aria?: boolean;
        align: import("vega").AlignValue;
        angle?: import("vega").NumberValue;
        baseline?: import("vega").TextBaselineValue;
        dx?: import("vega").NumberValue;
        dy?: import("vega").NumberValue;
        limit?: import("vega").NumberValue;
        color?: import("vega").ColorValue;
        font?: import("vega").FontStyleValue;
        fontSize?: import("vega").NumberValue;
        fontStyle?: import("vega").FontStyleValue;
        fontWeight?: import("vega").FontWeightValue;
        lineHeight?: import("vega").NumberValue;
        subtitleColor?: import("vega").ColorValue;
        subtitleFont?: import("vega").FontStyleValue;
        subtitleFontSize?: import("vega").NumberValue;
        subtitleFontStyle?: import("vega").FontStyleValue;
        subtitleFontWeight?: import("vega").FontWeightValue;
        subtitleLineHeight?: import("vega").NumberValue;
        subtitlePadding?: import("vega").NumberValue;
        zindex?: number;
    } | {
        text: string | string[] | SignalRef;
        subtitle?: string | string[] | SignalRef;
        name?: string;
        interactive?: boolean;
        style: string | string[];
        encode?: import("vega").TitleEncode | Partial<Record<import("vega").EncodeEntryName, import("vega").TextEncodeEntry>>;
        anchor?: import("vega").AnchorValue;
        frame?: import("vega").FontStyleValue;
        offset?: import("vega").NumberValue;
        orient?: import("vega").ScaleField;
        aria?: boolean;
        align?: import("vega").AlignValue;
        angle?: import("vega").NumberValue;
        baseline?: import("vega").TextBaselineValue;
        dx?: import("vega").NumberValue;
        dy?: import("vega").NumberValue;
        limit?: import("vega").NumberValue;
        color?: import("vega").ColorValue;
        font?: import("vega").FontStyleValue;
        fontSize?: import("vega").NumberValue;
        fontStyle?: import("vega").FontStyleValue;
        fontWeight?: import("vega").FontWeightValue;
        lineHeight?: import("vega").NumberValue;
        subtitleColor?: import("vega").ColorValue;
        subtitleFont?: import("vega").FontStyleValue;
        subtitleFontSize?: import("vega").NumberValue;
        subtitleFontStyle?: import("vega").FontStyleValue;
        subtitleFontWeight?: import("vega").FontWeightValue;
        subtitleLineHeight?: import("vega").NumberValue;
        subtitlePadding?: import("vega").NumberValue;
        zindex?: number;
    };
};
export declare function defaultHeaderGuideAlign(headerChannel: HeaderChannel, angle: number, anchor?: TitleAnchor): {
    align: string;
} | {
    align: "left" | "right" | "center" | SignalRef;
} | {
    align?: undefined;
};
export declare function defaultHeaderGuideBaseline(angle: number, channel: FacetChannel): {
    baseline: string | {
        signal: string;
    };
} | {
    baseline?: undefined;
};
export declare function assembleHeaderGroups(model: Model, channel: HeaderChannel): VgMarkGroup[];
export declare function assembleLabelTitle(facetFieldDef: FacetFieldDef<string, SignalRef>, channel: FacetChannel, config: Config<SignalRef>): {
    text: string | string[] | SignalRef | {
        signal: string;
    };
    subtitle?: string | string[] | SignalRef;
    name?: string;
    interactive?: boolean;
    style: string | string[];
    encode?: import("vega").TitleEncode | Partial<Record<import("vega").EncodeEntryName, import("vega").TextEncodeEntry>>;
    anchor?: import("vega").AnchorValue;
    frame: import("vega").FontStyleValue;
    offset?: import("vega").NumberValue;
    orient?: import("vega").ScaleField;
    aria?: boolean;
    align: string | SignalRef | {
        field: import("vega").Field;
    } | {
        scale: import("vega").Field;
        value: string | number | boolean;
    } | {
        scale: import("vega").Field;
        field: import("vega").Field;
    } | {
        scale: import("vega").Field;
        band: number | boolean;
    } | {
        scale: import("vega").Field;
        range: number | boolean;
    } | {
        value: import("vega").Align;
    };
    angle?: import("vega").NumberValue;
    baseline: string | SignalRef | {
        field: import("vega").Field;
    } | {
        scale: import("vega").Field;
        value: string | number | boolean;
    } | {
        scale: import("vega").Field;
        field: import("vega").Field;
    } | {
        scale: import("vega").Field;
        band: number | boolean;
    } | {
        scale: import("vega").Field;
        range: number | boolean;
    } | {
        value: import("vega").TextBaseline;
    } | {
        signal: string;
    };
    dx?: import("vega").NumberValue;
    dy?: import("vega").NumberValue;
    limit?: import("vega").NumberValue;
    color?: import("vega").ColorValue;
    font?: import("vega").FontStyleValue;
    fontSize?: import("vega").NumberValue;
    fontStyle?: import("vega").FontStyleValue;
    fontWeight?: import("vega").FontWeightValue;
    lineHeight?: import("vega").NumberValue;
    subtitleColor?: import("vega").ColorValue;
    subtitleFont?: import("vega").FontStyleValue;
    subtitleFontSize?: import("vega").NumberValue;
    subtitleFontStyle?: import("vega").FontStyleValue;
    subtitleFontWeight?: import("vega").FontWeightValue;
    subtitleLineHeight?: import("vega").NumberValue;
    subtitlePadding?: import("vega").NumberValue;
    zindex?: number;
} | {
    text: string | string[] | SignalRef | {
        signal: string;
    };
    subtitle?: string | string[] | SignalRef;
    name?: string;
    interactive?: boolean;
    style: string | string[];
    encode?: import("vega").TitleEncode | Partial<Record<import("vega").EncodeEntryName, import("vega").TextEncodeEntry>>;
    anchor?: import("vega").AnchorValue;
    frame: import("vega").FontStyleValue;
    offset?: import("vega").NumberValue;
    orient?: import("vega").ScaleField;
    aria?: boolean;
    align: import("vega").AlignValue;
    angle?: import("vega").NumberValue;
    baseline: string | SignalRef | {
        field: import("vega").Field;
    } | {
        scale: import("vega").Field;
        value: string | number | boolean;
    } | {
        scale: import("vega").Field;
        field: import("vega").Field;
    } | {
        scale: import("vega").Field;
        band: number | boolean;
    } | {
        scale: import("vega").Field;
        range: number | boolean;
    } | {
        value: import("vega").TextBaseline;
    } | {
        signal: string;
    };
    dx?: import("vega").NumberValue;
    dy?: import("vega").NumberValue;
    limit?: import("vega").NumberValue;
    color?: import("vega").ColorValue;
    font?: import("vega").FontStyleValue;
    fontSize?: import("vega").NumberValue;
    fontStyle?: import("vega").FontStyleValue;
    fontWeight?: import("vega").FontWeightValue;
    lineHeight?: import("vega").NumberValue;
    subtitleColor?: import("vega").ColorValue;
    subtitleFont?: import("vega").FontStyleValue;
    subtitleFontSize?: import("vega").NumberValue;
    subtitleFontStyle?: import("vega").FontStyleValue;
    subtitleFontWeight?: import("vega").FontWeightValue;
    subtitleLineHeight?: import("vega").NumberValue;
    subtitlePadding?: import("vega").NumberValue;
    zindex?: number;
} | {
    text: string | string[] | SignalRef | {
        signal: string;
    };
    subtitle?: string | string[] | SignalRef;
    name?: string;
    interactive?: boolean;
    style: string | string[];
    encode?: import("vega").TitleEncode | Partial<Record<import("vega").EncodeEntryName, import("vega").TextEncodeEntry>>;
    anchor?: import("vega").AnchorValue;
    frame: import("vega").FontStyleValue;
    offset?: import("vega").NumberValue;
    orient?: import("vega").ScaleField;
    aria?: boolean;
    align?: import("vega").AlignValue;
    angle?: import("vega").NumberValue;
    baseline: string | SignalRef | {
        field: import("vega").Field;
    } | {
        scale: import("vega").Field;
        value: string | number | boolean;
    } | {
        scale: import("vega").Field;
        field: import("vega").Field;
    } | {
        scale: import("vega").Field;
        band: number | boolean;
    } | {
        scale: import("vega").Field;
        range: number | boolean;
    } | {
        value: import("vega").TextBaseline;
    } | {
        signal: string;
    };
    dx?: import("vega").NumberValue;
    dy?: import("vega").NumberValue;
    limit?: import("vega").NumberValue;
    color?: import("vega").ColorValue;
    font?: import("vega").FontStyleValue;
    fontSize?: import("vega").NumberValue;
    fontStyle?: import("vega").FontStyleValue;
    fontWeight?: import("vega").FontWeightValue;
    lineHeight?: import("vega").NumberValue;
    subtitleColor?: import("vega").ColorValue;
    subtitleFont?: import("vega").FontStyleValue;
    subtitleFontSize?: import("vega").NumberValue;
    subtitleFontStyle?: import("vega").FontStyleValue;
    subtitleFontWeight?: import("vega").FontWeightValue;
    subtitleLineHeight?: import("vega").NumberValue;
    subtitlePadding?: import("vega").NumberValue;
    zindex?: number;
} | {
    text: string | string[] | SignalRef | {
        signal: string;
    };
    subtitle?: string | string[] | SignalRef;
    name?: string;
    interactive?: boolean;
    style: string | string[];
    encode?: import("vega").TitleEncode | Partial<Record<import("vega").EncodeEntryName, import("vega").TextEncodeEntry>>;
    anchor?: import("vega").AnchorValue;
    frame: import("vega").FontStyleValue;
    offset?: import("vega").NumberValue;
    orient?: import("vega").ScaleField;
    aria?: boolean;
    align: string | SignalRef | {
        field: import("vega").Field;
    } | {
        scale: import("vega").Field;
        value: string | number | boolean;
    } | {
        scale: import("vega").Field;
        field: import("vega").Field;
    } | {
        scale: import("vega").Field;
        band: number | boolean;
    } | {
        scale: import("vega").Field;
        range: number | boolean;
    } | {
        value: import("vega").Align;
    };
    angle?: import("vega").NumberValue;
    baseline?: import("vega").TextBaselineValue;
    dx?: import("vega").NumberValue;
    dy?: import("vega").NumberValue;
    limit?: import("vega").NumberValue;
    color?: import("vega").ColorValue;
    font?: import("vega").FontStyleValue;
    fontSize?: import("vega").NumberValue;
    fontStyle?: import("vega").FontStyleValue;
    fontWeight?: import("vega").FontWeightValue;
    lineHeight?: import("vega").NumberValue;
    subtitleColor?: import("vega").ColorValue;
    subtitleFont?: import("vega").FontStyleValue;
    subtitleFontSize?: import("vega").NumberValue;
    subtitleFontStyle?: import("vega").FontStyleValue;
    subtitleFontWeight?: import("vega").FontWeightValue;
    subtitleLineHeight?: import("vega").NumberValue;
    subtitlePadding?: import("vega").NumberValue;
    zindex?: number;
} | {
    text: string | string[] | SignalRef | {
        signal: string;
    };
    subtitle?: string | string[] | SignalRef;
    name?: string;
    interactive?: boolean;
    style: string | string[];
    encode?: import("vega").TitleEncode | Partial<Record<import("vega").EncodeEntryName, import("vega").TextEncodeEntry>>;
    anchor?: import("vega").AnchorValue;
    frame: import("vega").FontStyleValue;
    offset?: import("vega").NumberValue;
    orient?: import("vega").ScaleField;
    aria?: boolean;
    align: import("vega").AlignValue;
    angle?: import("vega").NumberValue;
    baseline?: import("vega").TextBaselineValue;
    dx?: import("vega").NumberValue;
    dy?: import("vega").NumberValue;
    limit?: import("vega").NumberValue;
    color?: import("vega").ColorValue;
    font?: import("vega").FontStyleValue;
    fontSize?: import("vega").NumberValue;
    fontStyle?: import("vega").FontStyleValue;
    fontWeight?: import("vega").FontWeightValue;
    lineHeight?: import("vega").NumberValue;
    subtitleColor?: import("vega").ColorValue;
    subtitleFont?: import("vega").FontStyleValue;
    subtitleFontSize?: import("vega").NumberValue;
    subtitleFontStyle?: import("vega").FontStyleValue;
    subtitleFontWeight?: import("vega").FontWeightValue;
    subtitleLineHeight?: import("vega").NumberValue;
    subtitlePadding?: import("vega").NumberValue;
    zindex?: number;
} | {
    text: string | string[] | SignalRef | {
        signal: string;
    };
    subtitle?: string | string[] | SignalRef;
    name?: string;
    interactive?: boolean;
    style: string | string[];
    encode?: import("vega").TitleEncode | Partial<Record<import("vega").EncodeEntryName, import("vega").TextEncodeEntry>>;
    anchor?: import("vega").AnchorValue;
    frame: import("vega").FontStyleValue;
    offset?: import("vega").NumberValue;
    orient?: import("vega").ScaleField;
    aria?: boolean;
    align?: import("vega").AlignValue;
    angle?: import("vega").NumberValue;
    baseline?: import("vega").TextBaselineValue;
    dx?: import("vega").NumberValue;
    dy?: import("vega").NumberValue;
    limit?: import("vega").NumberValue;
    color?: import("vega").ColorValue;
    font?: import("vega").FontStyleValue;
    fontSize?: import("vega").NumberValue;
    fontStyle?: import("vega").FontStyleValue;
    fontWeight?: import("vega").FontWeightValue;
    lineHeight?: import("vega").NumberValue;
    subtitleColor?: import("vega").ColorValue;
    subtitleFont?: import("vega").FontStyleValue;
    subtitleFontSize?: import("vega").NumberValue;
    subtitleFontStyle?: import("vega").FontStyleValue;
    subtitleFontWeight?: import("vega").FontWeightValue;
    subtitleLineHeight?: import("vega").NumberValue;
    subtitlePadding?: import("vega").NumberValue;
    zindex?: number;
};
export declare function assembleHeaderGroup(model: Model, channel: HeaderChannel, headerType: HeaderType, layoutHeader: LayoutHeaderComponent, headerComponent: HeaderComponent): {
    axes?: import("vega").Axis[];
    encode?: {
        update: {
            [x: string]: {
                signal: string;
            };
        };
    };
    title?: {
        text: string | string[] | SignalRef | {
            signal: string;
        };
        subtitle?: string | string[] | SignalRef;
        name?: string;
        interactive?: boolean;
        style: string | string[];
        encode?: import("vega").TitleEncode | Partial<Record<import("vega").EncodeEntryName, import("vega").TextEncodeEntry>>;
        anchor?: import("vega").AnchorValue;
        frame: import("vega").FontStyleValue;
        offset?: import("vega").NumberValue;
        orient?: import("vega").ScaleField;
        aria?: boolean;
        align: string | SignalRef | {
            field: import("vega").Field;
        } | {
            scale: import("vega").Field;
            value: string | number | boolean;
        } | {
            scale: import("vega").Field;
            field: import("vega").Field;
        } | {
            scale: import("vega").Field;
            band: number | boolean;
        } | {
            scale: import("vega").Field;
            range: number | boolean;
        } | {
            value: import("vega").Align;
        };
        angle?: import("vega").NumberValue;
        baseline: string | SignalRef | {
            field: import("vega").Field;
        } | {
            scale: import("vega").Field;
            value: string | number | boolean;
        } | {
            scale: import("vega").Field;
            field: import("vega").Field;
        } | {
            scale: import("vega").Field;
            band: number | boolean;
        } | {
            scale: import("vega").Field;
            range: number | boolean;
        } | {
            value: import("vega").TextBaseline;
        } | {
            signal: string;
        };
        dx?: import("vega").NumberValue;
        dy?: import("vega").NumberValue;
        limit?: import("vega").NumberValue;
        color?: import("vega").ColorValue;
        font?: import("vega").FontStyleValue;
        fontSize?: import("vega").NumberValue;
        fontStyle?: import("vega").FontStyleValue;
        fontWeight?: import("vega").FontWeightValue;
        lineHeight?: import("vega").NumberValue;
        subtitleColor?: import("vega").ColorValue;
        subtitleFont?: import("vega").FontStyleValue;
        subtitleFontSize?: import("vega").NumberValue;
        subtitleFontStyle?: import("vega").FontStyleValue;
        subtitleFontWeight?: import("vega").FontWeightValue;
        subtitleLineHeight?: import("vega").NumberValue;
        subtitlePadding?: import("vega").NumberValue;
        zindex?: number;
    } | {
        text: string | string[] | SignalRef | {
            signal: string;
        };
        subtitle?: string | string[] | SignalRef;
        name?: string;
        interactive?: boolean;
        style: string | string[];
        encode?: import("vega").TitleEncode | Partial<Record<import("vega").EncodeEntryName, import("vega").TextEncodeEntry>>;
        anchor?: import("vega").AnchorValue;
        frame: import("vega").FontStyleValue;
        offset?: import("vega").NumberValue;
        orient?: import("vega").ScaleField;
        aria?: boolean;
        align?: import("vega").AlignValue;
        angle?: import("vega").NumberValue;
        baseline: string | SignalRef | {
            field: import("vega").Field;
        } | {
            scale: import("vega").Field;
            value: string | number | boolean;
        } | {
            scale: import("vega").Field;
            field: import("vega").Field;
        } | {
            scale: import("vega").Field;
            band: number | boolean;
        } | {
            scale: import("vega").Field;
            range: number | boolean;
        } | {
            value: import("vega").TextBaseline;
        } | {
            signal: string;
        };
        dx?: import("vega").NumberValue;
        dy?: import("vega").NumberValue;
        limit?: import("vega").NumberValue;
        color?: import("vega").ColorValue;
        font?: import("vega").FontStyleValue;
        fontSize?: import("vega").NumberValue;
        fontStyle?: import("vega").FontStyleValue;
        fontWeight?: import("vega").FontWeightValue;
        lineHeight?: import("vega").NumberValue;
        subtitleColor?: import("vega").ColorValue;
        subtitleFont?: import("vega").FontStyleValue;
        subtitleFontSize?: import("vega").NumberValue;
        subtitleFontStyle?: import("vega").FontStyleValue;
        subtitleFontWeight?: import("vega").FontWeightValue;
        subtitleLineHeight?: import("vega").NumberValue;
        subtitlePadding?: import("vega").NumberValue;
        zindex?: number;
    } | {
        text: string | string[] | SignalRef | {
            signal: string;
        };
        subtitle?: string | string[] | SignalRef;
        name?: string;
        interactive?: boolean;
        style: string | string[];
        encode?: import("vega").TitleEncode | Partial<Record<import("vega").EncodeEntryName, import("vega").TextEncodeEntry>>;
        anchor?: import("vega").AnchorValue;
        frame: import("vega").FontStyleValue;
        offset?: import("vega").NumberValue;
        orient?: import("vega").ScaleField;
        aria?: boolean;
        align: string | SignalRef | {
            field: import("vega").Field;
        } | {
            scale: import("vega").Field;
            value: string | number | boolean;
        } | {
            scale: import("vega").Field;
            field: import("vega").Field;
        } | {
            scale: import("vega").Field;
            band: number | boolean;
        } | {
            scale: import("vega").Field;
            range: number | boolean;
        } | {
            value: import("vega").Align;
        };
        angle?: import("vega").NumberValue;
        baseline?: import("vega").TextBaselineValue;
        dx?: import("vega").NumberValue;
        dy?: import("vega").NumberValue;
        limit?: import("vega").NumberValue;
        color?: import("vega").ColorValue;
        font?: import("vega").FontStyleValue;
        fontSize?: import("vega").NumberValue;
        fontStyle?: import("vega").FontStyleValue;
        fontWeight?: import("vega").FontWeightValue;
        lineHeight?: import("vega").NumberValue;
        subtitleColor?: import("vega").ColorValue;
        subtitleFont?: import("vega").FontStyleValue;
        subtitleFontSize?: import("vega").NumberValue;
        subtitleFontStyle?: import("vega").FontStyleValue;
        subtitleFontWeight?: import("vega").FontWeightValue;
        subtitleLineHeight?: import("vega").NumberValue;
        subtitlePadding?: import("vega").NumberValue;
        zindex?: number;
    } | {
        text: string | string[] | SignalRef | {
            signal: string;
        };
        subtitle?: string | string[] | SignalRef;
        name?: string;
        interactive?: boolean;
        style: string | string[];
        encode?: import("vega").TitleEncode | Partial<Record<import("vega").EncodeEntryName, import("vega").TextEncodeEntry>>;
        anchor?: import("vega").AnchorValue;
        frame: import("vega").FontStyleValue;
        offset?: import("vega").NumberValue;
        orient?: import("vega").ScaleField;
        aria?: boolean;
        align?: import("vega").AlignValue;
        angle?: import("vega").NumberValue;
        baseline?: import("vega").TextBaselineValue;
        dx?: import("vega").NumberValue;
        dy?: import("vega").NumberValue;
        limit?: import("vega").NumberValue;
        color?: import("vega").ColorValue;
        font?: import("vega").FontStyleValue;
        fontSize?: import("vega").NumberValue;
        fontStyle?: import("vega").FontStyleValue;
        fontWeight?: import("vega").FontWeightValue;
        lineHeight?: import("vega").NumberValue;
        subtitleColor?: import("vega").ColorValue;
        subtitleFont?: import("vega").FontStyleValue;
        subtitleFontSize?: import("vega").NumberValue;
        subtitleFontStyle?: import("vega").FontStyleValue;
        subtitleFontWeight?: import("vega").FontWeightValue;
        subtitleLineHeight?: import("vega").NumberValue;
        subtitlePadding?: import("vega").NumberValue;
        zindex?: number;
    };
    from?: {
        data: string;
    } | {
        data: string;
    };
    sort?: VgComparator;
    name: string;
    type: string;
    role: string;
};
export declare function getLayoutTitleBand(titleAnchor: TitleAnchor, headerChannel: HeaderChannel): any;
export declare function assembleLayoutTitleBand(headerComponentIndex: LayoutHeaderComponentIndex, config: Config<SignalRef>): RowCol<number>;
export declare function assembleHeaderProperties(config: Config<SignalRef>, facetFieldDef: FacetFieldDef<string, SignalRef>, channel: FacetChannel, properties: (keyof CoreHeader<SignalRef>)[], propertiesMap: Partial<Record<keyof CoreHeader<SignalRef>, keyof TitleConfig>>): Partial<VgTitle>;
//# sourceMappingURL=assemble.d.ts.map