export const ERROR = {
  UNKNOWN_ERROR: {
    message: 'Internal server error',
    code: -1,
  },
  USER_NOT_EXIST: {
    message: 'User does not exist',
    code: 1,
  },
  WRONG_USERNAME_OR_PASSWORD: {
    message: 'Incorrect username or password',
    code: 2,
  },
  USER_EXISTED: {
    message: 'User already exists',
    code: 3,
  },
  UNAUTHORIZED: {
    message: 'Unauthorized access',
    code: 4,
  },
  FORBIDDEN: {
    message: 'Access forbidden',
    code: 5,
  },
  TOO_MANY_REQUESTS: {
    message: 'Too many requests',
    code: 6,
  },
  REFRESH_TOKEN_FAIL: {
    message: 'Failed to refresh token',
    code: 7,
  },
  REFRESH_TOKEN_EXPIRED: {
    message: 'Refresh token has expired',
    code: 8,
  },
  USER_NOT_ACTIVE: {
    message: 'User account needs to verify email',
    code: 9,
  },
  INVALID_VERIFY_TOKEN: {
    message: 'Verify token is invalid',
    code: 10,
  },
  USER_ALREADY_ACTIVE: {
    message: 'User already active',
    code: 11,
  },
  WALLET_EXIST: {
    message: 'Wallet address already exists',
    code: 12,
  },
  WEBHOOK_NOT_EXIST: {
    message: 'Webhook does not exist',
    code: 13,
  },
  WEBHOOK_EXISTED: {
    message: 'Webhook already exists',
    code: 14,
  },
  NOT_ENOUGH_WITHDRAW_BALANCE: {
    message: 'Not enough withdraw balance',
    code: 15,
  },
  CREATE_WITHDRAW_REQUEST_FAIL: {
    message: 'Failed to create withdraw request',
    code: 16,
  },
  NEW_PASSWORD_DIFFIRENT_WITH_OLD_PASSWORD: {
    message: 'The new password should not be the same as the old password',
    code: 17,
  },
  CONTRACT_PAUSED: {
    message: 'Contract paused',
    code: 18,
  },
  MINIMUM_WITHDRAWAL_MUST_GREATER_THAN_ZERO: {
    message: 'Withdrawal amount must be greater than 0',
    code: 19,
  },
  WITHDRAWAL_AMOUNT_EXCEED: (message: string) => ({
    message,
    code: 20,
  }),
  INVALID_INPUT_PARAMS: {
    message: 'Invalid input params',
    code: 21,
  },
  ADMIN_NOT_EXIST: {
    message: 'Admin does not exist',
    code: 22,
  },
  VERIFY_SIGNATURE_FAILED: {
    message: 'Verify signature failed',
    code: 23,
  },
};
