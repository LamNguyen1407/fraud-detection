import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { Kafka, Producer } from 'kafkajs';
import { genTransaction } from 'src/utils/generate-transaction.util';

dotenv.config();

const BROKER = process.env.KAFKA_BROKER || 'localhost:9094';
const TOPIC = process.env.KAFKA_TOPIC || 'transactions.raw';
const GEN_RATE = Number(process.env.KAFKA_GEN_RATE) || 50;

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private producing = false;
  private intervalRef: NodeJS.Timeout | null = null;
  private isSending = false;

  constructor() {
    this.kafka = new Kafka({ brokers: [BROKER] });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    console.log('Kafka producer connected to', BROKER);
  }

  async onModuleDestroy() {
    await this.stop();
    await this.producer.disconnect();
    console.log('Kafka producer disconnected from', BROKER);
  }

  async start(rate = GEN_RATE) {
    if (this.producing) return;
    this.producing = true;

    const INTERVAL_MS = 100;
    const batchSize = Math.max(1, Math.floor((rate * INTERVAL_MS) / 1000));

    console.log(
      `🚀 Start producing ~${rate} msgs/s (≈ ${batchSize} msgs every ${INTERVAL_MS}ms) to topic ${TOPIC}`
    );

    this.intervalRef = setInterval(async () => {
      // Nếu lần gửi trước vẫn chưa hoàn tất, bỏ qua chu kỳ này để tránh backlog
      if (this.isSending) {
        console.warn('Previous batch still sending — skipping this interval');
        return;
      }

      this.isSending = true;
      try {
        const messages = Array.from({ length: batchSize }, () => {
          const msg = genTransaction();
          return { key: msg.cc_num, value: JSON.stringify(msg) };
        });

        await this.producer.send({
          topic: TOPIC,
          messages,
        });

        console.log(`✅ Sent ${messages.length} messages`);
      } catch (err) {
        console.error('❌ Error sending messages', err);
      } finally {
        this.isSending = false;
      }
    }, INTERVAL_MS);
  }

  async stop() {
    if (!this.producing) return;
    this.producing = false;
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
    console.log('Stopped producing messages');
  }
}
