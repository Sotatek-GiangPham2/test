import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import type { Job } from 'bullmq';
import { COMMON_CONSTANT } from 'src/constants/common.constant';
import { EWebhookEvent, EWebhookLogStatus } from 'src/constants/enum.constant';
import { QUEUE_MAX_CONCURRENCY, Queues } from 'src/constants/queue.constant';
import { WebhookLogEntity } from 'src/entities/webhook-log.entity';
import type { WebhookEvent } from 'src/modules/webhook/dto/webhook-event';
import { Repository } from 'typeorm';

@Processor(Queues.WEBHOOK, { concurrency: QUEUE_MAX_CONCURRENCY })
export class WebhookProcessor extends WorkerHost {
  constructor(
    @InjectRepository(WebhookLogEntity, COMMON_CONSTANT.DATASOURCE.DEFAULT)
    private readonly webhookLogRepository: Repository<WebhookLogEntity>,
  ) {
    super();
  }
  // eslint-disable-next-line
  async process(job: Job): Promise<any> {
    switch (job.name) {
      case EWebhookEvent.DEPOSIT:
        await this.handleDepositEvent(job);
        break;
      case EWebhookEvent.WITHDRAW:
        await this.handleWithdrawEvent(job);
        break;
      default:
        break;
    }
  }

  async handleDepositEvent(job: Job<WebhookEvent>): Promise<void> {
    let errorMessage = null;
    let webhookLogStatus = null;

    try {
      await axios.post(job.data.url, {
        ...job.data.data,
        event: EWebhookEvent.DEPOSIT,
      });
      webhookLogStatus = EWebhookLogStatus.SUCCESS;
    } catch (error) {
      errorMessage = error?.message;
      webhookLogStatus = EWebhookLogStatus.FAILED;
    }

    await this.webhookLogRepository.update(job.data.webhookLogId, {
      status: webhookLogStatus,
      errorMessage,
    });
  }

  async handleWithdrawEvent(job: Job<WebhookEvent>): Promise<void> {
    let errorMessage = null;
    let webhookLogStatus = null;

    try {
      await axios.post(job.data.url, {
        ...job.data.data,
        event: EWebhookEvent.WITHDRAW,
      });
      webhookLogStatus = EWebhookLogStatus.SUCCESS;
    } catch (error) {
      errorMessage = error?.message;
      webhookLogStatus = EWebhookLogStatus.FAILED;
    }

    await this.webhookLogRepository.update(job.data.webhookLogId, {
      status: webhookLogStatus,
      errorMessage,
    });
  }
}
