"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringLengthExpectedError = exports.FunctionCalledMoreThanSupportedError = exports.NotValidModelError = exports.RefOptionIsUndefinedError = exports.OptionRefDoesNotSupportArraysError = exports.SelfContainingClassError = exports.CannotBeSymbolError = exports.InvalidWhatIsItError = exports.AssertionFallbackError = exports.NoValidClassError = exports.NotAllVPOPElementsError = exports.NotStringTypeError = exports.NotNumberTypeError = exports.InvalidTypeError = void 0;
const utils_1 = require("./utils");
// Note: dont forget to use "toStringNoFail" on values that are "unknown" or "any"
class InvalidTypeError extends Error {
    constructor(targetName, key, Type) {
        super(`"${targetName}.${key}"'s Type is invalid! Type is: "${(0, utils_1.toStringNoFail)(Type)}" [E009]`);
    }
}
exports.InvalidTypeError = InvalidTypeError;
class NotNumberTypeError extends Error {
    constructor(targetName, key, enumKey, enumValue) {
        super(`Typeof "${targetName}.${key}" is "Number", value is undefined/null or does not have a reverse mapping! [E011]\n` +
            `  Encountered with property: "${enumKey}.${typeof enumValue}"`);
    }
}
exports.NotNumberTypeError = NotNumberTypeError;
class NotStringTypeError extends Error {
    constructor(targetName, key, enumKey, enumValue) {
        super(`Typeof "${targetName}.${key}" is "String", used enum is not only Strings! [E010]\n` +
            `  Encountered with property in Enum: "${enumKey}.${typeof enumValue}"`);
    }
}
exports.NotStringTypeError = NotStringTypeError;
/** Not All Virtual Populate Elements Error */
class NotAllVPOPElementsError extends Error {
    constructor(name, key) {
        super(`"${name}.${key}" has not all needed Virtual Populate Options! Needed are: ${utils_1.allVirtualoptions.join(', ')} [E006]`);
    }
}
exports.NotAllVPOPElementsError = NotAllVPOPElementsError;
class NoValidClassError extends TypeError {
    constructor(cl) {
        super(`"${(0, utils_1.toStringNoFail)(cl)}" is not a function(/constructor)!`);
    }
}
exports.NoValidClassError = NoValidClassError;
class AssertionFallbackError extends Error {
    constructor() {
        super('Assert failed - no custom error [E019]');
    }
}
exports.AssertionFallbackError = AssertionFallbackError;
/** Error for when an unknown WhatIsIt is passed to an switch, gets thrown in the default case */
class InvalidWhatIsItError extends Error {
    constructor(whatisit, name, key, where) {
        super(`"${(0, utils_1.toStringNoFail)(whatisit)}"(${where}) is invalid for "${name}.${key}" [E013]`);
    }
}
exports.InvalidWhatIsItError = InvalidWhatIsItError;
class CannotBeSymbolError extends Error {
    constructor(name, key) {
        super(`A property key in Typegoose cannot be an symbol! ("${name}.${(0, utils_1.toStringNoFail)(key)}") [E024]`);
    }
}
exports.CannotBeSymbolError = CannotBeSymbolError;
class SelfContainingClassError extends TypeError {
    constructor(name, key) {
        super('It seems like the type used is the same as the target class, which is not supported\n' +
            `Please look at https://github.com/typegoose/typegoose/issues/42 for more information ("${name}.${key}") [E004]`);
    }
}
exports.SelfContainingClassError = SelfContainingClassError;
class OptionRefDoesNotSupportArraysError extends TypeError {
    constructor(dim, name, key) {
        super(`Prop-Option "ref" does not support Arrays! (got "${dim}" dimensions, for property "${name}.${key}") [E021]`);
    }
}
exports.OptionRefDoesNotSupportArraysError = OptionRefDoesNotSupportArraysError;
class RefOptionIsUndefinedError extends Error {
    constructor(name, key) {
        super(`Prop-Option "ref"'s value is "null" or "undefined" for "${name}.${key}" [E005]`);
    }
}
exports.RefOptionIsUndefinedError = RefOptionIsUndefinedError;
class NotValidModelError extends TypeError {
    constructor(model, where) {
        super(`Expected "${where}" to be a valid mongoose.Model! (got: "${(0, utils_1.toStringNoFail)(model)}") [E025]`);
    }
}
exports.NotValidModelError = NotValidModelError;
class FunctionCalledMoreThanSupportedError extends Error {
    constructor(functionName, supported, extra) {
        super(`Function "${functionName}" only supports to be called "${supported}" times with the same parameters [E003]\n${extra}`);
    }
}
exports.FunctionCalledMoreThanSupportedError = FunctionCalledMoreThanSupportedError;
class StringLengthExpectedError extends TypeError {
    constructor(length, got, where, valueName) {
        // create the "got:" message, when string say it was a string, but not the length
        // if not string, then say it is not a string plus the value
        const gotMessage = typeof got === 'string' ? `(String: "${got.length}")` : `(not-String: "${(0, utils_1.toStringNoFail)(got)}")`;
        super(`Expected "${valueName}" to have at least length of "${length}" (got: ${gotMessage}, where: "${where}") [E026]`);
    }
}
exports.StringLengthExpectedError = StringLengthExpectedError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFsL2Vycm9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBNEQ7QUFFNUQsa0ZBQWtGO0FBRWxGLE1BQWEsZ0JBQWlCLFNBQVEsS0FBSztJQUN6QyxZQUFZLFVBQWtCLEVBQUUsR0FBVyxFQUFFLElBQWE7UUFDeEQsS0FBSyxDQUFDLElBQUksVUFBVSxJQUFJLEdBQUcsa0NBQWtDLElBQUEsc0JBQWMsRUFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDL0YsQ0FBQztDQUNGO0FBSkQsNENBSUM7QUFFRCxNQUFhLGtCQUFtQixTQUFRLEtBQUs7SUFDM0MsWUFBWSxVQUFrQixFQUFFLEdBQVcsRUFBRSxPQUFlLEVBQUUsU0FBaUI7UUFDN0UsS0FBSyxDQUNILFdBQVcsVUFBVSxJQUFJLEdBQUcscUZBQXFGO1lBQy9HLGlDQUFpQyxPQUFPLElBQUksT0FBTyxTQUFTLEdBQUcsQ0FDbEUsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQVBELGdEQU9DO0FBRUQsTUFBYSxrQkFBbUIsU0FBUSxLQUFLO0lBQzNDLFlBQVksVUFBa0IsRUFBRSxHQUFXLEVBQUUsT0FBZSxFQUFFLFNBQWlCO1FBQzdFLEtBQUssQ0FDSCxXQUFXLFVBQVUsSUFBSSxHQUFHLHdEQUF3RDtZQUNsRix5Q0FBeUMsT0FBTyxJQUFJLE9BQU8sU0FBUyxHQUFHLENBQzFFLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUFQRCxnREFPQztBQUVELDhDQUE4QztBQUM5QyxNQUFhLHVCQUF3QixTQUFRLEtBQUs7SUFDaEQsWUFBWSxJQUFZLEVBQUUsR0FBVztRQUNuQyxLQUFLLENBQUMsSUFBSSxJQUFJLElBQUksR0FBRyw4REFBOEQseUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM1SCxDQUFDO0NBQ0Y7QUFKRCwwREFJQztBQUVELE1BQWEsaUJBQWtCLFNBQVEsU0FBUztJQUM5QyxZQUFZLEVBQVc7UUFDckIsS0FBSyxDQUFDLElBQUksSUFBQSxzQkFBYyxFQUFDLEVBQUUsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7Q0FDRjtBQUpELDhDQUlDO0FBRUQsTUFBYSxzQkFBdUIsU0FBUSxLQUFLO0lBQy9DO1FBQ0UsS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7SUFDbEQsQ0FBQztDQUNGO0FBSkQsd0RBSUM7QUFFRCxpR0FBaUc7QUFDakcsTUFBYSxvQkFBcUIsU0FBUSxLQUFLO0lBQzdDLFlBQVksUUFBaUIsRUFBRSxJQUFZLEVBQUUsR0FBVyxFQUFFLEtBQWE7UUFDckUsS0FBSyxDQUFDLElBQUksSUFBQSxzQkFBYyxFQUFDLFFBQVEsQ0FBQyxLQUFLLEtBQUsscUJBQXFCLElBQUksSUFBSSxHQUFHLFVBQVUsQ0FBQyxDQUFDO0lBQzFGLENBQUM7Q0FDRjtBQUpELG9EQUlDO0FBRUQsTUFBYSxtQkFBb0IsU0FBUSxLQUFLO0lBQzVDLFlBQVksSUFBWSxFQUFFLEdBQW9CO1FBQzVDLEtBQUssQ0FBQyxzREFBc0QsSUFBSSxJQUFJLElBQUEsc0JBQWMsRUFBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDdEcsQ0FBQztDQUNGO0FBSkQsa0RBSUM7QUFFRCxNQUFhLHdCQUF5QixTQUFRLFNBQVM7SUFDckQsWUFBWSxJQUFZLEVBQUUsR0FBVztRQUNuQyxLQUFLLENBQ0gsdUZBQXVGO1lBQ3JGLDBGQUEwRixJQUFJLElBQUksR0FBRyxXQUFXLENBQ25ILENBQUM7SUFDSixDQUFDO0NBQ0Y7QUFQRCw0REFPQztBQUVELE1BQWEsa0NBQW1DLFNBQVEsU0FBUztJQUMvRCxZQUFZLEdBQVcsRUFBRSxJQUFZLEVBQUUsR0FBVztRQUNoRCxLQUFLLENBQUMsb0RBQW9ELEdBQUcsK0JBQStCLElBQUksSUFBSSxHQUFHLFdBQVcsQ0FBQyxDQUFDO0lBQ3RILENBQUM7Q0FDRjtBQUpELGdGQUlDO0FBRUQsTUFBYSx5QkFBMEIsU0FBUSxLQUFLO0lBQ2xELFlBQVksSUFBWSxFQUFFLEdBQVc7UUFDbkMsS0FBSyxDQUFDLDJEQUEyRCxJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQztJQUMxRixDQUFDO0NBQ0Y7QUFKRCw4REFJQztBQUVELE1BQWEsa0JBQW1CLFNBQVEsU0FBUztJQUMvQyxZQUFZLEtBQWMsRUFBRSxLQUFhO1FBQ3ZDLEtBQUssQ0FBQyxhQUFhLEtBQUssMENBQTBDLElBQUEsc0JBQWMsRUFBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDdEcsQ0FBQztDQUNGO0FBSkQsZ0RBSUM7QUFFRCxNQUFhLG9DQUFxQyxTQUFRLEtBQUs7SUFDN0QsWUFBWSxZQUFvQixFQUFFLFNBQWlCLEVBQUUsS0FBYTtRQUNoRSxLQUFLLENBQUMsYUFBYSxZQUFZLGlDQUFpQyxTQUFTLDRDQUE0QyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ2hJLENBQUM7Q0FDRjtBQUpELG9GQUlDO0FBRUQsTUFBYSx5QkFBMEIsU0FBUSxTQUFTO0lBQ3RELFlBQVksTUFBYyxFQUFFLEdBQVEsRUFBRSxLQUFhLEVBQUUsU0FBaUI7UUFDcEUsaUZBQWlGO1FBQ2pGLDREQUE0RDtRQUM1RCxNQUFNLFVBQVUsR0FBRyxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLGFBQWEsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsSUFBQSxzQkFBYyxFQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFFcEgsS0FBSyxDQUFDLGFBQWEsU0FBUyxpQ0FBaUMsTUFBTSxXQUFXLFVBQVUsYUFBYSxLQUFLLFdBQVcsQ0FBQyxDQUFDO0lBQ3pILENBQUM7Q0FDRjtBQVJELDhEQVFDIn0=