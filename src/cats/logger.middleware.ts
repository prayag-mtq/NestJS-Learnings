import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class loggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request');
    next();
  }
}



// // Functional Logger
// export function logger(req: Request, res: Response, next: NextFunction) {
//   console.log(`Request...`);
//   next();
// };

// consumer.apply(logger);
