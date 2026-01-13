Authentication and Frontend Integration Documentation

Overview

This document summarizes the features we implemented today, focusing on Django backend authentication with JWT, rate limiting, CSRF/HTTPS enforcement, and Next.js frontend integration. It also explains how to use the endpoints and test them.

Features Implemented

1. Django Login View with JWT

Endpoint: /accounts/login/

Method: POST

Description: Authenticates a user with username and password.

Response: Returns both access and refresh JWT tokens.

Rate Limiting: 15 requests per 15 minutes.

2. JWT Issuance Without User Details

Endpoints:

/accounts/get_jwt_token_by_api_key/ → Issues tokens based on a valid API key.

/accounts/get_jwt_token_by_client_id/ → Issues tokens based on a client ID query parameter.

Method: GET

Description: Provides JWT tokens without requiring user authentication.

Response: Returns access and refresh tokens with custom claims (e.g., scope, client_id).

3. Security Enhancements

CSRF Protection: Enabled via CsrfViewMiddleware and CSRF cookies.

HTTPS Enforcement: Configured with SECURE_SSL_REDIRECT, CSRF_COOKIE_SECURE, SESSION_COOKIE_SECURE, and HSTS.

Best Practices: Short access token lifetimes, refresh token rotation, and blacklist support.

4. Testing with Django

Created unit tests using APITestCase.

Verified login success, login failure, authenticated token retrieval, and unauthenticated access rejection.

Confirmed test suite runs successfully with 4 passing tests.

5. Frontend Integration (Next.js)

Implemented a login form with React hooks (useState, useEffect).

Added handleLogin function to send credentials to /login/ endpoint.

Stored JWT tokens in localStorage for reuse.

Corrected issues with event listeners, form submission, and JSX className usage.

How to Use

Login Flow

Frontend: Submit username and password via form.

Backend: /accounts/login/ authenticates and returns JWT tokens.

Frontend: Store tokens securely (e.g., localStorage or cookies).

Authenticated Requests: Include Authorization: Bearer <access_token> header.

Token Retrieval Without User

API Key Flow:

GET /accounts/get_jwt_token_by_api_key/?api_key=MY_SUPER_SECRET_KEY

Client ID Flow:

GET /accounts/get_jwt_token_by_client_id/?client_id=frontend123

Example Frontend Login Request

const handleLogin = async (e) => {
  e.preventDefault();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (res.ok && data.responseCode === 0) {
    localStorage.setItem("accessToken", data.data.access);
    localStorage.setItem("refreshToken", data.data.refresh);
  } else {
    console.error("Login failed:", data.responseMessage);
  }
};

Testing

Run tests with:

python manage.py test accounts

Expected output:

Creating test database for alias 'default'...
System check identified no issues (0 silenced).
....
----------------------------------------------------------------------
Ran 4 tests in 12.049s

OK
Destroying test database for alias 'default'...

Summary

We built a robust authentication system with Django and JWT, added rate limiting, CSRF/HTTPS security, created unit tests, and integrated with a Next.js frontend. The system now supports both user‑based and API key/client ID‑based token issuance, making it flexible and secure for different use cases.