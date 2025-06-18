import { Controller, Get, Scope } from '@nestjs/common';
import { AppService } from './app.service';

@Controller({ path: 'users', scope: Scope.REQUEST })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
