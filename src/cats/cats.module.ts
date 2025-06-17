import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { loggerMiddleware } from './logger.middleware';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(loggerMiddleware)
      .forRoutes(
        { path: 'cats', method: RequestMethod.GET },
        { path: 'cats', method: RequestMethod.POST },
        { path: 'dogs', method: RequestMethod.GET },
      );

    // // Wildcard Routing
    // consumer
    //   .apply(loggerMiddleware)
    //   .forRoutes({ path: 'cats/*', method: RequestMethod.ALL });

    // Multiple Middleware
    
    // consumer.apply(cors(), helmet(), logger).forRoutes(CatsController);

  }
}
