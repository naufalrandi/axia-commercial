# Axia Administrative Microservice

A Node.js microservice for administrative functions built with Express.js and Sequelize ORM.

## Features

- Express.js REST API
- PostgreSQL database with Sequelize ORM
- JWT authentication
- Input validation with Joi
- Structured logging with Winston
- CORS support
- Database migrations and seeding

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and other configuration.

4. Run database migrations:
   ```bash
   npm run migrate
   ```

5. Seed the database (optional):
   ```bash
   npm run seed
   ```

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run migrate` - Run database migrations
- `npm run migrate:undo` - Undo all migrations
- `npm run seed` - Run database seeders
- `npm run seed:undo` - Undo all seeders
- `npm run migrate:undo:seed` - Undo migrations, re-run migrations, and seed

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Authentication
- `GET /api/auth/login` - Login endpoint
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Project Structure

```
src/
├── config/
│   └── database.js          # Database configuration
├── controllers/             # Route controllers
├── middleware/
│   └── auth.js             # Authentication middleware
├── models/                  # Sequelize models
├── routes/
│   ├── auth.js             # Authentication routes
│   └── users.js              # User routes
├── utils/
│   └── validation.js       # Input validation schemas
└── index.js                # Application entry point

config/
└── database.js             # Sequelize CLI configuration

migrations/                  # Database migrations
seeders/                    # Database seeders
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time
- `CORS_ORIGIN` - CORS allowed origin
- `LOG_LEVEL` - Logging level

## Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. The server will start on `http://localhost:3000`

3. Check health status: `GET http://localhost:3000/health`

## Database

This project uses PostgreSQL with Sequelize ORM. Make sure PostgreSQL is running and create a database for the application.

### Migrations

Create a new migration:
```bash
npx sequelize-cli migration:generate --name migration-name
```

### Models

Create new models in the `src/models/` directory and update `src/models/index.js` to include them.

## License

ISC
