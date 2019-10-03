type InternalError = {
  message: string;
  internalCode: string;
};

const setInternalError = (message: string, internalCode: string): InternalError => ({
  message,
  internalCode
});

export const EXTERNAL_ERROR = 'external_error';
export const externalError = (message: string): InternalError => setInternalError(message, EXTERNAL_ERROR);

export const DEFAULT_ERROR = 'default_error';
export const defaultError = (message: string): InternalError => setInternalError(message, DEFAULT_ERROR);

export const NOT_FOUND = 'not_found';
export const notFound = (message: string): InternalError => setInternalError(message, NOT_FOUND);
