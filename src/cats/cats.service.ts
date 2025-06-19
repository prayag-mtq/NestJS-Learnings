import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { CatInterface } from 'src/interface/cat.interface';
import { CommonService } from './../circular-services/common.service';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class CatsService implements OnModuleInit {
  private common: CommonService;
  constructor(private moduleRef: ModuleRef) {}
  onModuleInit() {
    this.common = this.moduleRef.get(CommonService, {
      strict: false,
    });
  }
}
