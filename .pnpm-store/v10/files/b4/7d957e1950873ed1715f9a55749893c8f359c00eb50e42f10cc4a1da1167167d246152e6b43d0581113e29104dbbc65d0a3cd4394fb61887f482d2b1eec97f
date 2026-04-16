"use strict";
/*
Copyright 2022 ByteDance and/or its affiliates.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseFolder = void 0;
const lodash_1 = require("lodash");
const utils_1 = require("../../utils");
const node_1 = require("./node");
const DEFAULT_SIZE = (0, utils_1.getDefaultSize)();
class BaseFolder extends node_1.Node {
    constructor(name, parent) {
        super(name, parent);
        this.children = Object.create(null);
    }
    get size() {
        if (!(0, lodash_1.has)(this, 'innerSize')) {
            this.innerSize = this.walk((node, size) => (0, utils_1.addSize)(size, node.size), DEFAULT_SIZE, false);
        }
        return this.innerSize;
    }
    getChild(name) {
        return this.children[name];
    }
    addChildModule(module) {
        const { name } = module;
        const currentChild = this.children[name];
        // For some reason we already have this node in children and it's a folder.
        if (currentChild && currentChild instanceof BaseFolder)
            return;
        if (currentChild) {
            // We already have this node in children and it's a module.
            // Merging it's data.
            currentChild.mergeData(module.data);
        }
        else {
            // Pushing new module
            module.parent = this;
            this.children[name] = module;
        }
        delete this.innerSize;
    }
    addChildFolder(folder) {
        folder.parent = this;
        this.children[folder.name] = folder;
        delete this.innerSize;
        return folder;
    }
    walk(walker, state, deep = true) {
        Object.values(this.children).forEach((child) => {
            if (deep && child instanceof BaseFolder) {
                state = child.walk(walker, state);
            }
            else {
                state = walker(child, state);
            }
        });
        return state;
    }
    mergeNestedFolders() {
        if (!this.isRoot) {
            let childNames;
            while ((childNames = Object.keys(this.children)).length === 1) {
                const childName = childNames[0];
                const onlyChild = this.children[childName];
                if (onlyChild instanceof this.constructor) {
                    this.name += `/${onlyChild.name}`;
                    this.children = onlyChild.children;
                }
                else {
                    break;
                }
            }
        }
        this.walk((child) => {
            child.parent = this;
            if (child.mergeNestedFolders) {
                ;
                child.mergeNestedFolders();
            }
        }, null, false);
    }
    toChartData() {
        return {
            name: this.name,
            value: this.size.raw,
            gzip: this.size.gzip,
            brotli: this.size.brotli,
            children: (0, lodash_1.invokeMap)(this.children, 'toChartData'),
        };
    }
}
exports.BaseFolder = BaseFolder;
//# sourceMappingURL=base-folder.js.map