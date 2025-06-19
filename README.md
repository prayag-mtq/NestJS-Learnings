# 🚦 NestJS Rate Limiting Guide

Rate limiting helps protect applications from brute-force attacks and request abuse.

## 📦 Installation

```bash
npm install @nestjs/throttler
```

---

## ⚙️ Basic Configuration

Enable global throttling with default TTL (time to live in milliseconds) and request limit:

```ts
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 1 minute
          limit: 10, // Max 10 requests per minute
        },
      ],
    }),
  ],
})
export class AppModule {}
```

---

## 🔐 Apply Throttling Globally

Use the `APP_GUARD` to apply throttling across your entire app:

```ts
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

providers: [
  {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  },
];
```

---

## 🎯 Use Per Route

Override throttling for specific routes or controllers:

```ts
import { Throttle } from '@nestjs/throttler';

@Throttle({ default: { limit: 5, ttl: 10000 } }) // 5 requests per 10 seconds
@Get('custom')
getCustom() {
  return 'Custom throttled endpoint';
}
```

---

## 🚫 Skip Throttling

Skip throttling for specific routes or controllers:

```ts
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Get('open')
getOpenEndpoint() {
  return 'No throttling on this route';
}
```

Partial skipping:

```ts
@SkipThrottle()
@Controller('example')
export class ExampleController {
  // Will apply throttling
  @SkipThrottle({ default: false })
  @Get('secure')
  secureRoute() {
    return 'Throttled!';
  }
}
```

---

## 🌐 Support for Proxies

To trust proxy headers for real client IP:

```ts
app.set('trust proxy', 'loopback');
```

Custom proxy-aware tracker:

```ts
@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ips?.[0] ?? req.ip;
  }
}
```

---

## 🔄 Async Configuration (e.g. with ConfigService)

```ts
ThrottlerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => [
    {
      ttl: config.get('THROTTLE_TTL'),
      limit: config.get('THROTTLE_LIMIT'),
    },
  ],
});
```

---

## 📚 Helpers

Use time helpers for readable configs:

```ts
import { seconds, minutes } from '@nestjs/throttler';

ttl: minutes(1); // 60000
```
