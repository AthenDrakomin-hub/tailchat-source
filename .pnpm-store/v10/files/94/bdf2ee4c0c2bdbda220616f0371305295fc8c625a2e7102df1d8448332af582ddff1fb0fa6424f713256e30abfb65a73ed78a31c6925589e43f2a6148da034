"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._buildSchema = void 0;
const mongoose = require("mongoose");
const logSettings_1 = require("../logSettings");
const typegoose_1 = require("../typegoose");
const constants_1 = require("./constants");
const data_1 = require("./data");
const processProp_1 = require("./processProp");
const utils_1 = require("./utils");
/**
 * Private schema builder out of class props
 * -> If you discover this, don't use this function, use Typegoose.buildSchema!
 * @param cl The not initialized Class
 * @param sch Use a Already existing Schema as a base?
 * @param opt Options to override
 * @param isFinalSchema If it's the final schema to be built (defaults to `true`).
 * @returns Returns the Build Schema
 * @private
 */
function _buildSchema(cl, origSch, opt, isFinalSchema = true, overwriteOptions) {
    var _a, _b;
    (0, utils_1.assertionIsClass)(cl);
    (0, utils_1.assignGlobalModelOptions)(cl); // to ensure global options are applied to the current class
    // Options sanity check
    opt = (0, utils_1.mergeSchemaOptions)((0, utils_1.isNullOrUndefined)(opt) || typeof opt !== 'object' ? {} : opt, cl);
    /** used, because when trying to resolve an child, the overwriteOptions for that child are not available */
    const className = (0, utils_1.getName)(cl);
    const finalName = (0, utils_1.getName)(cl, overwriteOptions);
    logSettings_1.logger.debug('_buildSchema Called for %s with options:', finalName, opt);
    /** Simplify the usage */
    const Schema = mongoose.Schema;
    const ropt = (_a = Reflect.getMetadata(constants_1.DecoratorKeys.ModelOptions, cl)) !== null && _a !== void 0 ? _a : {};
    const schemaOptions = Object.assign({}, (_b = ropt === null || ropt === void 0 ? void 0 : ropt.schemaOptions) !== null && _b !== void 0 ? _b : {}, opt);
    const decorators = Reflect.getMetadata(constants_1.DecoratorKeys.PropCache, cl.prototype);
    if (!(0, utils_1.isNullOrUndefined)(decorators)) {
        for (const decorator of decorators.values()) {
            (0, processProp_1.processProp)(decorator);
        }
    }
    if (!data_1.schemas.has(className)) {
        data_1.schemas.set(className, {});
    }
    let sch;
    if (!(origSch instanceof Schema)) {
        sch = new Schema(data_1.schemas.get(className), schemaOptions);
    }
    else {
        sch = origSch.clone();
        sch.add(data_1.schemas.get(className));
    }
    sch.loadClass(cl);
    if (isFinalSchema) {
        /** Get Metadata for Nested Discriminators */
        const disMap = Reflect.getMetadata(constants_1.DecoratorKeys.NestedDiscriminators, cl);
        if (disMap instanceof Map) {
            for (const [key, discriminators] of disMap) {
                logSettings_1.logger.debug('Applying Nested Discriminators for:', key, discriminators);
                const path = sch.path(key);
                // REFACTOR: re-write this to be a Error inside errors.ts
                (0, utils_1.assertion)(!(0, utils_1.isNullOrUndefined)(path), () => new Error(`Path "${key}" does not exist on Schema of "${finalName}"`));
                // REFACTOR: re-write this to be a Error inside errors.ts
                (0, utils_1.assertion)(typeof path.discriminator === 'function', () => new Error(`There is no function called "discriminator" on schema-path "${key}" on Schema of "${finalName}"`));
                for (const { type: child, value: childName } of discriminators) {
                    const childSch = (0, utils_1.getName)(child) === finalName ? sch : (0, typegoose_1.buildSchema)(child);
                    const discriminatorKey = childSch.get('discriminatorKey');
                    if (!!discriminatorKey && childSch.path(discriminatorKey)) {
                        // skip this check, otherwise "extends DiscriminatorBase" would not be allowed (discriminators cannot have the discriminator key defined multiple times)
                        childSch.paths[discriminatorKey].options.$skipDiscriminatorCheck = true;
                    }
                    path.discriminator((0, utils_1.getName)(child), childSch, childName);
                }
            }
        }
        // Hooks
        {
            /** Get Metadata for PreHooks */
            const preHooks = Reflect.getMetadata(constants_1.DecoratorKeys.HooksPre, cl);
            if (Array.isArray(preHooks)) {
                preHooks.forEach((obj) => sch.pre(obj.method, obj.options, obj.func));
            }
            /** Get Metadata for PreHooks */
            const postHooks = Reflect.getMetadata(constants_1.DecoratorKeys.HooksPost, cl);
            if (Array.isArray(postHooks)) {
                postHooks.forEach((obj) => sch.post(obj.method, obj.options, obj.func));
            }
        }
        /** Get Metadata for Virtual Populates */
        const virtuals = Reflect.getMetadata(constants_1.DecoratorKeys.VirtualPopulate, cl);
        if (virtuals instanceof Map) {
            for (const [key, options] of virtuals) {
                logSettings_1.logger.debug('Applying Virtual Populates:', key, options);
                sch.virtual(key, options);
            }
        }
        /** Get Metadata for indices */
        const indices = Reflect.getMetadata(constants_1.DecoratorKeys.Index, cl);
        if (Array.isArray(indices)) {
            for (const index of indices) {
                logSettings_1.logger.debug('Applying Index:', index);
                sch.index(index.fields, index.options);
            }
        }
        /** Get Metadata for Query Methods */
        const queryMethods = Reflect.getMetadata(constants_1.DecoratorKeys.QueryMethod, cl);
        if (queryMethods instanceof Map) {
            for (const [funcName, func] of queryMethods) {
                logSettings_1.logger.debug('Applying Query Method:', funcName, func);
                sch.query[funcName] = func;
            }
        }
        /** Get Metadata for indices */
        const plugins = Reflect.getMetadata(constants_1.DecoratorKeys.Plugins, cl);
        if (Array.isArray(plugins)) {
            for (const plugin of plugins) {
                logSettings_1.logger.debug('Applying Plugin:', plugin);
                sch.plugin(plugin.mongoosePlugin, plugin.options);
            }
        }
        // this method is to get the typegoose name of the model/class if it is user-handled (like buildSchema, then manually mongoose.model)
        sch.method('typegooseName', () => {
            return finalName;
        });
    }
    // add the class to the constructors map
    data_1.constructors.set(finalName, cl);
    return sch;
}
exports._buildSchema = _buildSchema;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFsL3NjaGVtYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBcUM7QUFDckMsZ0RBQXdDO0FBQ3hDLDRDQUEyQztBQVkzQywyQ0FBNEM7QUFDNUMsaUNBQStDO0FBQy9DLCtDQUE0QztBQUM1QyxtQ0FBZ0k7QUFFaEk7Ozs7Ozs7OztHQVNHO0FBQ0gsU0FBZ0IsWUFBWSxDQUMxQixFQUFLLEVBQ0wsT0FBOEIsRUFDOUIsR0FBNEIsRUFDNUIsZ0JBQXlCLElBQUksRUFDN0IsZ0JBQWdDOztJQUVoQyxJQUFBLHdCQUFnQixFQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRXJCLElBQUEsZ0NBQXdCLEVBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyw0REFBNEQ7SUFFMUYsdUJBQXVCO0lBQ3ZCLEdBQUcsR0FBRyxJQUFBLDBCQUFrQixFQUFDLElBQUEseUJBQWlCLEVBQUMsR0FBRyxDQUFDLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUUzRiwyR0FBMkc7SUFDM0csTUFBTSxTQUFTLEdBQUcsSUFBQSxlQUFPLEVBQUMsRUFBRSxDQUFDLENBQUM7SUFDOUIsTUFBTSxTQUFTLEdBQUcsSUFBQSxlQUFPLEVBQUMsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFFaEQsb0JBQU0sQ0FBQyxLQUFLLENBQUMsMENBQTBDLEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRXpFLHlCQUF5QjtJQUN6QixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO0lBQy9CLE1BQU0sSUFBSSxHQUFrQixNQUFBLE9BQU8sQ0FBQyxXQUFXLENBQUMseUJBQWEsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLG1DQUFJLEVBQUUsQ0FBQztJQUN0RixN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