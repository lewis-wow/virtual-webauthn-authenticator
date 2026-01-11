import type { ValueOfEnum } from '@repo/types';

export const HttpStatusCode = {
  // 1xx Informational responses
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/100 */
  CONTINUE_100: 100,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/101 */
  SWITCHING_PROTOCOLS_101: 101,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/102 */
  PROCESSING_102: 102,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/103 */
  EARLY_HINTS_103: 103,

  // 2xx Success
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200 */
  OK_200: 200,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201 */
  CREATED_201: 201,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/202 */
  ACCEPTED_202: 202,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/203 */
  NON_AUTHORITATIVE_INFORMATION_203: 203,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/204 */
  NO_CONTENT_204: 204,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/205 */
  RESET_CONTENT_205: 205,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/206 */
  PARTIAL_CONTENT_206: 206,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/207 */
  MULTI_STATUS_207: 207,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/208 */
  ALREADY_REPORTED_208: 208,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/226 */
  IM_USED_226: 226,

  // 3xx Redirection
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/300 */
  MULTIPLE_CHOICES_300: 300,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301 */
  MOVED_PERMANENTLY_301: 301,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/302 */
  FOUND_302: 302,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/303 */
  SEE_OTHER_303: 303,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/304 */
  NOT_MODIFIED_304: 304,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/305 */
  USE_PROXY_305: 305,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/307 */
  TEMPORARY_REDIRECT_307: 307,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/308 */
  PERMANENT_REDIRECT_308: 308,

  // 4xx Client errors
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400 */
  BAD_REQUEST_400: 400,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401 */
  UNAUTHORIZED_401: 401,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/402 */
  PAYMENT_REQUIRED_402: 402,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403 */
  FORBIDDEN_403: 403,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404 */
  NOT_FOUND_404: 404,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/405 */
  METHOD_NOT_ALLOWED_405: 405,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/406 */
  NOT_ACCEPTABLE_406: 406,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/407 */
  PROXY_AUTHENTICATION_REQUIRED_407: 407,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408 */
  REQUEST_TIMEOUT_408: 408,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/409 */
  CONFLICT_409: 409,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/410 */
  GONE_410: 410,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/411 */
  LENGTH_REQUIRED_411: 411,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/412 */
  PRECONDITION_FAILED_412: 412,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/413 */
  PAYLOAD_TOO_LARGE_413: 413,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/414 */
  URI_TOO_LONG_414: 414,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/415 */
  UNSUPPORTED_MEDIA_TYPE_415: 415,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/416 */
  RANGE_NOT_SATISFIABLE_416: 416,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/417 */
  EXPECTATION_FAILED_417: 417,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/418 */
  IM_A_TEAPOT_418: 418,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/421 */
  MISDIRECTED_REQUEST_421: 421,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/422 */
  UNPROCESSABLE_ENTITY_422: 422,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/423 */
  LOCKED_423: 423,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/424 */
  FAILED_DEPENDENCY_424: 424,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/425 */
  TOO_EARLY_425: 425,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/426 */
  UPGRADE_REQUIRED_426: 426,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/428 */
  PRECONDITION_REQUIRED_428: 428,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429 */
  TOO_MANY_REQUESTS_429: 429,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/431 */
  REQUEST_HEADER_FIELDS_TOO_LARGE_431: 431,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/451 */
  UNAVAILABLE_FOR_LEGAL_REASONS_451: 451,

  // 5xx Server errors
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500 */
  INTERNAL_SERVER_ERROR_500: 500,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/501 */
  NOT_IMPLEMENTED_501: 501,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/502 */
  BAD_GATEWAY_502: 502,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/503 */
  SERVICE_UNAVAILABLE_503: 503,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/504 */
  GATEWAY_TIMEOUT_504: 504,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/505 */
  HTTP_VERSION_NOT_SUPPORTED_505: 505,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/506 */
  VARIANT_ALSO_NEGOTIATES_506: 506,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/507 */
  INSUFFICIENT_STORAGE_507: 507,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/508 */
  LOOP_DETECTED_508: 508,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/510 */
  NOT_EXTENDED_510: 510,
  /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/511 */
  NETWORK_AUTHENTICATION_REQUIRED_511: 511,
} as const;

export type HttpStatusCode = ValueOfEnum<typeof HttpStatusCode>;
