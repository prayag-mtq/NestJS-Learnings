import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Throttle({ default: { limit: 5, ttl: 10000 } })
  @SkipThrottle()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
