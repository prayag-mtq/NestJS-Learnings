# 📘 NestJS Versioning Guide

Versioning in NestJS allows you to support multiple API versions simultaneously. This is crucial for applications that undergo breaking changes while still needing to support older versions.

> ⚠️ This only applies to **HTTP-based applications**.

---

## 🤔 Why Versioning?

- Maintain **backward compatibility**
- Enable smooth **transition for clients** to newer versions
- Avoid breaking changes affecting existing consumers

---

## 🧩 Versioning Types

| Type       | Description                                                    |
| ---------- | -------------------------------------------------------------- |
| URI        | Default. Adds version in URL path like `/v1/cats`              |
| Header     | Uses a custom header (e.g., `Custom-Header: 1`)                |
| Media Type | Version defined in `Accept` header like `application/json;v=2` |
| Custom     | Uses custom logic to extract version from any request property |

All types use the enum `VersioningType` from `@nestjs/common`.

---

## ⚙️ Enabling Versioning in `main.ts`

### 📌 URI Versioning (Default)

```ts
app.enableVersioning({
  type: VersioningType.URI,
});
```

Set a custom prefix or disable it:

```ts
app.enableVersioning({
  type: VersioningType.URI,
  prefix: 'v', // or false to disable
});
```

### 📌 Header Versioning

```ts
app.enableVersioning({
  type: VersioningType.HEADER,
  header: 'Custom-Header',
});
```

### 📌 Media Type Versioning

```ts
app.enableVersioning({
  type: VersioningType.MEDIA_TYPE,
  key: 'v=', // Accept: application/json;v=2
});
```

### 📌 Custom Versioning

```ts
const extractor = (req: Request): string[] =>
  [req.headers['custom-version'] ?? '']
    .flatMap((v) => v.split(','))
    .filter(Boolean)
    .sort()
    .reverse();

app.enableVersioning({
  type: VersioningType.CUSTOM,
  extractor,
});
```

---

## 🎯 Applying Versions

### ✅ Versioned Controller

```ts
@Controller({ version: '1' })
export class CatsControllerV1 {
  @Get('cats')
  findAll() {
    return 'V1 cats';
  }
}
```

### ✅ Versioned Routes

```ts
@Controller()
export class CatsController {
  @Version('1')
  @Get('cats')
  findAllV1() {
    return 'V1 cats';
  }

  @Version('2')
  @Get('cats')
  findAllV2() {
    return 'V2 cats';
  }
}
```

### ✅ Multiple Versions

```ts
@Controller({ version: ['1', '2'] })
export class CatsController {
  @Get('cats')
  findAll() {
    return 'Available in V1 and V2';
  }
}
```

### ✅ Version Neutral

```ts
@Controller({ version: VERSION_NEUTRAL })
export class NeutralController {
  @Get('health')
  check() {
    return 'Accessible from any version';
  }
}
```

---

## 🛠 Default Version

```ts
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1', // Or VERSION_NEUTRAL or array ['1', '2']
});
```

---

## 🧱 Middleware Versioning

Apply middleware only for specific versioned routes:

```ts
consumer.apply(LoggerMiddleware).forRoutes({
  path: 'cats',
  method: RequestMethod.GET,
  version: '2',
});
```

---

## 📁 File Structure

```bash
src/
├── main.ts                # Enable versioning here
├── cats/
│   ├── cats.controller.ts # Versioned controllers and routes
├── common/
│   └── middleware/
│       └── logger.middleware.ts # Middleware for versioned routes
```

---

## 🧪 Examples

### 🔍 URI Request Example

```
GET /v1/cats
GET /v2/cats
```

### 🔍 Header Version Request Example

```
GET /cats
Custom-Header: 2
```

### 🔍 Media Type Version Request Example

```
GET /cats
Accept: application/json;v=2
```

### 🔍 Custom Versioning Request Example

```
GET /cats
custom-version: 3,2,1
```

