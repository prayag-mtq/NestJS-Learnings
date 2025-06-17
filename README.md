# NestJS Exception Filters

NestJS provides a robust **exceptions layer** that handles all unhandled errors in a uniform, user-friendly manner. This system makes it easy to define custom behavior for different types of exceptions and HTTP responses.

---

## 📦 Built-in Global Exception Handling

By default, NestJS includes a global exception filter that handles all uncaught exceptions of type `HttpException` or its subclasses. When the exception is not recognized, NestJS returns:

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

NestJS also partially supports the [http-errors](https://www.npmjs.com/package/http-errors) library if the exception object contains `statusCode` and `message`.

---

## ⚠️ Throwing Standard Exceptions

NestJS offers the `HttpException` class (from `@nestjs/common`) for throwing exceptions in route handlers.

### Example

```ts
@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}
```

Response:

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

### Custom Response Example

```ts
throw new HttpException({
  status: HttpStatus.FORBIDDEN,
  error: 'This is a custom message',
}, HttpStatus.FORBIDDEN, {
  cause: error
});
```

Response:

```json
{
  "status": 403,
  "error": "This is a custom message"
}
```

---

## 🧩 Built-in HTTP Exceptions

Nest provides several built-in exceptions:

* `BadRequestException`
* `UnauthorizedException`
* `NotFoundException`
* `ForbiddenException`
* `ConflictException`
* `InternalServerErrorException`
* *(and more)*

### Example with description and cause

```ts
throw new BadRequestException('Something bad happened', {
  cause: new Error(),
  description: 'Some error description',
});
```

Response:

```json
{
  "message": "Something bad happened",
  "error": "Some error description",
  "statusCode": 400
}
```

---

## 🎯 Custom Exceptions

You can extend `HttpException` to create reusable custom exception classes.

### Example

```ts
export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}
```

Use it:

```ts
throw new ForbiddenException();
```

---

## 🛠 Custom Exception Filters

To gain full control over error formatting or add features like logging, create a custom filter.

### Example: `HttpExceptionFilter`

```ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

---

## 🔗 Binding Filters

### Method Scoped

```ts
@Post()
@UseFilters(HttpExceptionFilter)
async create() {
  throw new ForbiddenException();
}
```

### Controller Scoped

```ts
@Controller()
@UseFilters(HttpExceptionFilter)
export class CatsController {}
```

### Global Scoped (in `main.ts`)

```ts
const app = await NestFactory.create(AppModule);
app.useGlobalFilters(new HttpExceptionFilter());
```

### Global Scoped via Dependency Injection

```ts
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
```

---

## 🌍 Catch-All Exception Filter

To handle **any** exception:

```ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
```

---

## 🧬 Inheriting from the Base Filter

Extend `BaseExceptionFilter` if you want to build on Nest's default behavior.

```ts
@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}
```

### With `HttpAdapter` injection

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { httpAdapter } = app.get(HttpAdapterHost);

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

---

## 🧠 Notes

* Filters can be **method**, **controller**, or **global** scoped.
* Global filters via `app.useGlobalFilters()` can't use DI; use `APP_FILTER` for DI support.
* Use `@Catch()` with no arguments to handle all exception types.
* Platform-agnostic filters use `HttpAdapterHost`.

---

## 📚 Resources

* [NestJS Docs: Exception Filters](https://docs.nestjs.com/exception-filters)
* [Http Status Codes (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

---
