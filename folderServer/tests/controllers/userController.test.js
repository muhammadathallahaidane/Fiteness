const request = require("supertest");
const { User } = require("../../models");
const { createTestUser } = require("../helpers/testHelpers");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

// Mock environment variables SEBELUM import app
process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
process.env.JWT_SECRET = "test-jwt-secret";

// Mock Google OAuth dan Axios
jest.mock("google-auth-library");
jest.mock("axios");

// Create mock instance
const mockVerifyIdToken = jest.fn();
const mockOAuth2Client = {
  verifyIdToken: mockVerifyIdToken,
};

// Mock constructor
OAuth2Client.mockImplementation(() => mockOAuth2Client);

// Import app SETELAH setup mock dan environment
const app = require("../../app");

describe("User Controller", () => {
  describe("POST /users/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/users/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.username).toBe(userData.username);
      expect(response.body.email).toBe(userData.email);
      expect(response.body).not.toHaveProperty("password");

      // Verify user exists in database
      const user = await User.findOne({ where: { email: userData.email } });
      expect(user).toBeTruthy();
    });

    it("should return 400 when required fields are missing", async () => {
      const response = await request(app)
        .post("/users/register")
        .send({ username: "testuser" })
        .expect(400);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe(
        "Username, email, and password are required"
      );
    });

    it("should return 400 when username is missing", async () => {
      const response = await request(app)
        .post("/users/register")
        .send({ email: "test@example.com", password: "password123" })
        .expect(400);

      expect(response.body.message).toBe(
        "Username, email, and password are required"
      );
    });

    it("should return 400 when email is missing", async () => {
      const response = await request(app)
        .post("/users/register")
        .send({ username: "testuser", password: "password123" })
        .expect(400);

      expect(response.body.message).toBe(
        "Username, email, and password are required"
      );
    });

    it("should return 400 when password is missing", async () => {
      const response = await request(app)
        .post("/users/register")
        .send({ username: "testuser", email: "test@example.com" })
        .expect(400);

      expect(response.body.message).toBe(
        "Username, email, and password are required"
      );
    });
  });

  describe("POST /users/login", () => {
    it("should login successfully with valid credentials", async () => {
      const testUser = await createTestUser();

      const response = await request(app)
        .post("/users/login")
        .send({
          email: testUser.user.email,
          password: "password123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("access_token");
      expect(response.body).toHaveProperty("username");
      expect(response.body).toHaveProperty("email");
    });

    it("should return 400 when email is missing", async () => {
      const response = await request(app)
        .post("/users/login")
        .send({ password: "password123" })
        .expect(400);

      expect(response.body.message).toBe("Email and password are required");
    });

    it("should return 400 when password is missing", async () => {
      const response = await request(app)
        .post("/users/login")
        .send({ email: "test@example.com" })
        .expect(400);

      expect(response.body.message).toBe("Email and password are required");
    });

    it("should return 401 with invalid email", async () => {
      const response = await request(app)
        .post("/users/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123",
        })
        .expect(401);

      expect(response.body.message).toBe("Invalid email or password");
    });

    it("should return 401 with invalid password", async () => {
      const testUser = await createTestUser();

      const response = await request(app)
        .post("/users/login")
        .send({
          email: testUser.user.email,
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body.message).toBe("Invalid email or password");
    });
  });

  describe("POST /users/google-login", () => {
    beforeEach(() => {
      mockVerifyIdToken.mockClear();
    });

    it("should login successfully with valid Google token", async () => {
      // Setup mock response
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          email: "google@example.com",
          name: "Google User",
        }),
      });

      const response = await request(app)
        .post("/users/google-login")
        .send({ idToken: "valid-google-token" })
        .expect(200);

      expect(response.body).toHaveProperty("access_token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe("google@example.com");
      expect(response.body.user.username).toBe("google"); // username dari email
    });

    it("should return 400 when idToken is missing", async () => {
      const response = await request(app)
        .post("/users/google-login")
        .send({})
        .expect(400);

      expect(response.body.message).toBe("Google ID token is required");
    });

    it("should handle Google verification error", async () => {
      mockVerifyIdToken.mockRejectedValue(new Error("Invalid token"));

      const response = await request(app)
        .post("/users/google-login")
        .send({ idToken: "invalid-token" })
        .expect(500);

      expect(response.body.message).toBe("Internal Server Error");
    });

    it("should create new user if not exists", async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          email: "newgoogle@example.com",
          name: "New Google User",
        }),
      });

      const response = await request(app)
        .post("/users/google-login")
        .send({ idToken: "valid-google-token" })
        .expect(200);

      expect(response.body.user.email).toBe("newgoogle@example.com");
      expect(response.body.user.username).toBe("newgoogle");

      // Verify user was created in database
      const user = await User.findOne({
        where: { email: "newgoogle@example.com" },
      });
      expect(user).toBeTruthy();
    });
  });

  describe("POST /users/strava-login", () => {
    beforeEach(() => {
      axios.post.mockClear();
    });

    it("should login successfully with valid Strava code", async () => {
      axios.post.mockResolvedValue({
        data: {
          access_token: "strava-token",
          athlete: {
            id: 12345,
            username: "stravauser",
            firstname: "Strava",
            lastname: "User",
            email: "strava@example.com",
          },
        },
      });

      const response = await request(app)
        .post("/users/strava-login")
        .send({ code: "valid-strava-code" })
        .expect(200);

      expect(response.body).toHaveProperty("access_token");
      expect(response.body).toHaveProperty("user");
    });

    it("should return 400 when code is missing", async () => {
      const response = await request(app)
        .post("/users/strava-login")
        .send({})
        .expect(400);

      expect(response.body.message).toBe(
        "Strava authorization code is required"
      );
    });

    it("should handle Strava API error", async () => {
      axios.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: "Invalid authorization code" },
        },
      });

      await request(app)
        .post("/users/strava-login")
        .send({ code: "invalid-code" })
        .expect(400);
    });

    it("should handle missing athlete data", async () => {
      axios.post.mockResolvedValue({
        data: {
          access_token: "strava-token",
          athlete: null,
        },
      });

      const response = await request(app)
        .post("/users/strava-login")
        .send({ code: "valid-code" })
        .expect(400);

      expect(response.body.message).toBe("Invalid athlete data from Strava");
    });

    it("should return 400 when Strava credentials are not configured", async () => {
      // Temporarily remove Strava credentials
      const originalClientId = process.env.STRAVA_CLIENT_ID;
      const originalClientSecret = process.env.STRAVA_CLIENT_SECRET;

      delete process.env.STRAVA_CLIENT_ID;
      delete process.env.STRAVA_CLIENT_SECRET;

      const response = await request(app)
        .post("/users/strava-login")
        .send({ code: "valid-code" })
        .expect(400);

      expect(response.body.message).toBe("Strava credentials not configured");

      // Restore credentials
      process.env.STRAVA_CLIENT_ID = originalClientId;
      process.env.STRAVA_CLIENT_SECRET = originalClientSecret;
    });

    it("should handle username collision and create unique username", async () => {
      // Create a user with the username that would conflict
      await User.create({
        username: "stravauser",
        email: "existing@example.com",
        password: "password123",
      });

      axios.post.mockResolvedValue({
        data: {
          access_token: "strava-token",
          athlete: {
            id: 67890,
            username: "stravauser", // This will conflict with existing user
            firstname: "Strava",
            lastname: "User",
            email: "newstrava@example.com",
          },
        },
      });

      const response = await request(app)
        .post("/users/strava-login")
        .send({ code: "valid-strava-code" })
        .expect(200);

      expect(response.body).toHaveProperty("access_token");
      expect(response.body).toHaveProperty("user");

      // Verify the username was made unique
      const createdUser = await User.findOne({
        where: { email: "newstrava@example.com" },
      });
      expect(createdUser.username).toBe("stravauser_1"); // Should be stravauser_1, not Strava_User_1
    });

    it("should update existing user with Strava ID when user exists without Strava ID", async () => {
      // Create existing user without Strava ID
      const existingUser = await User.create({
        username: "existinguser",
        email: "existing@strava.com",
        password: "password123",
      });

      axios.post.mockResolvedValue({
        data: {
          access_token: "strava-token",
          athlete: {
            id: 99999,
            username: "existinguser",
            firstname: "Existing",
            lastname: "User",
            email: "existing@strava.com",
          },
        },
      });

      const response = await request(app)
        .post("/users/strava-login")
        .send({ code: "valid-strava-code" })
        .expect(200);

      expect(response.body).toHaveProperty("access_token");
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe("existing@strava.com");

      // Verify Strava ID was updated
      const updatedUser = await User.findByPk(existingUser.id);
      expect(updatedUser.StravaId).toBe("99999");
    });
  });
});
