import { Binding, Expr, InitSignal, NewSignal } from 'vega';
export interface Parameter {
    /**
     * Required. A unique name for the parameter. Parameter names should be valid JavaScript identifiers: they should contain only alphanumeric characters (or “$”, or “_”) and may not start with a digit. Reserved keywords that may not be used as parameter names are "datum", "event", "item", and "parent".
     */
    name: string;
    /**
     * A text description of the parameter, useful for inline documentation.
     */
    description?: string;
    /**
     * The initial value of the parameter.
     *
     * __Default value:__ `undefined`
     */
    value?: any;
    /**
     * An expression for the value of the parameter. This expression may include other parameters, in which case the parameter will automatically update in response to upstream parameter changes.
     */
    expr?: Expr;
    /**
     * Binds the parameter to an external input element such as a slider, selection list or radio button group.
     */
    bind?: Binding;
}
export declare function assembleParameterSignals(params: Parameter[]): (NewSignal | InitSignal)[];
//# sourceMappingURL=parameter.d.ts.map