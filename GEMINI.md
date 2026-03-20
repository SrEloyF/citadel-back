# Citadel Backend (citadel-back)

A robust RESTful API built with Express.js and Sequelize for a wine commerce platform.

## Project Overview

`citadel-back` is designed with a modular Controller-Service-Model (CSM) architecture, emphasizing code reusability and security.

### Main Technologies
- **Framework:** Express.js (v5.x)
- **ORM:** Sequelize (MySQL/PostgreSQL support)
- **Authentication:** JSON Web Tokens (JWT) & CSRF Protection
- **Authorization:** Role-based access control (RBAC) - e.g., 'A' for Admin, 'U' for regular users
- **Storage:** Cloudflare R2 (S3 compatible) via `aws-sdk`, see `services/storageService.js`.
- **Logging:** Pino & Pino-HTTP
- **Testing:** Jest & Supertest
- **Deployment:** Optimized for Vercel (`vercel.json`, `api/index.js`)

## Building and Running

### Environment Setup
Create a `.env` file based on the required configurations (DB, JWT, R2, CORS).

### Key Commands
- `npm install`: Install project dependencies.
- `npm run dev`: Start the development server with `nodemon`.
- `npm start`: Start the production server.
- `npm test`: Execute the test suite using Jest.
- `npx sequelize-cli db:migrate`: Execute migrations to DB.

## Development Conventions

### Architecture
- **Controllers:** All controllers should extend `BaseController` to inherit standard CRUD operations and ownership-based logic.
- **Services:** All services should extend `BaseService`. They must define `this.allowedFields` and `this.allowedUpdateFields` for data sanitization.
- **Routes:** Use `generateCrudRoutes` from `BaseRoutes.js` for standard CRUD endpoints. Use specific directories (`routes/admin`, `routes/public`, `routes/authenticated-users`) to organize access levels.

### Resource Ownership
To restrict access to a user's own resources (e.g., shopping carts, profiles), configure `ownershipConfig` in the Service:
- **Direct:** The model has a field (e.g., `id_usuario`) pointing directly to the user.
- **Join:** Ownership is verified through a related model.

### Security & Validation
- **Authentication:** Apply `authMiddleware` to protected routes.
- **CSRF:** Apply `verifyCsrf` to state-changing routes (POST, PUT, DELETE, PATCH).
- **Validation:** Use `validators/modelValidator.js` to ensure request bodies match Sequelize model definitions before processing.
- **Error Handling:** Use specialized error classes (`NotFoundError`, `BadRequestError`, `OwnershipError`) found in `validators/`.

### Storage Pattern
- Always use `services/storageService.js` for file operations.
- The `VinoService` demonstrates a pattern for automatic cleanup of unused images in R2 when records are updated or deleted.

### Database
- Use Sequelize migrations for all schema changes (`migrations/`).
- Follow the naming convention: `PascalCase` for Models, `snake_case` for database tables and fields.
- Plural names for tables, singular names for models - e.g., modelName: `Usuario` and tableName: `usuarios`

## Directory Structure Highlights
- `auth/`: Security configuration (JWT, CSRF, Roles).
- `config/`: Application and storage configuration.
- `controllers/`: Request handlers extending `BaseController`.
- `services/`: Business logic extending `BaseService`.
- `models/`: Sequelize model definitions.
- `routes/`: Express route definitions, organized by access level.
- `tests/`: Automated tests (flows and unit tests).
- `validators/`: Custom error types and schema validation logic.


## Coding style
- Use 2 indentation spaces
- Do not force architectural changes unless there is a clear reason.
- Avoid unnecessary duplication.
- Maintain a clear and traceable data flow.