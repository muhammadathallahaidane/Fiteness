# API Documentation

Base URL: `https://aidane.site`

## Authentication

### Register User
`POST /users/register`

Request Body:
```json
{
  "username": "string",
  "email": "string", 
  "password": "string"
}
```
Responses:
- `201 Created`: `{ id, username, email }`
- `400 Bad Request`: missing/invalid fields or duplicate username/email
- `500 Internal Server Error`

### Login User
`POST /users/login`

Request Body:
```json
{
  "email": "string",
  "password": "string"
}
```
Responses:
- `200 OK`: `{ access_token: string, username: string, email: string }`
- `400 Bad Request`: missing fields
- `401 Unauthorized`: invalid email or password
- `500 Internal Server Error`

### Google Login
`POST /users/google-login`

Request Body:
```json
{ "idToken": "string" }
```
Responses:
- `200 OK`: `{ access_token: string, user: { username: string, email: string } }`
- `400 Bad Request`: missing or invalid idToken
- `500 Internal Server Error`

### Strava Login
`POST /users/strava-login`

Request Body:
```json
{ "code": "string" }
```
Responses:
- `200 OK`: `{ access_token: string, user: { username: string, email: string } }`
- `400 Bad Request`: missing authorization code or Strava credentials not configured
- `500 Internal Server Error`

---

## Protected Endpoints
All following endpoints require `Authorization: Bearer <token>` header.

### Body Parts

#### Get All Body Parts
`GET /bodyParts`

Responses:
- `200 OK`: array of `{ id: number, name: string }`
- `401 Unauthorized`: missing or invalid token
- `500 Internal Server Error`

---

### Equipment

#### Get All Equipment
`GET /equipments`

Responses:
- `200 OK`: array of `{ id: number, name: string }`
- `401 Unauthorized`: missing or invalid token
- `500 Internal Server Error`

---

### Workout Lists

#### Create Workout List
`POST /workoutLists`

Request Body:
```json
{
  "BodyPartId": number,
  "equipmentIds": [number],
  "name": "string"
}
```
Note: `equipmentIds` must be an array with 0 to 2 items maximum.

Responses:
- `201 Created`: workout list object with user, body part, and generated exercises
- `400 Bad Request`: validation errors (missing fields, invalid equipmentIds array)
- `404 Not Found`: BodyPart or equipment not found
- `500 Internal Server Error`: AI generation error

#### Get All Workout Lists
`GET /workoutLists`

Responses:
- `200 OK`: array of workout lists for the authenticated user, including body parts and exercises with equipment
- `401 Unauthorized`: missing or invalid token
- `500 Internal Server Error`

#### Get Workout List by ID
`GET /workoutLists/:id`

Responses:
- `200 OK`: workout list object with body part and exercises
- `401 Unauthorized`: missing or invalid token
- `404 Not Found`: workout list not found or not authorized
- `500 Internal Server Error`

#### Update Exercise Repetitions
`PATCH /workoutLists/:workoutListId/exercises/:exerciseId`

Request Body:
```json
{
  "sets": number,
  "repetitions": number
}
```
Note: Either `sets` or `repetitions` is required (can provide both).

Responses:
- `200 OK`: `{ message: string, exercise: object }`
- `400 Bad Request`: missing sets/repetitions
- `401 Unauthorized`: missing or invalid token
- `404 Not Found`: workout list or exercise not found
- `500 Internal Server Error`

#### Delete Workout List
`DELETE /workoutLists/:id`

Responses:
- `200 OK`: `{ message: "Workout list deleted successfully" }`
- `401 Unauthorized`: missing or invalid token
- `404 Not Found`: workout list not found or not authorized
- `500 Internal Server Error`

---

## Data Models

### User
```json
{
  "id": number,
  "username": "string",
  "email": "string",
  "StravaId": "string" // optional, for Strava users
}
```

### Body Part
```json
{
  "id": number,
  "name": "string"
}
```

### Equipment
```json
{
  "id": number,
  "name": "string"
}
```

### Exercise
```json
{
  "id": number,
  "name": "string",
  "steps": "string", // detailed instructions with numbering
  "sets": number,
  "repetitions": number,
  "youtubeUrl": "string",
  "EquipmentId": number,
  "Equipment": { // included in responses
    "id": number,
    "name": "string"
  }
}
```

### Workout List
```json
{
  "id": number,
  "name": "string",
  "UserId": number,
  "BodyPartId": number,
  "createdAt": "string",
  "updatedAt": "string",
  "User": { // included in create response
    "id": number,
    "username": "string",
    "email": "string"
  },
  "BodyPart": {
    "id": number,
    "name": "string"
  },
  "Exercises": [Exercise] // array of exercises
}
```

---

## Error Format
All error responses return JSON:
```json
{ "message": "Error description" }
```

## Notes
- All workout list operations are user-scoped (users can only access their own workout lists)
- AI generates 5 exercises per workout list using Gemini API
- Equipment is distributed evenly across generated exercises
- Strava integration allows login with Strava OAuth flow
