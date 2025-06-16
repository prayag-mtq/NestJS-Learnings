##  Project Structure
```
src/
    ├── app.controller.spec.ts
    ├── app.controller.ts
    ├── app.module.ts
    ├── app.service.ts
    ├── main.ts
```

`app.controller.spec.ts`
The unit tests for the controller.

`app.controller.ts`
A basic controller with a single route

`app.module.ts`
The root module fo the app

`app.service.ts`
A basic service with a single method

`main.ts` 
The entry file of the application which uses the core function NestFactory to create a Nest application instance.


#### `What is NestFactory?`
- To create a Nest application instance, we use the core NestFactory class. `NestFactory` exposes a few static methods that allow creating an application instance. 
- The `create()` method returns an application object, which fulfills the INestApplication interface.

#### `Run the Application`
```bash
  npm run start 
```
This command starts the app with the HTTP server listening on the port defined in the src/main.ts file. Once the application is running, open your browser and navigate to http://localhost:3000/. You should see the Hello World! message.

### Note
To watch for changes in your files, you can run the following command to start the application:
```
$ npm run start:dev
```
This command will watch your files, automatically recompiling and reloading the server.

#### `Linting and formatting`
Nest project comes with a preinstalled code linter and formatter

```
  # Lint and autofix with eslint
  npm run lint

  # Format with prettier
  npm run format
```