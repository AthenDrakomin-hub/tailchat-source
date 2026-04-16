(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.QueryAsyncStoragePersister = {}));
})(this, (function (exports) { 'use strict';

  const noop$1 = () => {
    /* do nothing */
  };

  function asyncThrottle(func, {
    interval = 1000,
    onError = noop$1
  } = {}) {
    if (typeof func !== 'function') throw new Error('argument is not function.');
    let running = false;
    let lastTime = 0;
    let timeout;
    let currentArgs = null;

    const execFunc = async () => {
      if (currentArgs) {
        const args = currentArgs;
        currentArgs = null;

        try {
          running = true;
          await func(...args);
        } catch (error) {
          onError(error);
        } finally {
          lastTime = Date.now(); // this line must after 'func' executed to avoid two 'func' running in concurrent.

          running = false;
        }
      }
    };

    const delayFunc = async () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (running) {
          delayFunc(); // Will come here when 'func' execution time is greater than the interval.
        } else {
          execFunc();
        }
      }, interval);
    };

    return (...args) => {
      currentArgs = args;
      const tooSoon = Date.now() - lastTime < interval;

      if (running || tooSoon) {
        delayFunc();
      } else {
        execFunc();
      }
    };
  }

  const createAsyncStoragePersister = ({
    storage,
    key = "REACT_QUERY_OFFLINE_CACHE",
    throttleTime = 1000,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    retry
  }) => {
    if (storage) {
      const trySave = async persistedClient => {
        try {
          await storage.setItem(key, serialize(persistedClient));
          return;
        } catch (error) {
          return error;
        }
      };

      return {
        persistClient: asyncThrottle(async persistedClient => {
          let client = persistedClient;
          let error = await trySave(client);
          let errorCount = 0;

          while (error && client) {
            errorCount++;
            client = await (retry == null ? void 0 : retry({
              persistedClient: client,
              error,
              errorCount
            }));

            if (client) {
              error = await trySave(client);
            }
          }
        }, {
          interval: throttleTime
        }),
        restoreClient: async () => {
          const cacheString = await storage.getItem(key);

          if (!cacheString) {
            return;
          }

          return deserialize(cacheString);
        },
        removeClient: () => storage.removeItem(key)
      };
    }

    return {
      persistClient: noop,
      restoreClient: () => Promise.resolve(undefined),
      removeClient: noop
    };
  }; // eslint-disable-next-line @typescript-eslint/no-empty-function

  function noop() {}

  exports.createAsyncStoragePersister = createAsyncStoragePersister;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.development.js.map
