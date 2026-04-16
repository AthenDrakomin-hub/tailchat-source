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
exports.PrettyBytes = void 0;
const BYTE_UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
const BIT_UNITS = ['b', 'kbit', 'Mbit', 'Gbit', 'Tbit', 'Pbit', 'Ebit', 'Zbit', 'Ybit'];
/*
Formats the given number using `Number#toLocaleString`.
- If locale is a string, the value is expected to be a locale-key (for example: `de`).
- If locale is true, the system default locale is used for translation.
- If no value for locale is specified, the number is returned unmodified.
*/
const toLocaleString = (number, locale) => {
    let result = `${number}`;
    if (typeof locale === 'string') {
        result = number.toLocaleString(locale);
    }
    else if (locale === true) {
        result = number.toLocaleString();
    }
    return result;
};
class PrettyBytes {
    constructor(prefix, value, unit, raw) {
        this.prefix = prefix;
        this.value = value;
        this.unit = unit;
        this.raw = raw;
    }
    static stringify(number, options) {
        return PrettyBytes.create(number, options).toString();
    }
    static create(number, options) {
        const raw = number;
        if (!Number.isFinite(number)) {
            throw new TypeError(`Expected a finite number, got ${typeof number}: ${number}`);
        }
        options = Object.assign({ bits: false }, options);
        const UNITS = options.bits ? BIT_UNITS : BYTE_UNITS;
        const isNegative = number < 0;
        const prefix = isNegative ? '-' : options.signed ? '+' : '';
        if (options.signed && number === 0) {
            return new PrettyBytes(prefix, ' 0 ', UNITS[0], number);
        }
        if (isNegative) {
            number = -number;
        }
        if (number < 1) {
            const numberString = toLocaleString(number, options.locale);
            return new PrettyBytes(prefix, numberString, UNITS[0], raw);
        }
        const exponent = Math.min(Math.floor(Math.log10(number) / 3), UNITS.length - 1);
        number = Number((number / Math.pow(1000, exponent)).toPrecision(3));
        const numberString = toLocaleString(number, options.locale);
        const unit = UNITS[exponent];
        return new PrettyBytes(prefix, numberString, unit, raw);
    }
    toString() {
        return `${this.prefix}${this.value} ${this.unit}`;
    }
    valueOf() {
        return this.toString();
    }
    [Symbol.toPrimitive]() {
        return this.toString();
    }
    [Symbol.toStringTag]() {
        return this.toString();
    }
    toJSON() {
        return this.toString();
    }
}
exports.PrettyBytes = PrettyBytes;
//# sourceMappingURL=pretty-bytes.js.map