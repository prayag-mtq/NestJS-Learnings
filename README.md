## 📦 What Are Pipes?

Pipes in NestJS:

* **Transform** input data (e.g. string → number)
* **Validate** data (e.g. ensure a DTO matches a schema)
* Can be applied:

  * Per parameter
  * Per route
  * Globally (entire app)

A pipe implements the `PipeTransform` interface and typically overrides the `transform()` method.

---

## 🏗️ Built-in Pipes

Nest provides several built-in pipes:

| Pipe               | Description                                        |
| ------------------ | -------------------------------------------------- |
| `ParseIntPipe`     | Converts input to an integer                       |
| `ParseBoolPipe`    | Converts to boolean                                |
| `DefaultValuePipe` | Applies a fallback value                           |
| `ValidationPipe`   | Validates objects using class-validator decorators |

Example:

```ts
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.service.findOne(id);
}
```

---

## 🧪 Schema-Based Validation with Zod

Zod is a schema validation library. You can create reusable pipes to validate request payloads.

### ✅ Setup

```bash
npm install zod
```

### 🧩 Create Schema

```ts
// create-cat.schema.ts
import { z } from 'zod';

export const createCatSchema = z.object({
  name: z.string(),
  age: z.number(),
  breed: z.string(),
});

export type CreateCatDto = z.infer<typeof createCatSchema>;
```

### 🧰 Create Pipe

```ts
// zod-validation.pipe.ts
import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      throw new BadRequestException('Validation failed');
    }
  }
}
```

### 🧷 Use in Controller

```ts
// cats.controller.ts
@Post()
@UsePipes(new ZodValidationPipe(createCatSchema))
create(@Body() createCatDto: CreateCatDto) {
  return this.catsService.create(createCatDto);
}
```

> **Note:** Enable `strictNullChecks` in `tsconfig.json` for Zod.

---

## 🧪 Class Validator (Decorator-based)

An alternative approach using `class-validator` decorators with DTOs.

### ✅ Setup

```bash
npm install class-validator class-transformer
```

### 🧩 DTO with Decorators

```ts
// create-cat.dto.ts
import { IsString, IsInt } from 'class-validator';

export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  age: number;

  @IsString()
  breed: string;
}
```

### 🧰 Create Validation Pipe

```ts
// validation.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) return value;

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

### 🧷 Use in Controller

```ts
@Post()
create(@Body(new ValidationPipe()) createCatDto: CreateCatDto) {
  return this.catsService.create(createCatDto);
}
```

---

## 🌐 Global Validation Pipe

To validate all inputs across your app:

```ts
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
```

Or enable DI via `APP_PIPE`:

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from './common/pipes/validation.pipe';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
```

---

## 🔁 Transformation Use Case

Pipes can also **convert** data types.

### 🧰 Example: ParseIntPipe

```ts
// parse-int.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}
```

Usage:

```ts
@Get(':id')
findOne(@Param('id', new ParseIntPipe()) id: number) {
  return this.service.findOne(id);
}
```

---

## 🧱 Providing Defaults with DefaultValuePipe

You can chain pipes to provide default values:

```ts
@Get()
findAll(
  @Query('activeOnly', new DefaultValuePipe(false), ParseBoolPipe) activeOnly: boolean,
  @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
) {
  return this.service.findAll({ activeOnly, page });
}
```

---

## 🔒 Best Practices

* ✅ Prefer built-in `ValidationPipe` unless you need advanced schema control
* ✅ Use `@UsePipes()` for reusable pipes
* ✅ Apply global validation for clean codebase
* ⚠️ Don’t rely on middleware for validation (no access to handler metadata)
* ⚠️ Zod: Enable `strictNullChecks`

---