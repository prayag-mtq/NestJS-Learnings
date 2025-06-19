import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CatsService } from './cats.service';

@Injectable()
export class CommonService {
  constructor(
    @Inject(forwardRef(() => CatsService))
    private catsService: CatsService,
  ) {}
}
