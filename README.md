### 📁 File Structure for Interceptors in NestJS

```
src/
├── interceptors/
│   ├── logging.interceptor.ts
│   ├── transform.interceptor.ts
│   ├── exclude-null.interceptor.ts
│   ├── errors.interceptor.ts
│   ├── cache.interceptor.ts
│   └── timeout.interceptor.ts
├── cats/
│   ├── cats.controller.ts
│   └── cats.service.ts
├── app.module.ts
└── main.ts
```

---

### Interceptors

#### What are Interceptors?

An **interceptor** is a class in NestJS annotated with `@Injectable()` and implements the `NestInterceptor` interface. Interceptors are powerful tools inspired by AOP (Aspect-Oriented Programming) and can manipulate the request/response lifecycle.

---

### ✨ What Can Interceptors Do?

1. **Run code before/after a request is handled**
2. **Transform the result** of a request (e.g., wrap it in a custom format)
3. **Transform exceptions** before they're sent to the client
4. **Extend controller behavior** (e.g., for caching, logging, etc.)
5. **Completely override a response**

---

### 🛠 Basic Anatomy

```ts
@Injectable()
export class ExampleInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Logic before handler
    return next.handle().pipe(
      // Logic after handler
    );
  }
}
```

* `context`: Provides metadata (e.g., class, method, request).
* `next.handle()`: Calls the route handler and returns an RxJS Observable.
* Use RxJS operators like `map`, `tap`, `catchError`, `timeout`, etc., to manipulate the stream.

---

### 🚀 Example Interceptors

#### 1. 📝 LoggingInterceptor – Logs before & after route handler

```ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');
    const now = Date.now();
    return next.handle().pipe(
      tap(() => console.log(`After... ${Date.now() - now}ms`)),
    );
  }
}
```

#### 2. 🔁 TransformInterceptor – Wraps response inside `{ data: ... }`

```ts
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, { data: T }> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<{ data: T }> {
    return next.handle().pipe(map(data => ({ data })));
  }
}
```

#### 3. 🧹 ExcludeNullInterceptor – Converts nulls to empty strings

```ts
@Injectable()
export class ExcludeNullInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map(value => value === null ? '' : value));
  }
}
```

#### 4. 🧯 ErrorsInterceptor – Catches errors and returns a friendly one

```ts
@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(err => throwError(() => new BadGatewayException()))
    );
  }
}
```

#### 5. 🧊 CacheInterceptor – Skips handler and returns cached value

```ts
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isCached = true;
    if (isCached) {
      return of([]); // return fake cached response
    }
    return next.handle();
  }
}
```

#### 6. ⏱ TimeoutInterceptor – Fails if handler takes too long

```ts
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5000),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  }
}
```

---

### 🔗 Binding Interceptors

#### 🟡 Method Scoped

```ts
@UseInterceptors(LoggingInterceptor)
@Get()
findAll() {
  return this.catService.findAll();
}
```

#### 🟢 Controller Scoped

```ts
@UseInterceptors(LoggingInterceptor)
@Controller('cats')
export class CatsController { ... }
```

#### 🔵 Global (No Dependency Injection)

```ts
const app = await NestFactory.create(AppModule);
app.useGlobalInterceptors(new LoggingInterceptor());
```

#### 🟣 Global with DI

```ts
// In app.module.ts
providers: [
  {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  },
]
```

---

### 🧪 Testing Tip

In development, use `console.log()` inside the interceptors to see the lifecycle in action. When you call an API, you should see "Before..." and "After..." logs if `LoggingInterceptor` is applied.

---

### 📚 Summary

| Use Case               | RxJS Operator  | Interceptor Class        |
| ---------------------- | -------------- | ------------------------ |
| Logging                | `tap()`        | `LoggingInterceptor`     |
| Modify response        | `map()`        | `TransformInterceptor`   |
| Replace nulls          | `map()`        | `ExcludeNullInterceptor` |
| Handle exceptions      | `catchError()` | `ErrorsInterceptor`      |
| Return cached response | `of()`         | `CacheInterceptor`       |
| Timeout response       | `timeout()`    | `TimeoutInterceptor`     |

---
