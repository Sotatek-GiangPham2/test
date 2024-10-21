import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { COMMON_CONSTANT } from 'src/constants/common.constant';
import type { EWebhookEvent } from 'src/constants/enum.constant';
import { ERROR } from 'src/constants/exception.constant';
import { Queues } from 'src/constants/queue.constant';
import { WebhookLogEntity } from 'src/entities/webhook-log.entity';
import { WebhookEntity } from 'src/entities/webhook.entity';
import type { AddWebhookDto } from 'src/modules/webhook/dto/webhook.request';
import { BaseException } from 'src/shared/filters/exception.filter';
import type { DeleteResult } from 'typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class WebhookService {
  constructor(
    @InjectQueue(Queues.WEBHOOK)
    private readonly webhookQueue: Queue,
    @InjectRepository(WebhookEntity, COMMON_CONSTANT.DATASOURCE.DEFAULT)
    private readonly webhookRepository: Repository<WebhookEntity>,
    @InjectRepository(WebhookLogEntity, COMMON_CONSTANT.DATASOURCE.DEFAULT)
    private readonly webhookLogRepository: Repository<WebhookLogEntity>,
  ) {}

  // eslint-disable-next-line
  public async publishEvent(event: EWebhookEvent, data: any): Promise<void> {
    const webhooks = await this.webhookRepository.find();

    const logs = webhooks.map(async (webhook) => {
      const webhookLog = await this.webhookLogRepository.save({
        webhookId: webhook.id,
        data: JSON.stringify(data),
      });

      await this.webhookQueue.add(event, {
        url: webhook.url,
        webhookLogId: webhookLog.id,
        data,
      });
    });

    await Promise.all(logs);
  }

  private async findWebhookById(id: number): Promise<WebhookEntity> {
    const webhook = await this.webhookRepository.findOne({ where: { id } });

    if (!webhook) {
      throw new BaseException(ERROR.WEBHOOK_NOT_EXIST);
    }

    return webhook;
  }

  private async checkExistingWebhook(name: string, url: string): Promise<void> {
    const existingWebhook = await this.webhookRepository.findOne({ where: { name, url } });

    if (existingWebhook) {
      throw new BaseException(ERROR.WEBHOOK_EXISTED);
    }
  }

  async create(webhook: AddWebhookDto): Promise<WebhookEntity> {
    await this.checkExistingWebhook(webhook.name, webhook.url);

    return this.webhookRepository.save(webhook);
  }

  async findAll(): Promise<WebhookEntity[]> {
    return this.webhookRepository.find();
  }

  async findOne(id: number): Promise<WebhookEntity> {
    return this.findWebhookById(id);
  }

  async update(id: number, webhook: AddWebhookDto): Promise<WebhookEntity> {
    await this.findWebhookById(id);
    await this.webhookRepository.update(id, webhook);

    return this.webhookRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<DeleteResult> {
    await this.findWebhookById(id);

    return this.webhookRepository.delete(id);
  }
}
