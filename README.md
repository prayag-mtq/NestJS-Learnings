# 🔁 Circular Dependencies in NestJS

In NestJS, a **circular dependency** occurs when **two or more providers or modules depend on each other**, forming a loop. This can cause NestJS to fail to resolve dependencies during application startup.

## 🚨 What is a Circular Dependency?

A circular dependency is when:

- `ServiceA` depends on `ServiceB`
- and `ServiceB` also depends on `ServiceA`

This creates a loop, and NestJS cannot determine which class to instantiate first unless explicitly guided.

---

## ✅ Solutions to Resolve Circular Dependencies

NestJS provides **two main techniques** to break this loop:

---

### 1️⃣ `forwardRef()` — Lazy Reference Resolution

Use the `forwardRef()` utility function when injecting dependencies to inform NestJS that the actual provider will be available later.

#### 🛠 Example

```ts
// cats.service.ts
@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private commonService: CommonService,
  ) {}
}

// common.service.ts
@Injectable()
export class CommonService {
  constructor(
    @Inject(forwardRef(() => CatsService))
    private catsService: CatsService,
  ) {}
}
```

> ✅ **Import `forwardRef` from `@nestjs/common`**

> ⚠️ **Note**: Avoid relying on constructor execution order — it's undefined in circular setups.

---

### 2️⃣ `ModuleRef` — Programmatic Lookup

Instead of injecting the dependency directly, use `ModuleRef` to **manually retrieve it at runtime**, typically during the `onModuleInit()` lifecycle hook.

#### 🛠 Example

```ts
@Injectable()
export class CatsService implements OnModuleInit {
  private commonService: CommonService;

  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.commonService = this.moduleRef.get(CommonService, { strict: false });
  }
}
```

> ✅ Use when one side of the circular dependency is optional or delayed

---

## 🔁 Circular Dependencies Between Modules

Use `forwardRef()` in the `imports` array of `@Module()` to resolve circular module imports.

#### 🛠 Example

```ts
// common.module.ts
@Module({
  imports: [forwardRef(() => CatsModule)],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}

// cats.module.ts
@Module({
  imports: [forwardRef(() => CommonModule)],
  providers: [CatsService],
})
export class CatsModule {}
```

> ✅ Remember to export the providers if they are used outside their own module.

---

## ⚠️ Barrel File Warning

Avoid using `index.ts` ("barrel files") for importing providers or modules **within the same directory** as they can **accidentally reintroduce circular dependencies**.

#### ❌ Bad Example:

```ts
// Avoid this:
import { CatsService } from './cats';
```

#### ✅ Use this instead:

```ts
import { CatsService } from './cats.service';
```

---

## 📌 Summary

| Technique            | When to Use                                                 |
| -------------------- | ----------------------------------------------------------- |
| `forwardRef()`       | When two providers or modules directly depend on each other |
| `ModuleRef`          | When you can delay or conditionally inject a dependency     |
| `Avoid barrel files` | To prevent unintentional import loops                       |
