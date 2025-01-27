/**
 * Data type based on level of measurement
 */
export declare const Type: {
    readonly quantitative: "quantitative";
    readonly ordinal: "ordinal";
    readonly temporal: "temporal";
    readonly nominal: "nominal";
    readonly geojson: "geojson";
};
export declare type Type = keyof typeof Type;
export declare function isType(t: any): t is Type;
export declare const QUANTITATIVE: "quantitative";
export declare const ORDINAL: "ordinal";
export declare const TEMPORAL: "temporal";
export declare const NOMINAL: "nominal";
export declare const GEOJSON: "geojson";
export declare type StandardType = 'quantitative' | 'ordinal' | 'temporal' | 'nominal';
export declare const TYPES: ("ordinal" | "geojson" | "quantitative" | "temporal" | "nominal")[];
/**
 * Get full, lowercase type name for a given type.
 * @param  type
 * @return Full type name.
 */
export declare function getFullName(type: Type | string): Type | undefined;
//# sourceMappingURL=type.d.ts.map