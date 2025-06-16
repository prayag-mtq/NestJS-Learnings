import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  Header,
  Redirect,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

class CreateChatDto {
  message: string;
  sender: string;
}

class UpdateChatDto {
  message?: string;
  sender?: string;
}

@Controller('/api/chats')
export class ChatController {
  // Basic GET
  @Get()
  getAll(): string {
    return 'This will return all chats';
  }

  // With Query Parameters
  @Get('filter')
  filterChats(@Query('sender') sender: string): string {
    return `Filtering chats by sender: ${sender}`;
  }

  // GET with Wildcard
  @Get('wildcard/*')
  wildcard(): string {
    return 'Matched /api/chats/wildcard/* route';
  }

  // GET with Redirect
  @Get('docs')
  @Redirect('https://docs.nestjs.com', 302)
  getDocs() {}

  // GET with Redirect (Dynamic)
  @Get('help')
  @Redirect()
  getHelp(@Query('lang') lang: string) {
    if (lang === 'fr') {
      return { url: 'https://docs.nestjs.com/fr/' };
    }
    return { url: 'https://docs.nestjs.com' };
  }

  // GET with Header
  @Get('with-header')
  @Header('Cache-Control', 'no-cache')
  withHeader(): string {
    return 'This response has a custom header';
  }



  // PUT with DTO and Param
  @Put(':id')
  @HttpCode(200)
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto): string {
    return `Chat ${id} updated with: ${JSON.stringify(updateChatDto)}`;
  }

  // DELETE with Param
  @Delete(':id')
  @HttpCode(200)
  delete(@Param('id') id: string): string {
    return `This will delete the chat with ID: ${id}`;
  }

  // Access raw Express request
  @Get('raw-request')
  getRaw(@Req() req: Request): string {
    return `Request from IP: ${req.ip}`;
  }

  // Use native response
  @Get('native-res')
  nativeRes(@Res() res: Response) {
    res.status(200).json({ message: 'Direct Express response' });
  }

  // Use response passthrough with return
  @Get('passthrough')
  passthrough(@Res({ passthrough: true }) res: Response) {
    res.setHeader('X-Custom-Header', 'NestRocks');
    return 'Using response passthrough';
  }

    // POST with DTO
  @Post('/all-posts')
  @HttpCode(201)
  createPostsWithDTO(@Body() createChatDto: CreateChatDto): string {
    return `Chat created with message: ${createChatDto.message}`;
  }

  @Post('/post')
  createPostsWithoutDTO(
    @Body() body : {name : string, age: number, isEligible : boolean}, 
    @Res() res : Response
  ){
    res.status(HttpStatus.CREATED).send();
    return "This is the response"
  }
}
