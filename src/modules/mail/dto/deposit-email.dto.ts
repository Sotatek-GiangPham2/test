export class MailDepositDto {
  to: string;

  email: string;

  amount: number;

  date?: string;

  withdrawAddress: string;

  txHash: string;

  balance: number;
}
