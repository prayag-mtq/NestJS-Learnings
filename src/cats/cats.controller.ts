import { Body, Controller,Post, UseGuards, Get, HttpCode, UseFilters } from '@nestjs/common';
import { CatsService } from './cats.service';
import { Cat } from '../interface/cat.interface';
import { HttpExceptionFilter } from 'src/common/exception/filters/http-exception.filter';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('cats')
@UseGuards(RolesGuard)
@UseFilters(HttpExceptionFilter)
export class CatsController {

  constructor(private catService: CatsService) {}
  
  @Post()
  @Roles('admin')
  @HttpCode(200)
  async post(@Body() cat: Cat) {
    this.catService.createNewCat(cat);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catService.findAllCats();
  }
}