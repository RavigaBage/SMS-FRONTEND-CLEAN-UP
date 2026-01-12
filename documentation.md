
# School Management System – Login Feature Documentation

## Overview

This project implements a secure **login system** for a School Management System using **Django** for the backend and **Next.js** for the frontend.

The system includes:

* Custom user model with roles (`admin`, `bursar`, `teacher`, `student`, `parent`)
* Secure password hashing
* JWT authentication for API security
* Rate limiting to prevent brute force attacks
* Frontend login page with form validation


## Project Structure

### Backend (`/backend`)

* `accounts/models.py` – Defines the custom `SmsUser` model
* `accounts/managers.py` – User manager for secure user creation
* `accounts/serializers.py` – DRF serializers with validation
* `accounts/views.py` – API endpoints for registration and login
* `backend/settings.py` – Configures JWT, CORS, and middleware
* `venv/` – Python virtual environment for dependency isolation

### Frontend (`/frontend`)

* `pages/login/login.js` – Login page component
* `public/images/` – Folder for static images used in frontend
* Uses `next/image` for optimized image handling


## Backend Components

### 1. Custom User Model (`SmsUser`)

Fields:

* `username`: `varchar(50)`, unique, not null
* `password_hash`: securely hashed with Django’s `pbkdf2_sha256`
* `email`: `varchar(100)`, unique
* `role`: enum (`admin`, `bursar`, `teacher`, `student`, `parent`)
* `created_at`: timestamp, default `now()`

**Key functions:**

* `set_password(password)` – hashes a raw password before saving
* `check_password(password)` – verifies a raw password against stored hash

**Security notes:**

* Passwords are **never stored in plaintext**
* Hashing includes random salt and multiple iterations
* `check_password()` must always be used instead of manual comparison


### 2. User Creation (Safe & Secure)

Two safe methods for creating users:

1. Using the manager:

```python
SmsUser.objects.create_user(
    username="custer1",
    password="custer1",
    email="custer@gmail.com",
    role="student"
)
```

2. Using `set_password()`:

```python
user = SmsUser(username="custer1", email="custer@gmail.com", role="student")
user.set_password("custer1")
user.save()
```

**Safe checks implemented:**

* Pre-check for existing username/email
* Handles `IntegrityError` if duplicates exist
* Uses Django model validation and serializers


### 3. JWT Authentication

* `rest_framework_simplejwt.authentication.JWTAuthentication` used
* Login endpoint issues:

  * `access` token (short-lived)
  * `refresh` token (long-lived)
* Frontend sends JWT with API requests to authenticate user
* Prevents storing session data in the backend


### 4. Rate Limiting

* `ratelimit` package applied to login endpoint
* Limits requests by IP (e.g., `5 requests per minute`)
* Prevents brute-force attacks

```python
from ratelimit.decorators import ratelimit

@ratelimit(key="ip", rate="5/m", block=True)
def login_view(request):
    ...
```


### 5. Django Admin

* Admin interface used to view users, roles, and timestamps
* Users can be created, edited, or deleted safely
* Ensures hashed passwords remain secure


## Frontend Components

### 1. Login Page (`login.js`)

Key features:

* React `useState` for form input tracking
* `handleSubmit` function sends login credentials to backend
* Inputs:

  * Username
  * Password
* Form submits to API endpoint (later connected to JWT login)

Example snippet:

```javascript
<form onSubmit={handleSubmit}>
  <input
    type="text"
    placeholder="Username"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
  />
  <input
    type="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
  <button type="submit">Login</button>
</form>
```

### 2. Styling

* External CSS can be loaded via `import "../styles/login.css"`
* `next/image` used for optimized static images
* Hot-reload enabled with `next dev`


## Workflow

### 1. Local Development

* Activate virtual environment:

```bash
venv\Scripts\activate
```

* Install dependencies:

```bash
pip install -r requirements.txt
```

* Run Django backend:

```bash
python manage.py runserver
```

* Run Next.js frontend:

```bash
npm run dev
```

* Access login page at:

```
http://localhost:3000/login/login
```

### 2. User Registration

* Checks for duplicates (username/email)
* Password is hashed before saving
* User roles are enforced
* On success, user stored securely in DB

### 3. Login

* User enters username and password
* Backend verifies using `check_password()` or `authenticate()`
* If valid:

  * JWT token returned
  * Rate limiter prevents abuse
* If invalid:

  * Error message returned


## Security Features

1. **Password Hashing**

   * Salted and iterated (`pbkdf2_sha256`)
   * `check_password()` compares hashes safely
2. **JWT Authentication**

   * Stateless and secure
3. **Rate Limiting**

   * Prevents brute-force login attempts
4. **Unique Constraints**

   * Database enforces uniqueness for username and email
5. **Safe User Creation**

   * Pre-checks prevent duplicates and errors


## Next Steps

1. Connect frontend form to backend login API
2. Store JWT in frontend (e.g., `localStorage` or cookies)
3. Add role-based route guards
4. Implement logout and token refresh
5. Add email verification and password reset
