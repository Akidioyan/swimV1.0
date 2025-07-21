export declare class PipeError extends Error {
    source: Record<string, string>;
    stack: string;
    index: number;
    constructor(message: any, { error, name, index }?: {
        error: string;
        name?: string;
        index?: number;
    });
}
export declare function pipe(...fns: any[]): (x: any) => any;
export declare function pipeAsync(...fns: any[]): (x: any) => any;
