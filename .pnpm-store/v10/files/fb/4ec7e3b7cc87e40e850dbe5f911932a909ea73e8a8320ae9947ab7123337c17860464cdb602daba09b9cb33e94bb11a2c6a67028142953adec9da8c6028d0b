import { Size } from '../../types';
import { Module } from './module';
import { Node } from './node';
export declare class BaseFolder extends Node {
    children: Record<string, BaseFolder | Module>;
    private innerSize?;
    constructor(name: string, parent?: Node);
    get size(): Size;
    getChild(name: string): Module | BaseFolder;
    addChildModule(module: Module): void;
    addChildFolder<T extends BaseFolder>(folder: T): T;
    walk<T>(walker: (node: BaseFolder | Module, prevState: T) => T, state: T, deep?: boolean): T;
    mergeNestedFolders(): void;
    toChartData(): {
        name: string;
        value: number;
        gzip: number;
        brotli: number;
        children: any[];
    };
}
