# School Administration System API

Backend API for importing school administration CSV data, managing classes, listing students, and reporting teacher workload.

## Project Contents

| Path | Description |
| --- | --- |
| `typescript/` | Express and TypeScript API source |
| `typescript/database/DDL.sql` | MySQL schema loaded by Docker Compose |
| `external/` | Bundled external student service used by the API |
| `data.sample.csv` | Sample CSV import data |
| `school-administration-system.postman_collection.json` | Postman collection for local API testing |

## Prerequisites

- NodeJS `v22.22.2`
- Docker
- npm

## Environment

Create the local environment file from the repository root:

```bash
cp typescript/.env.sample typescript/.env
```

The sample values are ready for the default Docker Compose setup:

| Variable | Value |
| --- | --- |
| `PORT` | `3000` |
| `DB_HOST` | `localhost` |
| `DB_PORT` | `33306` |
| `DB_SCHEMA` | `school-administration-system` |
| `DB_USER` | `root` |
| `DB_PW` | `password` |
| `EXTERNAL_STUDENT_SERVICE_URL` | `http://localhost:5000` |

The sample file also contains optional logging and database pool settings.

## Local Setup

Run the application from the `typescript` directory:

```bash
cd typescript
npm install
npm start
```

`npm start` starts the Docker services, then launches the API server with `ts-node`.

The local services are exposed on:

| Service | URL |
| --- | --- |
| API server | `http://localhost:3000` |
| MySQL | `localhost:33306` |
| External student service | `http://localhost:5000` |

## Database

The schema is defined in `typescript/database/DDL.sql`.

Docker Compose mounts `typescript/database` into `/docker-entrypoint-initdb.d`, so MySQL creates the schema automatically the first time the database container starts.

To recreate the database from scratch:

```bash
cd typescript
docker compose down
npm start
```

## API Endpoints

All application routes are mounted under `/api`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/healthcheck` | API health check |
| `POST` | `/api/upload` | Upload CSV data using multipart field `data` |
| `GET` | `/api/class/:classCode/students?offset=0&limit=10` | Return local and external students in one paginated list |
| `PUT` | `/api/class/:classCode` | Rename a class with body `{ "className": "..." }` |
| `GET` | `/api/reports/workload` | Return teacher workload grouped by subject |

The bundled external service exposes:

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `http://localhost:5000/students?class=P1-1&offset=0&limit=10` | Return external students for a class |

## Quick Checks

Check the API server:

```bash
curl http://localhost:3000/api/healthcheck
```

Check the external student service:

```bash
curl "http://localhost:5000/students?class=P1-1&offset=0&limit=2"
```

Upload the sample CSV:

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "data=@../data.sample.csv;type=text/csv"
```

List students for a class:

```bash
curl "http://localhost:3000/api/class/P1-1/students?offset=0&limit=10"
```

Rename a class:

```bash
curl -X PUT http://localhost:3000/api/class/P1-1 \
  -H "Content-Type: application/json" \
  -d '{"className":"P1 Integrity Updated"}'
```

Get the workload report:

```bash
curl http://localhost:3000/api/reports/workload
```

## CSV Upload

Upload CSV files to `POST /api/upload` with multipart form field name `data`.

The expected columns are:

```text
teacherEmail,teacherName,studentEmail,studentName,classCode,classname,subjectCode,subjectName,toDelete
```

`toDelete` must be `0` or `1`.

| Value | Meaning |
| --- | --- |
| `0` | Add or keep the student/class membership active |
| `1` | Deactivate the student/class membership |

The importer deduplicates teachers, students, classes, subjects, and teacher/class/subject assignments. For repeated student/class rows, the last row in the CSV decides whether the membership is active.

## Postman

Import `school-administration-system.postman_collection.json` into Postman for the same local checks.

The collection defines these variables:

| Variable | Default |
| --- | --- |
| `baseUrl` | `http://localhost:3000/api` |
| `externalBaseUrl` | `http://localhost:5000` |
| `classCode` | `P1-1` |
| `offset` | `0` |
| `limit` | `10` |
| `renamedClassName` | `P1 Integrity Updated` |

## Development

Run the API in watch mode:

```bash
cd typescript
npm run start:dev
```

Run verification checks:

```bash
cd typescript
npm test -- --runInBand
npm run build:ts
npm run lint
```

## Troubleshooting

If the API starts before MySQL is ready, the first `npm start` can fail with a Sequelize connection error. Run `npm start` again after the database container finishes booting.

If `/api/class/:classCode/students` or `/api/upload` fails while contacting external students, confirm the external service is running:

```bash
docker compose ps
curl "http://localhost:5000/students?class=P1-1&offset=0&limit=1"
```
