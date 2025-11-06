import { Body, Controller, Post } from '@nestjs/common';
import { KafkaService } from './kafka.service';

@Controller('kafka')
export class KafkaController {
  constructor(private readonly kafkaService: KafkaService) {}

  @Post('start')
  async start(@Body() body: {rate?: number}) {
    const rate = body?.rate;
    await this.kafkaService.start(rate);
    return {
      status: 'started',
      rate: rate || undefined
    }
  }

  @Post('stop')
  async stop(){
    await this.kafkaService.stop();
    return {
      status: 'stopped'
    }
  }
}
