# Providers in NestJS

## What are Providers?

Providers are a **core concept** in NestJS. They are classes that can be **injected as dependencies**, allowing the framework to manage relationships between objects through its **Dependency Injection (DI)** system.

Common examples of providers include:

- Services
- Repositories

---

## Why Use Providers?

Providers help achieve:

- **Separation of concerns** – keep logic out of controllers
- **Dependency injection** – services can depend on other services
- **Scalability** – define business logic in testable, reusable components

---



## Interfaces for Strong Typing

Define a shared interface:

```ts
// interfaces/cat.interface.ts
export interface Cat {
  name: string;
  age: number;
  breed: string;
}
```
---

## Creating a Service Provider

Use the Nest CLI:

```bash
$ nest g service cats
````

This will generate a service file like this:

```ts
// cats.service.ts
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}
```

Note the `@Injectable()` decorator – it tells NestJS to manage this class as a provider.

---

## Using the Provider in a Controller

You can inject a service into a controller like this:

```ts
// cats.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}
```

> The constructor-based injection is the most common pattern in NestJS.

---

## Registering the Provider

Make sure to register the provider in your module:

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';
import { CatsService } from './cats/cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class AppModule {}
```



---

## Optional & Custom Providers

Nest supports optional providers using the `@Optional()` decorator:

```ts
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  constructor(@Optional() @Inject('HTTP_OPTIONS') private httpClient: T) {}
}
```

You can also use **property-based injection**, although constructor-based is preferred:

```ts
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  @Inject('HTTP_OPTIONS')
  private readonly httpClient: T;
}
```

---

## Example Directory Structure

```
src/
├── cats/
│   ├── dto/
│   │   └── create-cat.dto.ts
│   ├── interfaces/
│   │   └── cat.interface.ts
│   ├── cats.controller.ts
│   ├── cats.service.ts
├── app.module.ts
└── main.ts
```

## Note

`What are Injectables?`

It tells Nest's dependency injection system that the class can be managed and injected as a dependency into other components (like services, controllers, or other providers). This enables clean separation of concerns and makes it easy to share and reuse logic across your application.








