import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { WebhookEntity } from 'src/entities/webhook.entity';
import { AddWebhookDto } from 'src/modules/webhook/dto/webhook.request';
import { WebhookService } from 'src/modules/webhook/webhook.service';
import { type DeleteResult } from 'typeorm';

@Controller('webhook')
@ApiTags('webhook')
@ApiBearerAuth()
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  create(@Body() webhook: AddWebhookDto): Promise<WebhookEntity> {
    return this.webhookService.create(webhook);
  }

  @Get()
  findAll(): Promise<WebhookEntity[]> {
    return this.webhookService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<WebhookEntity> {
    return this.webhookService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() webhook: AddWebhookDto): Promise<WebhookEntity> {
    return this.webhookService.update(id, webhook);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<DeleteResult> {
    return this.webhookService.delete(id);
  }
}
