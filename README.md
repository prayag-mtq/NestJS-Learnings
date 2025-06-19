# ⚡ NestJS Caching with `@nestjs/cache-manager`

This README provides a comprehensive guide to implementing and customizing **caching** in a NestJS application using the `@nestjs/cache-manager` package. Includes setup, in-memory caching, TTL handling, interceptors, decorators, Redis integration, async configs, and more.

---

## 📘 Theory: Why Caching?

Caching is a technique for storing frequently accessed data in a temporary storage layer to reduce recomputation and improve response time.

### ✅ Benefits

* Faster response times
* Reduced database/API calls
* Improved scalability and performance

---

## 📦 Installation

```bash
npm install @nestjs/cache-manager cache-manager
```

To use **Redis**:

```bash
npm install @keyv/redis
```

---

## 📁 File Structure

```bash
src/
├── app.module.ts
├── cache/
│   ├── cache.config.ts         # Optional async config
│   └── http-cache.interceptor.ts # Custom interceptor (optional)
.env
```

---

## 🚀 In-Memory Caching Setup

### ✅ Basic Setup

```ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';

@Module({
  imports: [CacheModule.register()],
  controllers: [AppController],
})
export class AppModule {}
```

---

## 🔌 Interacting with the Cache

### Inject `Cache` using the `CACHE_MANAGER` token

```ts
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
```

### Common Methods

```ts
await this.cacheManager.set('key', 'value');           // Add item
const value = await this.cacheManager.get('key');      // Retrieve item
await this.cacheManager.set('key', 'value', 1000);     // TTL in ms
await this.cacheManager.del('key');                    // Delete item
await this.cacheManager.clear();                       // Clear all
```

---

## 🧠 Auto-Caching with Interceptors

### ✅ Per-Controller Caching

```ts
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller()
@UseInterceptors(CacheInterceptor)
export class AppController {
  @Get()
  findAll(): string[] {
    return [];
  }
}
```

### ✅ Global Caching

```ts
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [CacheModule.register()],
  providers: [{
    provide: APP_INTERCEPTOR,
    useClass: CacheInterceptor,
  }],
})
export class AppModule {}
```

---

## 🕐 Time-to-Live (TTL)

### ✅ Global TTL

```ts
CacheModule.register({ ttl: 5000 }); // 5 seconds
```

### ✅ Per-Key TTL

```ts
await this.cacheManager.set('key', 'value', 2000);
```

### ✅ Decorators

```ts
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller()
@CacheTTL(50) // Controller-wide TTL
export class AppController {
  @CacheKey('custom_key')
  @CacheTTL(20) // Method-level TTL (overrides controller)
  findAll(): string[] {
    return [];
  }
}
```

---

## 🌐 Global Usage

```ts
CacheModule.register({ isGlobal: true });
```

---

## 📡 WebSockets / Microservices

```ts
@CacheKey('events')
@CacheTTL(10)
@UseInterceptors(CacheInterceptor)
@SubscribeMessage('events')
handleEvent(client: Client, data: string[]): Observable<string[]> {
  return [];
}
```

---

## 🧩 Customizing Cache Behavior

### ✅ Custom Interceptor (track by header, etc.)

```ts
@Injectable()
class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    return 'custom_key';
  }
}
```

---

## 🔄 Switching to Redis

```bash
npm install @keyv/redis
```

### ✅ Multi-Store Setup

```ts
import { createKeyv } from '@keyv/redis';
import { Keyv } from 'keyv';

CacheModule.registerAsync({
  useFactory: async () => ({
    stores: [
      new Keyv({ store: new CacheableMemory({ ttl: 60000 }) }),
      createKeyv('redis://localhost:6379'),
    ],
  }),
});
```

---

## ⏳ Async Configuration Options

### ✅ With Factory Function

```ts
CacheModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    ttl: configService.get('CACHE_TTL'),
  }),
  inject: [ConfigService],
});
```

### ✅ With Class

```ts
@Injectable()
class CacheConfigService implements CacheOptionsFactory {
  createCacheOptions(): CacheModuleOptions {
    return { ttl: 5 };
  }
}

CacheModule.registerAsync({
  useClass: CacheConfigService,
});
```

### ✅ With useExisting

```ts
CacheModule.registerAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```


