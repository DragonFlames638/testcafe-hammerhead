import { XHR_REQUEST_MARKER_HEADER, XHR_CORS_SUPPORTED_FLAG, XHR_WITH_CREDENTIALS_FLAG } from '../const';

// NOTE: https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
export function check (ctx) {
    var reqOrigin = ctx.dest.reqOrigin;

    // PASSED: Same origin
    if (ctx.dest.domain === reqOrigin)
        return true;

    // Ok, we have a cross-origin request
    var xhrHeader     = ctx.req.headers[XHR_REQUEST_MARKER_HEADER];
    var corsSupported = !!(xhrHeader & XHR_CORS_SUPPORTED_FLAG);

    // FAILED: CORS not supported
    if (!corsSupported)
        return false;

    // PASSED: we have a "preflight" request
    if (ctx.req.method === 'OPTIONS')
        return true;

    var withCredentials        = xhrHeader & XHR_WITH_CREDENTIALS_FLAG;
    var allowOriginHeader      = ctx.destRes.headers['access-control-allow-origin'];
    var allowCredentialsHeader = ctx.destRes.headers['access-control-allow-credentials'];
    var allowCredentials       = String(allowCredentialsHeader).toLowerCase() === 'true';
    var allowedOrigins         = Array.isArray(allowOriginHeader) ? allowOriginHeader : [allowOriginHeader];
    var wildcardAllowed        = allowedOrigins.indexOf('*') > -1;

    // FAILED: Credentialed requests are not allowed or wild carding was used
    // for the allowed origin (credentialed requests should specify exact domain).
    if (withCredentials && (!allowCredentials || wildcardAllowed))
        return false;

    // FINAL CHECK: request origin should match one of the allowed origins
    return wildcardAllowed || allowedOrigins.indexOf(reqOrigin) > -1;
}
