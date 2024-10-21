import { MailerService } from '@nestjs-modules/mailer';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { QUEUE_MAX_CONCURRENCY, Queues } from 'src/constants/queue.constant';

@Processor(Queues.MAIL, { concurrency: QUEUE_MAX_CONCURRENCY })
export class MailProcessor extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super();
  }
  // eslint-disable-next-line
  async process(job: Job): Promise<void> {
    const { to, subject, template, context } = job.data;
    await this.mailerService.sendMail({
      to,
      subject,
      template,
      context,
    });

    throw new Error('Method not implemented.');
  }
}
