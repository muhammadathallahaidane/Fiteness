# Fiteness - AI-Powered Fitness Workout Generator

A full-stack fitness application that generates personalized workout routines using AI. Built with React.js frontend and Express.js backend, integrating Google Gemini AI for intelligent exercise recommendations and Strava API for fitness tracking connectivity.

## Tech Stack

**Frontend (React Client):**
- React 19.1.0 with Vite
- Redux Toolkit for state management
- React Router for navigation
- SweetAlert2 for notifications
- Axios for API communication
- CSS modules for styling

**Backend (Express Server):**
- Express.js 5.1.0 with Node.js
- PostgreSQL with Sequelize ORM
- Google Gemini AI for exercise generation
- JWT authentication with bcryptjs
- Strava API integration
- Jest for comprehensive testing

**Authentication & APIs:**
- Google OAuth integration
- Strava OAuth integration
- JWT-based session management
- Third-party API integration

## Features

**AI-Powered Workout Generation**
- Custom exercise generation using Google Gemini AI
- Equipment-based workout planning (up to 2 equipment types)
- Body part specific training programs
- 5 exercises per workout with detailed instructions

**User Authentication**
- Traditional email/password registration and login
- Google OAuth integration
- Strava OAuth integration for fitness enthusiasts
- Secure JWT token management

**Workout Management**
- Create personalized workout lists
- Target specific body parts
- Select from available equipment
- Edit exercise sets and repetitions
- Delete and manage workout routines

**Exercise Tracking**
- Detailed exercise instructions with step-by-step guidance
- Set and repetition customization
- YouTube video references for proper form
- Progress tracking capabilities

**Third-Party Integrations**
- Strava connectivity for athletes
- Google authentication for seamless access
- AI-generated content for workout variety

## Architecture

The application follows a modern full-stack architecture:

- **Frontend**: React SPA with Redux for centralized state management
- **Backend**: RESTful API server with Express.js
- **Database**: PostgreSQL with Sequelize ORM for data modeling
- **AI Integration**: Google Gemini API for intelligent exercise generation
- **Authentication**: Multi-provider OAuth with JWT tokens
- **Testing**: Comprehensive test coverage with Jest

## Project Structure

```
├── folderClient/fiteness/        # React frontend application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Application pages/screens
│   │   ├── store/               # Redux store and slices
│   │   └── styles/              # CSS styling
│   └── package.json
└── folderServer/                # Express backend server
    ├── controllers/             # Request handlers
    ├── models/                  # Sequelize models
    ├── routes/                  # API endpoints
    ├── helpers/                 # Utility functions
    ├── middlewares/             # Custom middleware
    ├── tests/                   # Test suites
    └── migrations/              # Database migrations
```

## Data Models

**Core Entities:**
- Users with multi-provider authentication
- Body Parts for targeted training
- Equipment for workout customization
- Exercises with AI-generated content
- Workout Lists for routine management

**Relationships:**
- Users have many Workout Lists
- Workout Lists belong to Body Parts
- Exercises belong to Equipment and Workout Lists
- Many-to-many relationships for equipment selection

## Key Implementations

- Google Gemini AI integration for exercise content generation
- Multi-provider OAuth authentication (Google, Strava, traditional)
- PostgreSQL database with Sequelize ORM
- RESTful API design with comprehensive error handling
- Redux state management with async thunks
- Comprehensive test coverage with Jest
- Database migrations and seeders for development
- JWT middleware for protected routes
- Form validation and user input sanitization

## Testing

The backend includes comprehensive test coverage with Jest, including:
- Controller unit tests
- API endpoint integration tests
- Authentication flow testing
- Database operation testing
- Error handling validation
