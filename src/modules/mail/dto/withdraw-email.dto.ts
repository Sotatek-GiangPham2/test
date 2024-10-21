export class MailWithdrawDto {
  to: string;

  email: string;

  amount: string;

  date?: string;

  withdrawAddress: string;

  txHash: string;
}
