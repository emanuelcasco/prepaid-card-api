type ENV_VAR = string | number | undefined;

export interface ICacheConfig {
  namespace: string;
  key: string;
  ttl: number;
}

export interface IConfig {
  environment: string;
  common: {
    api: {
      bodySizeLimit?: ENV_VAR;
      parameterLimit?: ENV_VAR;
      port: ENV_VAR;
    };
  };
  balance: {
    baseURL: ENV_VAR;
    cache: ICacheConfig;
  };
  currency: {
    baseURL: ENV_VAR;
    apiKey: ENV_VAR;
    cache: ICacheConfig;
  };
  redis: {
    baseURL: ENV_VAR;
  };
}
