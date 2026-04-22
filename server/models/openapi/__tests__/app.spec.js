"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../app");
describe('openapp', () => {
    describe('filterAvailableAppCapability', () => {
        test.each([
            [['bot'], ['bot']],
            [['bot', 'foo'], ['bot']],
            [
                ['bot', 'webpage', 'oauth'],
                ['bot', 'webpage', 'oauth'],
            ],
            [
                ['bot', 'webpage', 'oauth', 'a', 'b', 'c'],
                ['bot', 'webpage', 'oauth'],
            ],
        ])('%p', (input, output) => {
            expect((0, app_1.filterAvailableAppCapability)(input)).toEqual(output);
        });
    });
});
