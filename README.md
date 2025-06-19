# 🔐 NestJS Authentication (JWT) Guide

Authentication is a fundamental part of most applications. In this guide, you'll learn how to implement **username/password authentication** with **JWT support**, and how to **protect routes** using guards in NestJS.

---

## 📦 Installation

```bash
npm install --save @nestjs/jwt
```

---

## 📁 File Structure

```bash
src/
├── auth/
│   ├── auth.controller.ts      # Auth endpoints
│   ├── auth.service.ts         # Auth logic
│   ├── auth.module.ts          # Auth module
│   ├── auth.guard.ts           # JWT guard
│   ├── constants.ts            # JWT secret
│   └── public.decorator.ts     # @Public() decorator
├── users/
│   ├── users.service.ts        # User lookup logic
│   └── users.module.ts         # User module
```

---

## 🚀 Setup Steps

### 1. Create Modules and Services

```bash
nest g module auth && nest g controller auth && nest g service auth
nest g module users && nest g service users
```

### 2. `UsersService` (In-memory users)

```ts
// users/users.service.ts
@Injectable()
export class UsersService {
  private readonly users = [
    { userId: 1, username: 'john', password: 'changeme' },
    { userId: 2, username: 'maria', password: 'guess' },
  ];

  async findOne(username: string) {
    return this.users.find((user) => user.username === username);
  }
}
```

### 3. `UsersModule`

```ts
// users/users.module.ts
@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

---

## 🛂 Authentication Logic

### 4. AuthService

```ts
// auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.userId, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
```

### 5. AuthController

```ts
// auth/auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() body: { username: string; password: string }) {
    return this.authService.signIn(body.username, body.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
```

### 6. JWT Constants

```ts
// auth/constants.ts
export const jwtConstants = {
  secret: 'SUPER_SECRET_KEY_DO_NOT_SHARE',
};
```

### 7. Auth Module

```ts
// auth/auth.module.ts
@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

---

## 🔐 Protecting Routes

### 8. Auth Guard

```ts
// auth/auth.guard.ts
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

### 9. Register Global Guard (optional)

```ts
// app.module.ts or auth.module.ts
{
  provide: APP_GUARD,
  useClass: AuthGuard,
}
```

### 10. Public Route Decorator

```ts
// auth/public.decorator.ts
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

### 11. Use Public Decorator

```ts
@Public()
@Get('health')
healthCheck() {
  return 'OK';
}
```

---

## 🧪 Example cURL Usage

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -d '{"username": "john", "password": "changeme"}' \
  -H "Content-Type: application/json"

# Use JWT for protected route
curl http://localhost:3000/auth/profile \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## ✅ Summary

| Feature              | Status |
| -------------------- | ------ |
| JWT Authentication   | ✅     |
| Guard-based Security | ✅     |
| Public Route Support | ✅     |
| Global Guard Option  | ✅     |
| User Service (Mock)  | ✅     |

You now have a complete JWT-based auth system in NestJS, with the flexibility to protect or expose routes easily!
