import { QueryParamConfigMap, EncodedValueMap, ToBeEncodedValueMap } from './types';
/**
 * Convert the values in query to strings via the encode functions configured
 * in paramConfigMap
 *
 * @param paramConfigMap Map from query name to { encode, decode } config
 * @param query Map from query name to value to be encoded
 */
export declare function encodeQueryParams<QPCMap extends QueryParamConfigMap>(paramConfigMap: QPCMap, query: Partial<ToBeEncodedValueMap<QPCMap>>): Partial<EncodedValueMap<QPCMap>>;
export default encodeQueryParams;
