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
exports.compressionNotice = void 0;
const utils_1 = require("@perfsee/utils");
const types_1 = require("../../types");
const compressionNotice = ({ assets }) => {
    return {
        id: 'compression-notice',
        title: 'Enable compression when transferring your assets',
        desc: 'Use correct compression algorithm could significantly decrease transfer size.',
        detail: {
            type: 'table',
            headings: [
                { key: 'name', itemType: 'text', name: 'Asset' },
                { key: 'raw', itemType: 'text', name: 'Raw Size' },
                { key: 'gzip', itemType: 'text', name: 'Gzip' },
                { key: 'brotli', itemType: 'text', name: 'Brotli' },
            ],
            items: assets
                // incompressible assets
                .filter((asset) => asset.size.gzip < asset.size.raw)
                .slice(0, 8)
                .map(({ name, size }) => ({
                name,
                raw: utils_1.PrettyBytes.create(size.raw).toString(),
                gzip: `${utils_1.PrettyBytes.create(size.gzip)} (save: ${Math.round(((size.raw - size.gzip) / size.raw) * 100)}%)`,
                brotli: `${utils_1.PrettyBytes.create(size.brotli)} (save: ${Math.round(((size.raw - size.brotli) / size.raw) * 100)}%)`,
            })),
        },
        score: types_1.BundleAuditScore.Notice,
        weight: 0,
    };
};
exports.compressionNotice = compressionNotice;
//# sourceMappingURL=compression-notice.js.map