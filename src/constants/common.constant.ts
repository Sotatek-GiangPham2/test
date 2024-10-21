import BigNumber from 'bignumber.js';

export const REGEX_PASSWORD = '^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$;"\'%)(^&*{<>.,_=+/\\`[\\]\\|~}-]).{8,128}$';

export const NATIVE_TOKEN_DECIMAL = new BigNumber(10).pow(18);

export const ADMIN_ROLE = 'Admin';

export const COMMON_CONSTANT = {
  REDIS_DEFAULT_NAMESPACE: 'redisDefault',
  JWT_DECODED_REQUEST_PARAM: 'jwtDecoded',
  BCRYPT_SALT_ROUND: 10,

  RESPONSE_SUCCESS: {
    CODE: 0,
    MESSAGE: 'ok',
  },

  THROTTLER: {
    TTL: 60,
    LIMIT: 5000,
  },

  TIME: {
    DATE_TIME_FORMAT: 'YYYY-MM-DDTHH:mm:ss',
  },

  DATASOURCE: {
    DEFAULT: 'datasourceDefault',
  },
};
