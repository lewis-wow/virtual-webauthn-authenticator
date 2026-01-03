export class RequestLogFormatter {
  static logRequestInfo(opts: { request: Request }) {
    const { request } = opts;

    return {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
    };
  }

  static logResponseInfo(opts: { request: Request; response: Response }) {
    const { request, response } = opts;

    return {
      url: request.url,
      method: request.method,

      headers: Object.fromEntries(response.headers.entries()),
    };
  }
}
