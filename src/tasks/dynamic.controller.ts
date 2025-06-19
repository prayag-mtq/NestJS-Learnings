import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class CronJobsService {
  private readonly logger = new Logger(CronJobsService.name);

  constructor(private schedulerRegistry: SchedulerRegistry) {}

  addCronJob(name: string, second: string) {
    const job = new CronJob(`${second} * * * * *`, () => {
      this.logger.warn(`Cron ${name} triggered at ${second}s`);
    });

    this.schedulerRegistry.addCronJob(name, job);
    job.start();
  }

  addInterval(name: string, ms: number) {
    const interval = setInterval(() => {
      this.logger.warn(`Interval ${name} at ${ms}ms`);
    }, ms);

    this.schedulerRegistry.addInterval(name, interval);
  }

  addTimeout(name: string, ms: number) {
    const timeout = setTimeout(() => {
      this.logger.warn(`Timeout ${name} after ${ms}ms`);
    }, ms);

    this.schedulerRegistry.addTimeout(name, timeout);
  }
}
