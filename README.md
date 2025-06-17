### 🧱 What is a Module?

A **module** is simply a TypeScript class annotated with the `@Module()` decorator. It provides **metadata** to Nest that describes how to organize the application structure.

```ts
@Module({
  imports: [],
  controllers: [],
  providers: [],
  exports: [],
})
export class SomeModule {}
```

---

### 🗂 Role of Modules

Each NestJS application has a **root module**, but real-world apps usually contain **many modules**, each responsible for a specific feature or domain (e.g., `CatsModule`, `UsersModule`).

Modules help:

* Organize business logic
* Encapsulate and reuse services
* Enable clean dependency injection
* Improve maintainability and testability

---

### 🛠 @Module Decorator

The `@Module()` decorator accepts the following configuration options:

| Property      | Purpose                                                                |
| ------------- | ---------------------------------------------------------------------- |
| `providers`   | Services, factories, etc., that should be created by the DI system     |
| `controllers` | Controllers that handle incoming requests and return responses         |
| `imports`     | Other modules whose exported providers are required in this module     |
| `exports`     | Providers that should be available in other modules importing this one |

---

### ♻️ Shared Modules

By default, modules in NestJS are **singletons** and shared across imports. If you want to share a provider like `CatsService` across multiple modules, export it from its module:

```ts
@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}
```

Now, any module importing `CatsModule` will **reuse the same instance** of `CatsService`.

---

### 🌐 Global Modules

If a module (e.g., `DatabaseModule`, `LoggerModule`) needs to be used everywhere without explicitly importing it, mark it as **global** using `@Global()`:

```ts
@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
```
  
---

### 🧩 Dynamic Modules (Advanced)

Dynamic modules allow configuration **at runtime** and are ideal for reusable packages and SDKs. A dynamic module returns a `ModuleMetadata` object from a static method.

```ts
@Module({})
export class MyModule {
  static register(options: Options): DynamicModule {
    return {
      module: MyModule,
      providers: [
        {
          provide: 'CONFIG',
          useValue: options,
        },
      ],
      exports: ['CONFIG'],
    };
  }
}
```

---

### 📁 Suggested Structure

```
src/
│
├── app.module.ts         # Root module
├── cats/
│   ├── cats.module.ts
│   ├── cats.controller.ts
│   └── cats.service.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   └── users.service.ts
```
