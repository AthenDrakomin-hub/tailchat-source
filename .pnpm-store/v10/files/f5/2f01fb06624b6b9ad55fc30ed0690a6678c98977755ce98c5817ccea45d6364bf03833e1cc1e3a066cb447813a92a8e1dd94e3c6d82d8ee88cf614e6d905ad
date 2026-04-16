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
exports.ConcatenatedModule = void 0;
const module_1 = require("./module");
class ConcatenatedModule extends module_1.Module {
    constructor(name, data, parent) {
        super(name, data, parent);
        this.name += ' (concatenated)';
        this.children = [];
        this.fillContentModules();
    }
    fillContentModules() {
        this.data.concatenating.forEach((moduleData) => this.addContentModule(moduleData));
    }
    addContentModule(moduleData) {
        this.children.push(moduleData.realPath);
    }
    toChartData() {
        return {
            ...super.toChartData(),
            concatenated: true,
            modules: this.children,
        };
    }
}
exports.ConcatenatedModule = ConcatenatedModule;
//# sourceMappingURL=concatenated-module.js.map