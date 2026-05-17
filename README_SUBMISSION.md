# Submission Notes

## How to run

### Backend (Nest.js)

```bash
cd backend
npm run start:dev
```

- Backend: `http://127.0.0.1:3002`
- Swagger: `http://127.0.0.1:3002/api-docs`

### Frontend (Next.js)

```bash
npm run dev
```

- Frontend: `http://127.0.0.1:3000`

## Login

JWT login endpoint:

- `POST /auth/login`

Seeded accounts (password: `123456`):

- `admin@example.com`
- `manager@example.com`
- `test@example.com`

## Responsive layout

Pages use MUI v7 breakpoints and a shared `PageContainer` wrapper to adapt spacing and max width across devices.

## Postman + Swagger docs

- Postman: `backend/postman/`
- Swagger export: `backend/docs/openapi.json`

