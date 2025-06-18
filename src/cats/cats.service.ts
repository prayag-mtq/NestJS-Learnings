import { Injectable } from '@nestjs/common';
import { Cat } from '../interface/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  createNewCat(cat: Cat) {
    this.cats.push(cat);
  }

  findAllCats(): Cat[] {
    return this.cats;
  }
}
