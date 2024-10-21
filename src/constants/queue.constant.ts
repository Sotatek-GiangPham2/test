export const QUEUE_MAX_CONCURRENCY = 10;

export enum Queues {
  MAIL = 'Mail',
  WEBHOOK = 'Webhook',
}

export enum MailJobs {
  VERIFY_EMAIL = 'VerifyEmail',
  RESET_PASSWORD = 'ResetPassword',
  SEND_WITHDRAW_EVENT = 'SendWithdrawEvent',
}

export enum WebhookJobs {
  TRIGGER_DEPOSIT_EVENT = 'TriggerDepositEvent',
  TRIGGER_WITHDRAW_EVENT = 'TriggerWithdrawEvent',
}
