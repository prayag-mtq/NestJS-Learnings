### ✅ **NestJS Guards - Essentials Recap**

#### 1. **Basic Structure**

A Guard is a class that:

* Implements `CanActivate`
* Returns `true` or `false` to allow or deny requests

```ts
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return validateRequest(request); // Your custom logic
  }
}
```

#### 2. **Role-Based Guard**

You’ll use:

* `@SetMetadata()` or `Reflector.createDecorator()` for role metadata
* `Reflector` in the guard to access metadata
* A custom `@Roles()` decorator

**roles.decorator.ts**

```ts
import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

**roles.guard.ts**

```ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user?.roles?.includes(role));
  }
}
```

#### 3. **Usage in Controller**

```ts
@UseGuards(RolesGuard)
@Roles('admin')
@Post('create')
createCat(@Body() dto: CreateCatDto) {
  return this.catService.create(dto);
}
```

---

### 🛠️ **Advanced Option: Global Guard via DI**

For app-wide enforcement:

```ts
// app.module.ts
{
  provide: APP_GUARD,
  useClass: RolesGuard,
}
```

---

## 🛡️ NestJS Guards – Role-Based Authorization

Guards in NestJS are used to **control access to route handlers** based on runtime conditions like authentication and authorization.

### 🔹 What is a Guard?

A Guard is a class annotated with `@Injectable()` that implements the `CanActivate` interface. It determines whether a request should be processed or not.

Guards run **after middleware** but **before interceptors and pipes**.

---

### ✅ Use Case: Role-Based Access Control (RBAC)

We’ll create a custom `@Roles()` decorator and a `RolesGuard` that allows access only to users with specific roles.

---

### 📦 1. Create `@Roles()` Decorator

```ts
// src/auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

---

### 🛡️ 2. Create RolesGuard

```ts
// src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user?.roles?.includes(role));
  }
}
```

---

### 🧠 3. Example Controller Usage

```ts
// src/cats/cats.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('cats')
@UseGuards(RolesGuard)
export class CatsController {
  @Post()
  @Roles('admin')
  createCat(@Body() dto: any) {
    return 'Cat created!';
  }
}
```

---

### 🌍 4. Register as a Global Guard (Optional)

```ts
// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

> ℹ️ Global guards apply across all routes, but cannot inject dependencies if created outside module scope. Use `APP_GUARD` inside a module for DI support.

---

### 📌 Assumptions

* `request.user` is set by an earlier authentication step (e.g., JWT AuthGuard).
* User object includes a `roles: string[]` array.

---

### 🧪 Example User Object

```json
{
  "id": 1,
  "username": "admin_user",
  "roles": ["admin", "editor"]
}
```

---

### ❌ Unauthorized Request Response

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```
