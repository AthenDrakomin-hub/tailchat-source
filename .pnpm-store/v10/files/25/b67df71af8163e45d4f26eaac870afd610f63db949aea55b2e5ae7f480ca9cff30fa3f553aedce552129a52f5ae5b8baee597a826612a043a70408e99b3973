import { PackageMeta } from './stats-parser/types';
export declare function trimModuleName(raw: string): string;
/**
 * input '/workspace/foo/node_modules/@foo/bar/node_modules/abc/example.js'
 * rootPath '/workspace/foo'
 * return {
 *   path: '/workspace/foo/node_modules/@foo/bar/node_modules/abc'
 *   moduleName: 'abc'
 *   dependentPath: 'node_modules/@foo/bar/node_modules/abc'
 * }
 */
export declare function resolveNodeModulePath(fullPath: string, rootPath: string): {
    path: string;
    moduleName: string;
    dependentPath: string;
} | undefined;
export declare function getPackageMeta(modulePath: string, repoPath: string, buildPath: string): PackageMeta | null;
