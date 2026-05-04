# Register Submission

## Contract Table

| Trigger | Request | Processing | Response |
| --- | --- | --- | --- |
| User fills in name, email, and password, then clicks Register. | `POST /api/register` with `firstName`, `username`, and `password`. | The frontend validates the password rules first. The backend checks whether the username already exists in `auth_user.json`, hashes the password with bcrypt, and appends the new user record. | `201 Created` with the new user summary. If the username already exists, return `409 Conflict`. If the password is invalid, return `400 Bad Request`. |

## Activity Diagram

```mermaid
flowchart TD
  A([Start]) --> B[User opens register page]
  B --> C[Enter name, email, password]
  C --> D{Password valid?}
  D -- No --> E[Show validation error]
  E --> C
  D -- Yes --> F[Send POST /api/register]
  F --> G{Username exists in auth_user.json?}
  G -- Yes --> H[Return 409 Conflict]
  H --> I[Show error message]
  G -- No --> J[Hash password with bcrypt]
  J --> K[Save new user in auth_user.json]
  K --> L[Return 201 Created]
  L --> M[Show success message]
  M --> N([End])
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant R as Express Route
    participant C as Controller
    participant S as Service
    participant D as Data Store

    U->>F: Click Register
    F->>F: Validate password rules
    F->>R: POST /api/register
    R->>C: Forward request body
    C->>S: registerUser(data)
    S->>D: isUsernameTaken(email)
    alt Username exists
        D-->>S: true
        S-->>C: 409 Conflict
        C-->>R: Error response
        R-->>F: 409 Conflict
    else Username available
        D-->>S: false
        S->>D: createUser(data)
        D-->>S: New user record
        S-->>C: 201 Created
        C-->>R: Success response
        R-->>F: 201 Created
    end
```

## GenAI Prompt

Use this prompt to generate or explain the feature:

> Build a Node.js and Express registration flow for a furniture shop. The frontend must request a user's name, email username, and password, and validate that the password has at least 8 characters, one uppercase letter, and one special character from `! @ # $ % ^ & *`. The backend should expose `POST /api/register`, check `auth_user.json` for an existing username, return `409 Conflict` if the email already exists, hash the password with bcrypt, save the new user back to `auth_user.json`, and return `201 Created` with the new user summary. Add concise comments that explain the frontend validation, backend duplicate check, hashing, and file write steps.
