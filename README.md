# 🧩 NestJS Configuration with @nestjs/config

This guide provides **a complete walkthrough** of handling environment-based configuration in NestJS using `@nestjs/config`. It includes `.env` management, config files, YAML, validation, conditional modules, and more — both theory and practical code.

---

## 📘 Theory

### ✅ Why Configuration Matters

Applications behave differently based on the environment (e.g., dev, staging, prod). Using config:

* Keeps secrets and credentials out of code.
* Enables dynamic behavior based on environment.
* Makes apps portable, predictable, and easier to test.

### ✅ process.env & .env

* Node.js allows access to environment variables via `process.env`.
* The `.env` file is a simple key-value format (e.g., `DB_HOST=localhost`).
* Best practice is to avoid hardcoding values in source files and instead rely on environment variables.

### ✅ Why @nestjs/config

NestJS provides the `@nestjs/config` package which:

* Automatically loads `.env` files.
* Uses `dotenv` and `dotenv-expand` under the hood.
* Supports schema validation (with `Joi` or `class-validator`).
* Allows modular, typed, nested config access.
* Supports conditional module loading.

---

## 📁 File Structure

```bash
src/
├── app.module.ts
├── main.ts
├── config/
│   ├── configuration.ts           # JS object config
│   ├── database.config.ts         # Namespaced config
│   ├── config.yaml                # YAML config
│   └── env.validation.ts          # Validation logic
.env
.env.development
nest-cli.json                      # Ensure YAML files copied to dist
```

---

## 🧩 Setup Instructions

### 🔌 Install Dependencies

```bash
npm i --save @nestjs/config
npm i js-yaml
npm i joi class-validator class-transformer
npm i -D @types/js-yaml
```

### ⚙️ Enable Config in AppModule

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import databaseConfig from './config/database.config';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development.local', '.env.development'],
      load: [configuration, databaseConfig],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').default('development'),
        PORT: Joi.number().port().default(3000),
      }),
      validationOptions: {
        allowUnknown: false,
        abortEarly: true,
      },
      expandVariables: true,
      cache: true,
      validate,
    }),
  ],
})
export class AppModule {}
```

---

## 🔐 .env Example

```env
NODE_ENV=development
PORT=3000
APP_URL=mywebsite.com
SUPPORT_EMAIL=support@${APP_URL}
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

---

## 🔧 Custom Configuration File

### `configuration.ts`

```ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  },
});
```

* Groups config logically.
* Supports nested access via `configService.get('database.port')`.

---

## 🧱 Namespaced Config

### `database.config.ts`

```ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
}));
```

### Usage:

```ts
const host = configService.get<string>('database.host');
```

Or inject with strong typing:

```ts
constructor(
  @Inject(databaseConfig.KEY)
  private readonly dbConfig: ConfigType<typeof databaseConfig>,
) {}
```

---

## 📑 YAML Configuration Support

### `config.yaml`

```yaml
http:
  host: localhost
  port: 8080
```

### `configuration.ts` for YAML

```ts
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

export default () => {
  return yaml.load(
    readFileSync(join(__dirname, 'config.yaml'), 'utf8'),
  ) as Record<string, any>;
};
```

### `nest-cli.json`

```json
{
  "compilerOptions": {
    "assets": [
      {
        "include": "src/config/*.yaml",
        "outDir": "dist/config"
      }
    ]
  }
}
```

---

## 🧪 Validation

### ✅ Joi Schema

```ts
validationSchema: Joi.object({
  PORT: Joi.number().port().required(),
  NODE_ENV: Joi.string().valid('development', 'production'),
})
```

### ✅ class-validator Method

```ts
export class EnvVars {
  @IsEnum(['development', 'production'])
  NODE_ENV: string;

  @IsNumber()
  @Min(1000)
  @Max(65535)
  PORT: number;
}
```

```ts
export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvVars, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) throw new Error(errors.toString());
  return validated;
}
```

---

## 🧠 Advanced Features

### 🧠 Expandable Variables

```env
APP_URL=domain.com
SUPPORT_EMAIL=support@${APP_URL}
```

Enabled via `expandVariables: true`.

---

### ⚙️ Conditional Modules

```ts
import { ConditionalModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ConditionalModule.registerWhen(
      FooModule,
      (env) => env['USE_FOO'] === 'true'
    ),
  ],
})
```

---

### 🧩 Partial Config with `forFeature()`

```ts
@Module({
  imports: [ConfigModule.forFeature(databaseConfig)],
})
export class DatabaseModule {}
```

Use `onModuleInit()` if values aren't available in constructor.

---

## 🎯 Usage in Code

### Inject ConfigService

```ts
@Injectable()
export class SomeService {
  constructor(private configService: ConfigService) {}

  get port() {
    return this.configService.get<number>('PORT');
  }

  get dbHost() {
    return this.configService.get<string>('database.host', 'localhost');
  }
}
```

---

## 🚀 Usage in `main.ts`

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT');
  await app.listen(port);
}
bootstrap();
```

---

## 🧪 Testing

Mock the environment in `.env.test`, or override in CI with `export VAR=value`.

```bash
NODE_ENV=test PORT=4000 nest start
```

---

## 🧷 Best Practices

* ✅ Validate all required variables
* ✅ Separate environments (`.env.production`, `.env.development`)
* ✅ Use namespaces for modular config
* ✅ Load only what is needed using `forFeature()`
* ✅ Avoid direct access to `process.env` outside config files

