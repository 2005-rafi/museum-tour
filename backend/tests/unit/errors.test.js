const { AppError, ErrorCodes, createError } = require('../../src/utils/errors');

describe('Error System', () => {
  test('AppError has correct properties', () => {
    const err = new AppError('Test error', 400, 'E400_TEST');
    expect(err.message).toBe('Test error');
    expect(err.statusCode).toBe(400);
    expect(err.errorCode).toBe('E400_TEST');
    expect(err.isOperational).toBe(true);
    expect(err.traceId).toBeTruthy();
    expect(err.timestamp).toBeTruthy();
    expect(err).toBeInstanceOf(Error);
  });

  test('createError produces AppError from error code definition', () => {
    const err = createError(ErrorCodes.USER_NOT_FOUND, 'User 123 not found');
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(404);
    expect(err.errorCode).toBe('E404_USER_NOT_FOUND');
    expect(err.message).toBe('User 123 not found');
  });

  test('createError uses code as default message', () => {
    const err = createError(ErrorCodes.AUTH_REQUIRED);
    expect(err.message).toBe('E401_AUTH_REQUIRED');
  });

  test('all error codes have valid structure', () => {
    Object.entries(ErrorCodes).forEach(([name, def]) => {
      expect(def).toHaveProperty('code');
      expect(def).toHaveProperty('status');
      expect(typeof def.code).toBe('string');
      expect(typeof def.status).toBe('number');
      expect(def.status).toBeGreaterThanOrEqual(400);
      expect(def.status).toBeLessThanOrEqual(599);
    });
  });
});
