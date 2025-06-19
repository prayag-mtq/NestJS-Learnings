# 🔐 NestJS Authorization Guide

Authorization determines what an authenticated user is allowed to do. This README covers:

* ✅ Basic Role-Based Access Control (RBAC)
* ✅ Claims-based permissions
* ✅ CASL integration for expressive, fine-grained authorization
* ✅ Policy-based authorization with `@CheckPolicies`

---

## 📌 File Structure

```bash
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.guard.ts         # AuthGuard to extract user from JWT
│   └── roles.guard.ts        # RBAC guard
├── common/
│   ├── decorators/
│   │   ├── roles.decorator.ts
│   │   └── public.decorator.ts
│   ├── enums/
│   │   └── role.enum.ts
├── casl/
│   ├── casl.module.ts
│   └── casl-ability.factory.ts
└── policies/
    ├── check-policies.decorator.ts
    └── policies.guard.ts
```

---

## 🔑 Role-Based Access Control (RBAC)

### 🎭 Define Roles

```ts
// enums/role.enum.ts
export enum Role {
  User = 'user',
  Admin = 'admin',
}
```

### 🧩 Create Decorator

```ts
// decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

### 🛡️ Roles Guard

```ts
// auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.roles?.includes(role));
  }
}
```

### 🧪 Usage

```ts
@Roles(Role.Admin)
@Post('create')
createItem() {
  // Only admin can access
}
```

---

## 🔐 Claims-Based Authorization

Instead of roles, compare **permissions**:

```ts
@RequirePermissions(Permission.CREATE_ARTICLE)
@Post('article')
create() {}
```

> Use a similar `@RequirePermissions()` decorator and permission enum as in RBAC.

---

## 🦾 CASL Integration (Advanced)

### 📦 Install CASL

```bash
npm install @casl/ability
```

### 🏗️ Define Abilities

```ts
// casl/casl-ability.factory.ts
import { Injectable } from '@nestjs/common';
import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
  InferSubjects,
  ExtractSubjectType
} from '@casl/ability';
import { Action } from './action.enum';
import { Article } from '../articles/article.entity';
import { User } from '../users/user.entity';

export type Subjects = InferSubjects<typeof Article | typeof User> | 'all';
export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

    if (user.isAdmin) {
      can(Action.Manage, 'all');
    } else {
      can(Action.Read, 'all');
      can(Action.Update, Article, { authorId: user.id });
      cannot(Action.Delete, Article, { isPublished: true });
    }

    return build({
      detectSubjectType: item => item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
```

### 📋 Action Enum

```ts
export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}
```

---

## 🔄 Policies Guard (CASL-based)

### 🎛️ Define Policy Decorator

```ts
// check-policies.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
```

### 🛡️ Policies Guard

```ts
// policies.guard.ts
@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const handlers =
      this.reflector.get<PolicyHandler[]>(CHECK_POLICIES_KEY, context.getHandler()) || [];

    const { user } = context.switchToHttp().getRequest();
    const ability = this.caslAbilityFactory.createForUser(user);

    return handlers.every(handler =>
      typeof handler === 'function' ? handler(ability) : handler.handle(ability)
    );
  }
}
```

### 🧪 Usage

```ts
@UseGuards(PoliciesGuard)
@CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Article))
@Get('articles')
findAll() {}
```

Or use a class:

```ts
export class ReadArticlePolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, Article);
  }
}

@UseGuards(PoliciesGuard)
@CheckPolicies(new ReadArticlePolicyHandler())
@Get('articles')
findAll() {}
```

---

## ✅ Summary

| Method       | Guard           | Decorator               | Use Case                      |
| ------------ | --------------- | ----------------------- | ----------------------------- |
| RBAC         | `RolesGuard`    | `@Roles()`              | Role-based access             |
| Claims-Based | CustomGuard     | `@RequirePermissions()` | Permission-based access       |
| CASL         | `PoliciesGuard` | `@CheckPolicies()`      | Complex, attribute-based auth |

Use **authorization** to enforce security and control access to your API endpoints precisely and effectively.

> ✅ Let me know if you want to add dynamic role loading, multi-tenant ACLs, or module-scoped permissions next!
