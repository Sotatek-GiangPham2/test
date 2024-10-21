export enum ERole {
  OWNER = 'Owner',
  RENTER = 'Renter',
  VALIDATOR_OWNER = 'ValidatorOwner',
  VALIDATOR_STAKER = 'ValidatorStaker',
}

export enum EUserStatus {
  PENDING = 'Pending',
  ACTIVE = 'Active',
  DISABLED = 'Disabled',
}

export enum EEmailType {
  VERIFY_EMAIL = 'VerifyEmail',
  RESET_PASSWORD = 'ResetPassword',
}

export enum EEventType {
  DEPOSIT = 'Deposit',
  WITHDRAW = 'Withdraw',
  BURN_RATE_CHANGE = 'BurnRateChange',
  STAKING_RATE_CHANGE = 'StakingRateChange',
  STAKING_WALLET_CHANGE = 'StakingWalletChange',
  SET_PAUSE = 'ContractSetPause',
  MINIMUM_WITHDRAWAL_CHANGE = 'MinimumWithdrawChange',
  MAXIMUM_WITHDRAWAL_CHANGE = 'MaximumWithdrawChange',
  FEE_WALLET_CHANGE = 'FeeWalletChange',
  FEE_RATE_CHANGE = 'FeeRateChange',
}

export enum ETransactionStatus {
  PENDING = 'Pending',
  SUCCESS = 'Success',
  FAILED = 'Failed',
  EXPIRED = 'Expired',
}

export enum ESystemSetting {
  BURN_RATE_CHANGE = 'BurnRateChange',
  STAKING_RATE_CHANGE = 'StakingRateChange',
  STAKING_WALLET_CHANGE = 'StakingWalletChange',
  SET_PAUSE = 'ContractSetPause',
  MINIMUM_WITHDRAWAL_CHANGE = 'MinimumWithdrawChange',
  MAXIMUM_WITHDRAWAL_CHANGE = 'MaximumWithdrawChange',
  FEE_WALLET_CHANGE = 'FeeWalletChange',
  FEE_RATE_CHANGE = 'FeeRateChange',
}

export enum EWebhookLogStatus {
  PENDING = 'Pending',
  SUCCESS = 'Success',
  FAILED = 'Failed',
}

export enum EWebhookEvent {
  DEPOSIT = 'Deposit',
  WITHDRAW = 'Withdraw',
}
