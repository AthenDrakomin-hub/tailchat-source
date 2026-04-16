function encodeQueryParams(paramConfigMap, query) {
  const encodedQuery = {};
  const paramNames = Object.keys(query);
  for (const paramName of paramNames) {
    const valueToBeEncoded = query[paramName];
    if (!paramConfigMap[paramName]) {
      encodedQuery[paramName] = valueToBeEncoded == null ? valueToBeEncoded : String(valueToBeEncoded);
    } else {
      encodedQuery[paramName] = paramConfigMap[paramName].encode(query[paramName]);
    }
  }
  return encodedQuery;
}
var encodeQueryParams_default = encodeQueryParams;
export {
  encodeQueryParams_default as default,
  encodeQueryParams
};
//# sourceMappingURL=encodeQueryParams.js.map
