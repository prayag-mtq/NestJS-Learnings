## 🔒 Encryption and Hashing

### 🔐 Encryption (AES-256-CTR)

```ts
// encryption.util.ts
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const iv = randomBytes(16);
const password = 'Password used to generate key';

const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;

const cipher = createCipheriv('aes-256-ctr', key, iv);
const encryptedText = Buffer.concat([cipher.update('Nest'), cipher.final()]);

const decipher = createDecipheriv('aes-256-ctr', key, iv);
const decryptedText = Buffer.concat([
  decipher.update(encryptedText),
  decipher.final(),
]);
```

> 📌 `crypto` is Node.js native. No extra dependency required.

---

### 🧂 Hashing with bcrypt

```bash
npm i bcrypt
npm i -D @types/bcrypt
```

```ts
// hashing.util.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashingService {
  private readonly saltOrRounds = 10;

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltOrRounds);
  }

  async comparePassword(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
  }
}
```

> 🔐 Hashing is **one-way**, unlike encryption.

---

## 🛡️ Helmet - Secure HTTP Headers

### ✅ Install

```bash
npm i helmet
```

### ⚙️ Apply in Main File (Express)

```ts
// main.ts
import helmet from 'helmet';

app.use(helmet());
```

### 🚧 CSP for Apollo GraphQL

```ts
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        imgSrc: [
          "'self'",
          'data:',
          'apollo-server-landing-page.cdn.apollographql.com',
        ],
        scriptSrc: ["'self'", 'https:', "'unsafe-inline'"],
        manifestSrc: [
          "'self'",
          'apollo-server-landing-page.cdn.apollographql.com',
        ],
        frameSrc: ["'self'", 'sandbox.embed.apollographql.com'],
      },
    },
  }),
);
```

---

## 🌐 CORS - Cross-Origin Resource Sharing

### ✅ Default Enable

```ts
const app = await NestFactory.create(AppModule);
app.enableCors();
```

### 🛠️ With Config

```ts
app.enableCors({
  origin: 'https://yourfrontend.com',
  credentials: true,
});
```

### 💡 Alternate Syntax

```ts
const app = await NestFactory.create(AppModule, {
  cors: {
    origin: ['https://frontend.com'],
    credentials: true,
  },
});
```

---

## 🛡️ CSRF Protection

### 🧱 With Express

```bash
npm i csrf-csrf
```

```ts
// main.ts
import { doubleCsrf } from 'csrf-csrf';

const { doubleCsrfProtection } = doubleCsrf({
  getSecret: () => 'a secret',
  cookieName: 'x-csrf-token',
  size: 64,
});

app.use(doubleCsrfProtection);
```

> ⚠️ Requires `cookie-parser` or `session` middleware beforehand.

---

### 🛡️ With Fastify

```bash
npm i @fastify/csrf-protection
```

```ts
import fastifyCsrf from '@fastify/csrf-protection';

await app.register(fastifyCsrf);
```

> ⚠️ Requires compatible session or storage plugin.

---

## 📁 File Placement Recommendations

```bash
src/
├── security/
│   ├── encryption.util.ts        # AES encryption helpers
│   ├── hashing.util.ts           # bcrypt helpers
│   ├── helmet.config.ts          # Helmet setup (optional)
│   ├── cors.config.ts            # CORS setup
│   └── csrf.config.ts            # CSRF protection logic
```

---

## 🧪 Usage Summary

| Feature    | File                 | Purpose                          |
| ---------- | -------------------- | -------------------------------- |
| Encryption | `encryption.util.ts` | Reversible data protection       |
| Hashing    | `hashing.util.ts`    | One-way password hashing         |
| Helmet     | `helmet.config.ts`   | Sets HTTP security headers       |
| CORS       | `cors.config.ts`     | Enables cross-origin requests    |
| CSRF       | `csrf.config.ts`     | Prevents forged browser requests |
