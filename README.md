# Unabanda Backoffice

Admin panel for managing the Unabanda event management platform.

## Features

- **Dashboard** - Analytics and statistics overview
- **User Management** - Create, edit, delete, and manage user roles
- **Event Management** - Full CRUD operations for events and functions
- **Ticket Management** - Create and manage ticket types for events
- **Booking Management** - View and manage all bookings
- **Settings** - System configuration (coming soon)

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Date Utilities**: date-fns

## Prerequisites

- Node.js 16+ and npm
- Backend API running (see main project README)

## Installation

1. **Navigate to the backoffice directory**
   ```bash
   cd backoffice
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:
   - `VITE_API_BASE_URL` - URL of your backend API (default: http://localhost:8000)

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

To preview the production build:
```bash
npm run preview
```

## Project Structure

```
backoffice/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── common/      # Common components (ProtectedRoute, etc.)
│   │   └── forms/       # Form components
│   ├── context/         # React context providers
│   │   ├── AuthContext.tsx
│   │   └── NotificationContext.tsx
│   ├── layouts/         # Layout components
│   │   └── MainLayout.tsx
│   ├── pages/           # Page components
│   │   ├── Auth/        # Authentication pages
│   │   ├── Dashboard/   # Dashboard and settings
│   │   ├── Users/       # User management
│   │   ├── Events/      # Event management
│   │   ├── Tickets/     # Ticket management
│   │   └── Bookings/    # Booking management
│   ├── services/        # API service layer
│   │   └── api.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── .env.example         # Environment variables template
├── package.json
└── README.md
```

## Usage

### Login

1. Navigate to `http://localhost:5173/login`
2. Enter admin credentials
3. Only users with the `admin` role can access the backoffice

### Dashboard

The dashboard provides an overview of:
- Total users, events, bookings, and revenue
- Events by category (pie chart)
- Revenue by month (bar chart)
- Recent bookings table

### User Management

- **List Users**: View all registered users
- **Create User**: Add new users with specific roles (admin, creator, end_user)
- **Edit User**: Update user information and roles
- **Delete User**: Remove users from the system

### Event Management

- **List Events**: View all events (not just own events)
- **Create Event**: Add new events with functions/shows
- **Edit Event**: Update event details
- **Publish Event**: Change event status from draft to published
- **Delete Event**: Remove events

### Ticket Management

- **List Tickets**: View all tickets across all events
- **Create Ticket**: Add ticket types to events
- **Edit Ticket**: Update ticket pricing and availability
- **Delete Ticket**: Remove ticket types

### Booking Management

- **List Bookings**: View all bookings in the system
- **View Details**: See complete booking information
- **Cancel Booking**: Cancel pending or confirmed bookings

## API Integration

The backoffice communicates with the backend API at the URL specified in `VITE_API_BASE_URL`.

### Authentication

- Login credentials are sent to `/api/auth/login`
- Access tokens are stored in localStorage
- Tokens are automatically refreshed when expired
- Protected routes redirect to login if not authenticated

### API Endpoints Used

See the main project README for complete API documentation.

## Development

### Running Tests

```bash
npm run test
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run type-check
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_BASE_URL | Backend API base URL | http://localhost:8000 |

## Security Considerations

- Only admin users can access the backoffice
- JWT tokens are used for authentication
- Tokens are stored in localStorage (consider using httpOnly cookies in production)
- All API requests include authentication headers
- Auto-refresh of expired tokens

## Deployment

### Vercel/Netlify

1. Build the project: `npm run build`
2. Deploy the `dist/` folder
3. Configure environment variables in the hosting platform
4. Ensure the API base URL is correctly set for production

### Docker

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Troubleshooting

### Login Issues

- Ensure the backend API is running
- Check that `VITE_API_BASE_URL` is correctly configured
- Verify your user has the `admin` role

### API Connection Issues

- Check browser console for errors
- Verify CORS is enabled on the backend
- Ensure the API URL includes the correct protocol (http/https)

### Build Issues

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## License

[Your License Here]

## Support

For issues and questions, please open an issue in the main repository.
