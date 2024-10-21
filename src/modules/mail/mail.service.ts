import type { MailDepositDto } from './dto/deposit-email.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import moment from 'moment';
import { Queues } from 'src/constants/queue.constant';
import type { MailVerifyDto } from 'src/modules/mail/dto/verify-email.dto';
import type { MailWithdrawDto } from 'src/modules/mail/dto/withdraw-email.dto';

@Injectable()
export class MailService {
  private readonly dateFormat = 'YYYY-MM-DD HH:mm:ss(UTC)';

  private readonly emailConfigs = {
    verifyEmail: {
      subject: '[Copute] Verify Your Account',
      template: 'verify-email',
    },
    recoverPassword: {
      subject: '[Copute] Password Reset Request',
      template: 'recover-password',
    },
    withdrawSuccess: {
      subject: '[Copute] Withdrawal Successful',
      template: 'withdraw-event',
    },
    depositSuccess: {
      subject: '[Copute] Deposit Successful',
      template: 'deposit-event',
    },
  };

  constructor(
    @InjectQueue(Queues.MAIL)
    private readonly mailQueue: Queue,
  ) {}

  // eslint-disable-next-line
  private async sendMail(to: string, data: any, emailType: keyof typeof this.emailConfigs) {
    const date = moment.utc(new Date()).format(this.dateFormat);
    data = { date, ...data };

    await this.mailQueue.add('sentMail', {
      to,
      subject: this.emailConfigs[emailType].subject,
      template: this.emailConfigs[emailType].template,
      context: data,
    });
  }

  async verifyEmail(to: string, data: MailVerifyDto) {
    await this.sendMail(to, data, 'verifyEmail');
  }

  async resetPassword(to: string, data: MailVerifyDto) {
    await this.sendMail(to, data, 'recoverPassword');
  }

  async sendWithdrawEventEmail(to: string, data: MailWithdrawDto) {
    await this.sendMail(to, data, 'withdrawSuccess');
  }

  async sendDepositEventEmail(to: string, data: MailDepositDto) {
    await this.sendMail(to, data, 'depositSuccess');
  }
}
