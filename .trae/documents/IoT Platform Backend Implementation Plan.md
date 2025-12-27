# IoT Platform Backend Development Plan

Based on the project structure and requirements, I will implement the backend in the following phases:

## Phase 1: Infrastructure & Configuration
1.  **Dependencies**: Install required packages (`express`, `mysql2`, `dotenv`, `cors`, `morgan`, `jsonwebtoken`, `bcryptjs`, `amqplib`, `@influxdata/influxdb-client`).
2.  **Configuration**:
    *   Implement `config/mysql.js` to setup MySQL connection pool.
    *   Implement `config/influxdb.js` for InfluxDB connection.
    *   Create `config/rabbitmq.js` for RabbitMQ connection.
    *   Update `utils/response.js` to match API docs (`message: "ok"`).
3.  **Application Entry**:
    *   Implement `app.js` to initialize Express, middlewares (CORS, Body Parser, Logging), and mount routes.
    *   Setup `routes/index.js` and `routes/v1/index.js`.

## Phase 2: Core Modules Implementation (Layered Architecture)
I will implement each module following the `Route -> Controller -> Service -> DAO` pattern.

### 2.1 User & Authentication Module
*   **DAO**: `dao/user.dao.js` (findByUsername, create, etc.)
*   **Service**: `services/auth.service.js` (login, refresh), `services/user.service.js` (CRUD).
*   **Controller**: `controllers/auth.controller.js`, `controllers/user.controller.js`.
*   **Routes**: `routes/v1/auth.js`, `routes/v1/users.js`.

### 2.2 Asset Management Module (Split Services)
*   **DAO**: `dao/cleanroom.dao.js`, `dao/gateway.dao.js`, `dao/device.dao.js`.
*   **Services**:
    *   `services/cleanroom.service.js`: Manage cleanrooms.
    *   `services/gateway.service.js`: Manage gateways and gateway-cleanroom relations.
    *   `services/device.service.js`: Manage devices.
*   **Controllers**: `controllers/cleanroom.controller.js`, `controllers/gateway.controller.js`, `controllers/device.controller.js`.
*   **Routes**: `routes/v1/cleanrooms.js`, `routes/v1/gateways.js`, `routes/v1/devices.js`.

### 2.3 Telemetry Module
*   **Service**: `services/telemetry.service.js` (Query InfluxDB).
*   **Controller**: `controllers/telemetry.controller.js` (Latest values, History).
*   **Routes**: Add telemetry routes to `devices.js` and `cleanrooms.js` as specified.

### 2.4 Command & Control Module
*   **DAO**: `dao/command.dao.js` (Log commands to MySQL).
*   **Service**: `services/command.service.js` (Save to DB + Push to RabbitMQ).
*   **Controller**: `controllers/command.controller.js`.
*   **Routes**: `routes/v1/commands.js` and mount device command route.

### 2.5 System & Maintenance
*   **Controller**: `controllers/system.controller.js` (Health check).
*   **Routes**: `routes/v1/system.js` (Health endpoint).

## Phase 3: Verification
*   Verify server startup.
*   Test Health Check endpoint.
*   Test Login and Token verification.
