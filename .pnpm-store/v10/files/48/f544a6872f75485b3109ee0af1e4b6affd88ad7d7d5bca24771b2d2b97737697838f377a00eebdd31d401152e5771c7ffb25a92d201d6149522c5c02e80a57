import { BaseFolder } from './base-folder';
import { ModuleData } from './types';
export declare class Folder extends BaseFolder {
    get gzipSize(): number;
    get brSize(): number;
    addModule(moduleData: ModuleData): void;
    toChartData(): {
        gzip: number;
        brotli: number;
        name: string;
        value: number;
        children: any[];
    };
}
