import { Body, Controller, Get, HttpCode, UseFilters } from '@nestjs/common';
import { CatsService } from './cats.service';
import { Post } from '@nestjs/common';
import { Cat } from './interface/cat.interface';
import { HttpExceptionFilter } from 'src/common/exception/filters/http-exception.filter';

@Controller('cats')
@UseFilters(HttpExceptionFilter)

export class CatsController {
  constructor(private catService: CatsService) {}

  @Post()
  @HttpCode(200)
  async post(@Body() cat: Cat) {
    this.catService.createNewCat(cat);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catService.findAllCats();
  }
}
