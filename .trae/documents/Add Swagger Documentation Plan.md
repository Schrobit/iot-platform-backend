# Add Swagger Documentation Plan

I will integrate Swagger (OpenAPI 3.0) documentation into the existing Node.js Express backend.

## Phase 1: Setup & Configuration
1.  **Install Dependencies**: `npm install swagger-jsdoc swagger-ui-express`
2.  **Create Configuration**: Create `config/swagger.js` to define:
    *   OpenAPI version (3.0.0)
    *   Basic Info (Title, Version, Description)
    *   Servers (Base URL)
    *   Security Schemes (Bearer Auth)
    *   Reusable Components/Schemas (User, Cleanroom, Gateway, Device, etc. based on `init.sql` and API docs)
3.  **Integrate in App**: Update `app.js` to serve Swagger UI at `/api-docs`.

## Phase 2: Annotate Routes (JSDoc)
I will add `@swagger` annotations to the following route files:

1.  **Auth & Users**:
    *   `routes/v1/auth.js`: Login, Refresh, Me.
    *   `routes/v1/users.js`: Create, List, Update, Reset Password.
2.  **Assets**:
    *   `routes/v1/cleanrooms.js`: CRUD, List Gateways, Telemetry.
    *   `routes/v1/gateways.js`: CRUD, Relation with Cleanrooms.
    *   `routes/v1/devices.js`: CRUD, Telemetry, Commands.
3.  **Others**:
    *   `routes/v1/commands.js`: List, Detail.
    *   `routes/v1/system.js`: Health Check.

## Phase 3: Verification
*   Start the server.
*   Verify `/api-docs` endpoint returns the Swagger UI.
