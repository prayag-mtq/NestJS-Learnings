# Middleware in NestJS

## What is Middleware?

Middleware is a function that is invoked **before** the route handler. It has access to the request (`req`) and response (`res`) objects, and to the `next()` function that passes control to the next middleware.

### Key Capabilities
- Execute any code.
- Modify request and response objects.
- End the request-response cycle.
- Call the next middleware in the stack.

> ❗ If `next()` is not called and the response is not sent, the request will hang.

---

## Applying Middleware

Unlike other components, middleware is **not declared in `@Module()`**. Instead, it is set up using the `configure()` method in a class implementing `NestModule`.

```ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('cats');
  }
}
````

---

## Restricting by Method

```ts
import { RequestMethod } from '@nestjs/common';

consumer
  .apply(LoggerMiddleware)
  .forRoutes({ path: 'cats', method: RequestMethod.GET });
```

---

## Wildcard Routes

Supports patterns:

```ts
consumer
  .apply(LoggerMiddleware)
  .forRoutes({ path: 'abcd/*splat', method: RequestMethod.ALL });
```

Or with optional wildcards:

```ts
consumer
  .apply(LoggerMiddleware)
  .forRoutes({ path: 'abcd/{*splat}', method: RequestMethod.ALL });
```

---

## MiddlewareConsumer API

Supports:

* Single or multiple strings
* RouteInfo objects
* Controller classes

Example:

```ts
consumer
  .apply(LoggerMiddleware)
  .forRoutes(CatsController);
```

---

## Excluding Routes

```ts
consumer
  .apply(LoggerMiddleware)
  .exclude(
    { path: 'cats', method: RequestMethod.GET },
    { path: 'cats', method: RequestMethod.POST },
    'cats/{*splat}',
  )
  .forRoutes(CatsController);
```

---

## Functional Middleware

Instead of a class, you can define middleware as a function:

```ts
// logger.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log('Request...');
  next();
}
```

Then apply:

```ts
consumer
  .apply(logger)
  .forRoutes(CatsController);
```

> ✅ Use functional middleware when no dependencies are required.

---

## Multiple Middleware

```ts
consumer
  .apply(cors(), helmet(), logger)
  .forRoutes(CatsController);
```

---

## Global Middleware

Apply middleware to **all routes**:

```ts
// main.ts
const app = await NestFactory.create(AppModule);
app.use(logger);
await app.listen(process.env.PORT ?? 3000);
```

> 📌 Use this for universal logging, security, or body parsing customizations.

---

## Notes

* You can make `configure()` asynchronous using `async/await`.
* To customize body-parser middleware, disable it via:

  ```ts
  NestFactory.create(AppModule, { bodyParser: false });
  ```

---
