import { HttpException,HttpStatus } from "@nestjs/common";

export class forbiddenException extends HttpException {
    constructor(){
        super('Forbidden', HttpStatus.FORBIDDEN)
    }
}