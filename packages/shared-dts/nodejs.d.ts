declare global {
  namespace NodeJS {
    interface ProcessEnv {
      INCLUDE_OPENAPI_EXAMPLES?: 'true';
    }
  }
}

export {};
