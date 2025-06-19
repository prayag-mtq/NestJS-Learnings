# 🕒 NestJS Task Scheduling Guide

NestJS provides powerful and flexible task scheduling capabilities via the `@nestjs/schedule` package. This enables you to execute arbitrary methods:

- At specific times (using cron expressions)
- At regular intervals (like every 10 seconds)
- Once after a delay (timeout)
- Dynamically at runtime

---

## ⚙️ Installation

```bash
npm install --save @nestjs/schedule
```

Then, register `ScheduleModule` in your root `AppModule`:

```ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
})
export class AppModule {}
```

---

## ⏲️ Declarative Scheduling

### 📆 Cron Jobs

Use `@Cron()` to run a method based on a cron pattern:

```ts
@Cron('45 * * * * *')
handleCron() {
  this.logger.debug('Runs every minute at 45 seconds');
}
```

#### 🧠 Cron Syntax

```
* * * * * *
| | | | | |
| | | | | day of week
| | | | month
| | | day of month
| | hour
| minute
second (optional)
```

#### ⏱ Common Patterns (CronExpression Enum)

```ts
@Cron(CronExpression.EVERY_30_SECONDS)
```

#### 🧾 One-Time Execution

```ts
@Cron(new Date(Date.now() + 10_000)) // 10 seconds after app start
```

#### 🔧 Options

```ts
@Cron('* * 0 * * *', {
  name: 'nightJob',
  timeZone: 'Europe/Paris',
  waitForCompletion: true,
})
```

---

### 🔁 Intervals

```ts
@Interval(10000)
handleInterval() {
  this.logger.debug('Runs every 10 seconds');
}
```

With name:

```ts
@Interval('heartbeat', 5000)
```

---

### ⏳ Timeouts

```ts
@Timeout(5000)
handleTimeout() {
  this.logger.debug('Runs once after 5 seconds');
}
```

With name:

```ts
@Timeout('startupTask', 3000)
```

---

## 🧬 Dynamic API (SchedulerRegistry)

Import and inject:

```ts
constructor(private schedulerRegistry: SchedulerRegistry) {}
```

### 🌀 Dynamic Cron Jobs

```ts
addCronJob(name: string, second: string) {
  const job = new CronJob(`${second} * * * * *`, () => {
    this.logger.warn(`Cron ${name} triggered at ${second}s`);
  });

  this.schedulerRegistry.addCronJob(name, job);
  job.start();
}
```

```ts
const job = this.schedulerRegistry.getCronJob('nightJob');
job.stop();
console.log(job.nextDates());
```

Delete:

```ts
deleteCron(name: string) {
  this.schedulerRegistry.deleteCronJob(name);
}
```

---

### ⏲ Dynamic Intervals

Create:

```ts
addInterval(name: string, ms: number) {
  const interval = setInterval(() => {
    this.logger.warn(`Interval ${name} at ${ms}ms`);
  }, ms);

  this.schedulerRegistry.addInterval(name, interval);
}
```

Get & Clear:

```ts
const interval = this.schedulerRegistry.getInterval('heartbeat');
clearInterval(interval);
```

---

### ⏱ Dynamic Timeouts

Create:

```ts
addTimeout(name: string, ms: number) {
  const timeout = setTimeout(() => {
    this.logger.warn(`Timeout ${name} after ${ms}ms`);
  }, ms);

  this.schedulerRegistry.addTimeout(name, timeout);
}
```

Get & Clear:

```ts
const timeout = this.schedulerRegistry.getTimeout('startupTask');
clearTimeout(timeout);
```

---

## 📁 File Structure

```bash
src/
├── app.module.ts              # Register ScheduleModule
├── tasks/
│   ├── tasks.service.ts       # @Cron, @Interval, @Timeout
│   └── dynamic.controller.ts  # Runtime job control
```

