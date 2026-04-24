# AGENTS.md - Agendaapp

## Architecture

- **Monorepo**: `backend/` (Spring Boot) + `frontend/` (React Native/Expo)
- **Backend**: Spring Boot 4.0.5, Java 17, Maven, MySQL, JWT auth
- **Frontend**: Expo SDK 54, React Native 0.81, React Navigation 7

## Commands

### Backend
```bash
cd backend && ./mvnw spring-boot:run   # Start backend (requires MySQL running)
```

### Frontend
```bash
cd frontend && npm start              # Start Expo dev server
npm run web                           # Run web target
```

## Setup Requirements

- **MySQL** must be running locally (used by backend for JPA)
- Backend connects to `root:password@localhost:3306/agenda` (check application.properties for actual config)

## Design System

`design-system/agendaapp/MASTER.md` contains the design rules:
- Primary: `#0891B2` (cyan), CTA: `#059669` (green)
- Font: DM Sans (Google Fonts)
- **No emojis** - use SVG icons only (Heroicons/Lucide)
- Accessible: 4.5:1 contrast, 44x44px touch targets

## API Endpoints

Backend runs on port 8080 (default). Key endpoints:
- `/api/auth/*` - Authentication (login, register)
- `/api/turnos/*` - Appointment management
- `/api/pacientes/*` - Patient management
- `/api/admin/*` - Admin functions

## Testing

Backend has tests using Spring Boot test dependencies. Run via Maven:
```bash
cd backend && ./mvnw test
```