
# 📘 ModuleRef in NestJS

NestJS provides the `ModuleRef` class to:

* Dynamically **access providers** registered in the DI container.
* **Resolve request-scoped or transient** providers on demand.
* **Create custom class instances** dynamically.
* **Register request context** for custom-scoped providers.

---

## 📁 File Structure

```
src/
│
├── cats/
│   ├── cats.service.ts           ← Uses ModuleRef to resolve providers
│   ├── cats.repository.ts        ← Example repository (can be request-scoped)
│   └── cats.factory.ts           ← Example factory class created dynamically
│
├── shared/
│   └── transient.service.ts      ← Transient scoped service to demonstrate resolution
│
└── main.ts                       ← Can be used for request simulation if needed
```

---

## 📌 Where and What to Add

### 1. `cats.service.ts` – Uses `ModuleRef` for various use cases

```ts
// src/cats/cats.service.ts
import {
  Injectable,
  OnModuleInit,
  Scope,
  Inject,
} from '@nestjs/common';
import { ModuleRef, ContextIdFactory, REQUEST } from '@nestjs/core';
import { CatsRepository } from './cats.repository';
import { TransientService } from '../shared/transient.service';
import { CatsFactory } from './cats.factory';

@Injectable({ scope: Scope.REQUEST })
export class CatsService implements OnModuleInit {
  constructor(
    private moduleRef: ModuleRef,
    @Inject(REQUEST) private readonly request: Record<string, any>, // For request context
  ) {}

  async onModuleInit() {
    // 1. Static Resolution
    const staticService = this.moduleRef.get(TransientService, { strict: false });

    // 2. Transient Resolution (creates NEW instance every call)
    const t1 = await this.moduleRef.resolve(TransientService);
    const t2 = await this.moduleRef.resolve(TransientService);
    console.log('Are t1 and t2 equal?', t1 === t2); // false

    // 3. Transient resolution with context (same instance)
    const contextId = ContextIdFactory.getByRequest(this.request);
    const ts1 = await this.moduleRef.resolve(TransientService, contextId);
    const ts2 = await this.moduleRef.resolve(TransientService, contextId);
    console.log('Same instance with context?', ts1 === ts2); // true

    // 4. Request-scoped provider resolution
    const catsRepo = await this.moduleRef.resolve(CatsRepository, contextId);

    // 5. Dynamically instantiate a class not in providers
    const catsFactory = await this.moduleRef.create(CatsFactory);
    catsFactory.log(); // Output from dynamic factory
  }
}
```

---

### 2. `cats.repository.ts` – Request-scoped provider

```ts
// src/cats/cats.repository.ts
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class CatsRepository {
  getData() {
    return 'Repo data';
  }
}
```

---

### 3. `transient.service.ts` – Transient-scoped provider

```ts
// src/shared/transient.service.ts
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class TransientService {
  id = Math.random();
}
```

---

### 4. `cats.factory.ts` – Custom class not registered as a provider

```ts
// src/cats/cats.factory.ts
export class CatsFactory {
  log() {
    console.log('🐱 CatsFactory created dynamically');
  }
}
```

---

## 🧪 Example Usage Summary

| Scenario                       | Method                      | Description                                     |
| ------------------------------ | --------------------------- | ----------------------------------------------- |
| Static provider                | `get()`                     | Resolves a singleton-scoped provider            |
| Transient provider             | `resolve()`                 | Returns new instance per call                   |
| Scoped provider (same request) | `resolve(token, contextId)` | Shares instance across services for one request |
| Custom class instantiation     | `create()`                  | Instantiates class not declared as provider     |

---

## 🎯 When to Use

| Use Case                                   | Tool                                     |
| ------------------------------------------ | ---------------------------------------- |
| Access existing provider dynamically       | `moduleRef.get()`                        |
| Resolve scoped or transient provider       | `moduleRef.resolve()`                    |
| Inject same scoped provider within request | `ContextIdFactory.getByRequest()`        |
| Inject provider from another module        | `get(token, { strict: false })`          |
| Instantiate custom classes                 | `moduleRef.create()`                     |
| Register custom request context            | `moduleRef.registerRequestByContextId()` |

---

## ⚠️ Notes

* **Avoid using `get()` for transient/request-scoped** providers – use `resolve()` instead.
* Make sure to **inject `REQUEST`** if using context-aware resolution.
* `ContextIdFactory.create()` is for **manual DI trees**; not auto-managed by Nest.
* Don't forget to **register providers** like `TransientService`, `CatsRepository` in a module.

