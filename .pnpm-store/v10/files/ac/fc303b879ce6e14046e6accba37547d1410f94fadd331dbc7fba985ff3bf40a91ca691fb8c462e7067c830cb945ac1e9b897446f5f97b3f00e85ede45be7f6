import type { ClassNames as ComponentClasses } from '@livekit/components-styles/dist/types/general/index.css';
import type { ClassNames as PrefabClasses } from '@livekit/components-styles/dist/types/general/prefabs/index.css';
import type { UnprefixedClassNames as ComponentNoPrefixClasses } from '@livekit/components-styles/dist/types_unprefixed/index.scss';
import type { UnprefixedClassNames as PrefabNoPrefixClasses } from '@livekit/components-styles/dist/types_unprefixed/prefabs/index.scss';
type UnprefixedClassNames = ComponentNoPrefixClasses | PrefabNoPrefixClasses;
type Classes = PrefabClasses | ComponentClasses;
/**
 * This function is a type safe way to add a prefix to a HTML class attribute.
 * Only classes defined in the styles module are valid, any other class produces a ts error.
 * @internal
 */
export declare function prefixClass(unprefixedClassName: UnprefixedClassNames): Classes;
export declare function kebabize(str: string): string;
export {};
//# sourceMappingURL=class-prefixer.d.ts.map