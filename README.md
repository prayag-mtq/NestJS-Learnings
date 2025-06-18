**Injection Scopes**
\\\\  
### 🔍 What is Injection Scope?

In NestJS, the **injection scope** determines **how long a provider's instance lives** and **who shares it**. This allows better control over **resource usage**, **performance**, and **request handling** in your application.

NestJS offers **three core scopes**:

| Scope       | Description                                                            | Use Case                                  |
| ----------- | ---------------------------------------------------------------------- | ----------------------------------------- |
| `SINGLETON` | Default. One instance shared across the whole app.                     | Most services, database connections       |
| `REQUEST`   | New instance created **per incoming request**.                         | Per-request data, user-specific caching   |
| `TRANSIENT` | New instance created **per injection** (even within the same request). | Stateless helpers, isolated logging, etc. |

---

## 🧠 How Scope Affects NestJS Providers

* Nest uses **singleton** scope by default for performance and consistency.
* Node.js is single-threaded and event-driven, so it's safe to share instances unless explicitly required.
* If a `REQUEST` scoped provider is used in a controller, that controller becomes request-scoped too.

---

### 📦 Usage Example: Setting Scope

```ts
// Import the Scope enum
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class MyRequestScopedService {}
```

For custom providers:

```ts
{
  provide: 'MY_PROVIDER',
  useClass: MyClass,
  scope: Scope.TRANSIENT,
}
```

---

## 🔄 Scope Behavior Examples

### ✅ Default (Singleton) Scope

```ts
@Injectable()
export class AppService {
  private readonly id = Math.random();
  getId() {
    return this.id;
  }
}
```

**Same ID** on every request.

---

### 🔁 Request Scope

```ts
@Injectable({ scope: Scope.REQUEST })
export class UserContextService {
  constructor(@Inject(REQUEST) private request: Request) {}

  getCurrentUser() {
    return this.request.user;
  }
}
```

* **Different instance per request**
* Great for GraphQL multi-tenancy or per-user logging.

---

### 💥 Transient Scope

```ts
@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  log(message: string) {
    console.log(`[Logger ${Math.random()}] ${message}`);
  }
}
```

**New instance per injection**, even within a single request.

---

## 🔐 Request Scope in Controllers

```ts
import { Controller, Scope } from '@nestjs/common';

@Controller({ path: 'users', scope: Scope.REQUEST })
export class UsersController {
  constructor(private readonly userService: UserService) {}
}
```

If the controller depends on a `REQUEST` scoped provider, it will also become request-scoped.

---

## ⚙️ Using REQUEST or CONTEXT Object

### 🧾 In Express/Fastify apps:

```ts
@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(REQUEST) private readonly req: Request) {}

  getHeaders() {
    return this.req.headers;
  }
}
```

### 🔬 In GraphQL apps:

```ts
@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(CONTEXT) private readonly context) {}

  getTenantId() {
    return this.context.req.headers['x-tenant-id'];
  }
}
```

---

## 🔄 Durable Providers (Advanced Multi-Tenancy)

Durable providers are `REQUEST` scoped providers **reused across multiple requests**, based on **shared attributes**, such as tenant ID.

### 📍 Setup

1. Create a custom **ContextIdStrategy**:

```ts
import {
  ContextId,
  ContextIdFactory,
  ContextIdStrategy,
  HostComponentInfo,
} from '@nestjs/core';
import { Request } from 'express';

const tenants = new Map<string, ContextId>();

export class TenantStrategy implements ContextIdStrategy {
  attach(contextId: ContextId, request: Request) {
    const tenantId = request.headers['x-tenant-id'] as string;
    let tenantCtxId = tenants.get(tenantId);

    if (!tenantCtxId) {
      tenantCtxId = ContextIdFactory.create();
      tenants.set(tenantId, tenantCtxId);
    }

    return (info: HostComponentInfo) =>
      info.isTreeDurable ? tenantCtxId : contextId;
  }
}
```

2. Register the strategy in `main.ts`:

```ts
import { ContextIdFactory } from '@nestjs/core';
import { TenantStrategy } from './tenant.strategy';

async function bootstrap() {
  ContextIdFactory.apply(new TenantStrategy());
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
```

3. Mark providers as **durable**:

```ts
@Injectable({ scope: Scope.REQUEST, durable: true })
export class CatsService {}
```

---

## 🧩 Example: Using `INQUIRER` token (for logging who injected a service)

```ts
import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  constructor(@Inject(INQUIRER) private parent: object) {}

  log(msg: string) {
    console.log(`[${this.parent?.constructor?.name}] ${msg}`);
  }
}
```