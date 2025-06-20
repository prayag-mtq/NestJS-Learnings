# 🚀 NestJS CLI & Libraries: Comprehensive Guide
---

## 📁 File Structure

```bash
project-root/
├── apps/                     # Application-type projects (in monorepo)
├── libs/                     # Nest libraries (reusable modules)
├── node_modules/
├── package.json
├── nest-cli.json             # CLI config with project references
├── tsconfig.json             # Root tsconfig
└── ...
```

---

## 🛠️ CLI Installation

```bash
npm install -g @nestjs/cli
```

Also install locally for consistent team usage:

```bash
npm install -D @nestjs/cli
```

---

## 🧪 CLI Scripts (Recommended)

```json
"scripts": {
  "build": "nest build",
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:debug": "nest start --debug --watch"
}
```

Use via:

```bash
npm run build
npm run start
```

---

## 🧱 CLI Command Reference

### 📦 `nest new`

Creates a new standard-mode NestJS project.

```bash
nest new <project-name>
```

**Options**:

- `--dry-run`, `-d`
- `--skip-git`, `-g`
- `--skip-install`, `-s`
- `--package-manager`, `-p`
- `--strict` (enables strict TypeScript mode)

---

### 🧬 `nest generate` / `nest g`

Scaffold code components or projects.

```bash
nest g <schematic> <name> [options]
```

**Common Schematics**:

| Name         | Alias | Description                     |
| ------------ | ----- | ------------------------------- |
| `app`        |       | Generate new app in monorepo    |
| `library`    | `lib` | Generate new library (monorepo) |
| `module`     | `mo`  | Generate module                 |
| `service`    | `s`   | Generate service                |
| `controller` | `co`  | Generate controller             |
| `pipe`       | `pi`  | Generate pipe                   |
| `guard`      | `gu`  | Generate guard                  |

**Options**:

- `--flat`
- `--spec` / `--no-spec`
- `--project` / `-p`

---

### 🔧 `nest build`

Builds the project using `tsc`, `swc`, or `webpack`.

```bash
nest build <project-name> [options]
```

**Options**:

- `--watch`, `-w`
- `--builder tsc|swc|webpack`
- `--path` (tsconfig path)
- `--all` (build all projects)

---

### 🚀 `nest start`

Compiles and starts an app.

```bash
nest start <project-name> [options]
```

**Options**:

- `--watch`, `-w`
- `--debug`, `-d`
- `--builder`
- `--env-file` (load `.env`)

---

### ➕ `nest add`

Installs a Nest library and runs its schematic.

```bash
nest add <library-name>
```

---

### 🔍 `nest info`

Display versions of installed NestJS-related packages and environment info.

```bash
nest info
```

---

## 🧱 Libraries in Monorepo

### ✨ Creating a Library

```bash
nest g library my-library
```

- Prompted for prefix (e.g., `@app`) → used in path alias
- Creates under `libs/my-library`

**Generated structure**:

```bash
libs/
└── my-library/
    ├── src/
    │   ├── index.ts
    │   ├── my-library.module.ts
    │   └── my-library.service.ts
    └── tsconfig.lib.json
```

**`nest-cli.json`** will contain:

```json
"my-library": {
  "type": "library",
  "root": "libs/my-library",
  "entryFile": "index",
  "sourceRoot": "libs/my-library/src",
  "compilerOptions": {
    "tsConfigPath": "libs/my-library/tsconfig.lib.json"
  }
}
```

### 🧩 Using Library in App

Import module using alias:

```ts
import { MyLibraryModule } from '@app/my-library';
```

**Path mappings in `tsconfig.json`**:

```json
"paths": {
  "@app/my-library": ["libs/my-library/src"],
  "@app/my-library/*": ["libs/my-library/src/*"]
}
```

### 🏗️ Build the Library

```bash
nest build my-library
```

---

## 📌 DevOps & Compiler Details

- **`nest build`** wraps `tsc`, `swc`, or `webpack`

  - Supports path mapping via `tsconfig-paths`
  - Recommended for standard workflows

- **`nest start`** compiles and runs using local `node` binary

- **Globally installed CLI** is used only for `nest new` and `nest generate`

- Use **local `@nestjs/cli`** + `package.json` scripts for consistent builds

---

## ✅ Summary Table

| Command      | Purpose                           | Usage                      |
| ------------ | --------------------------------- | -------------------------- |
| `nest new`   | Create new Nest project           | `nest new my-app`          |
| `nest g`     | Generate components/libraries     | `nest g service user`      |
| `nest build` | Compile app or lib                | `nest build my-app`        |
| `nest start` | Run app                           | `nest start my-app`        |
| `nest add`   | Install a library                 | `nest add @nestjs/swagger` |
| `nest info`  | Show environment and version info | `nest info`                |

---

## 📎 Notes

- Libraries **cannot run standalone**; must be imported into an app
- Apps can be built with `webpack` by default in monorepo
- `nest-cli.json` governs how each project is compiled

> 🧠 Use monorepos + libraries to modularize large enterprise systems
