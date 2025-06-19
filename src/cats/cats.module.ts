import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { loggerMiddleware } from './logger.middleware';
import { Cat, CatSchema } from './db/cat.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Cat.name,
        schema: CatSchema,  
      },
    ]),
  ],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatModule {}
