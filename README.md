// README.md
# Personal Finance Tracker

A full-stack application for tracking personal finances, focusing on money given to and received from others.

## Features

- User authentication with email verification
- Track money given to and received from people
- Dashboard with analytics and visualizations
- Person-specific transaction history
- Export data as CSV
- Secure storage with PostgreSQL

## Technology Stack

### Backend
- Node.js with Express.js
- PostgreSQL database
- Sequelize ORM
- JWT authentication

### Frontend
- React.js
- Tailwind CSS
- Recharts for data visualization
- React Router for navigation

## Setup Instructions

### Prerequisites
- Node.js (v14 or later)
- PostgreSQL (v12 or later)
- npm or yarn

### Backend Setup
1. Clone the repository
2. Navigate to the project backend directory
3. Copy `.env.example` to `.env` and update with your configuration
4. Install dependencies: `npm install`
5. Run database migrations: `npx sequelize-cli db:migrate`
6. Start the server: `npm run dev`

### Frontend Setup
1. Navigate to the project frontend directory
2. Copy `.env.example` to `.env` and update with your configuration
3. Install dependencies: `npm install`
4. Start the development server: `npm start`

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password (protected)
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### People Endpoints
- `POST /api/people` - Create a person (protected)
- `GET /api/people` - Get all people (protected)
- `GET /api/people/top` - Get top people by balance (protected)
- `GET /api/people/:id` - Get a specific person (protected)
- `PUT /api/people/:id` - Update a person (protected)
- `DELETE /api/people/:id` - Delete a person (protected)
- `GET /api/people/:id/transactions` - Get all transactions for a person (protected)

### Transaction Endpoints
- `POST /api/transactions` - Create a transaction (protected)
- `GET /api/transactions` - Get all transactions (protected)
- `GET /api/transactions/export` - Export transactions as CSV (protected)
- `GET /api/transactions/dashboard` - Get dashboard statistics (protected)
- `GET /api/transactions/person/:personId/stats` - Get person-specific stats (protected)
- `GET /api/transactions/:id` - Get a specific transaction (protected)
- `PUT /api/transactions/:id` - Update a transaction (protected)
- `DELETE /api/transactions/:id` - Delete a transaction (protected)

## License
MIT

## Contributors
[Your Name]