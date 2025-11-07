import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

import { HTTPException, HTTPExceptionOptions } from '../../src/HTTPException';

beforeEach(() => {
  vi.spyOn(Response, 'json').mockImplementation((body, init) => {
    return {
      status: init?.status ?? 200,
      body: body,
    } as unknown as Response;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('HTTPException', () => {
  test('should correctly assign properties with a custom message and cause', () => {
    const errorCause = new Error('Database connection failed');
    const options: HTTPExceptionOptions = {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'A critical error occurred',
      cause: errorCause,
    };

    const httpException = new HTTPException(options);

    // Check properties
    expect(httpException.status).toBe(500);
    expect(httpException.code).toBe('INTERNAL_SERVER_ERROR');
    expect(httpException.message).toBe('A critical error occurred');
    expect(httpException.cause).toBe(errorCause);

    // Check inheritance
    expect(httpException).toBeInstanceOf(Error);
    expect(httpException).toBeInstanceOf(HTTPException);
  });

  test('should create a default message from the code if no message is provided', () => {
    const options: HTTPExceptionOptions = {
      status: 404,
      code: 'NOT_FOUND',
      // No message or cause provided
    };

    const httpException = new HTTPException(options);

    expect(httpException.status).toBe(404);
    expect(httpException.code).toBe('NOT_FOUND');

    // Check the default message logic: code.toLowerCase()
    expect(httpException.message).toBe('not_found');
    expect(httpException.cause).toBeUndefined();
  });

  test('should generate a correct Response object via toResponse()', () => {
    const options: HTTPExceptionOptions = {
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Auth token is missing or invalid',
    };

    const httpException = new HTTPException(options);

    // Call the method
    const response = httpException.toResponse();

    // Check what Response.json was called with
    expect(Response.json).toHaveBeenCalledTimes(1);
    expect(Response.json).toHaveBeenCalledWith(
      // 1. The body
      {
        code: 'UNAUTHORIZED',
        message: 'Auth token is missing or invalid',
        cause: undefined,
      },
      // 2. The init object
      {
        status: 401,
      },
    );

    // Check the returned "Response" (based on our mock)
    expect(response.status).toBe(401);
  });

  test('should include the cause in the toResponse() JSON body if it exists', () => {
    const errorCause = { reason: 'invalid_scope' };
    const options: HTTPExceptionOptions = {
      status: 403,
      code: 'FORBIDDEN',
      cause: errorCause,
    };

    const httpException = new HTTPException(options);

    // Call the method
    httpException.toResponse();

    // Check that the body argument contains the cause
    expect(Response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        cause: errorCause,
      }),
      expect.objectContaining({
        status: 403,
      }),
    );
  });
});
