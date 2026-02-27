# HTTP Status Codes & Error Handling Guide

This guide documents the HTTP status codes used throughout the Bibliotheque API, best practices for error responses, and when to use each status code.

---

## Status Code Categories

### 2xx Success Codes

These indicate the request succeeded as expected.

| Code    | Status     | Usage                                                             | Example                                 |
| ------- | ---------- | ----------------------------------------------------------------- | --------------------------------------- |
| **200** | OK         | Default response for successful GET, PUT, PATCH, login operations | Retrieve user profile, login successful |
| **201** | Created    | Resource creation success (POST)                                  | New user registered, book created       |
| **204** | No Content | Successful operations with no response body                       | Delete book, delete author              |

---

### 4xx Client Error Codes

These indicate the client made an error in the request. The client **should not** retry without modification.

| Code    | Status               | Meaning                                                                                 | API Usage                                              | Response Example                                                          |
| ------- | -------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| **400** | Bad Request          | Invalid request format, missing fields, validation failure, or business logic violation | Duplicate email, invalid ISBN, missing required fields | `{"detail": "Email already registered"}`                                  |
| **401** | Unauthorized         | Authentication missing or invalid (no token or expired token)                           | Missing Bearer token, invalid/expired JWT              | `{"detail": "Not authenticated"}`                                         |
| **403** | Forbidden            | Resource exists but access denied (insufficient permissions)                            | User tries to delete another user's book               | `{"detail": "Not enough permissions"}`                                    |
| **404** | Not Found            | Requested resource does not exist                                                       | Book ID doesn't exist, user not found                  | `{"detail": "Book not found"}`                                            |
| **409** | Conflict             | Request conflicts with current state (duplicate/constraint violation)                   | Duplicate ISBN for user, duplicate author name         | `{"detail": "This ISBN already exists in your library"}`                  |
| **422** | Unprocessable Entity | Validation error in request body (Pydantic validation)                                  | Invalid email format, negative book year               | `{"detail": [{"loc": ["body", "email"], "msg": "invalid email format"}]}` |

---

### 5xx Server Error Codes

These indicate the **server** made an error while processing a valid request. The client **may** retry.

| Code    | Status                | Meaning                                                     | API Usage                            | Response Example                                |
| ------- | --------------------- | ----------------------------------------------------------- | ------------------------------------ | ----------------------------------------------- |
| **500** | Internal Server Error | Unexpected server error                                     | Unhandled exception in route handler | `{"detail": "Internal server error"}`           |
| **503** | Service Unavailable   | Server temporarily unable to process (DB down, maintenance) | Database connection failure          | `{"detail": "Service temporarily unavailable"}` |

---

## Error Response Format

All error responses should follow a consistent format:

```json
{
  "detail": "Human-readable error message"
}
```

### For Validation Errors (422)

FastAPI automatically returns detailed validation errors:

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

---

## When to Use Each Status Code in Bibliotheque

### Authentication & Authorization

- **401 Unauthorized**: Token missing → `raise HTTPException(status_code=401, detail="Not authenticated")`
- **401 Unauthorized**: Token invalid/expired → `raise HTTPException(status_code=401, detail="Invalid authentication credentials")`
- **403 Forbidden**: User tries to access another user's book → `raise HTTPException(status_code=403, detail="Not enough permissions")`

### Resource Operations

- **201 Created**: User successfully registered or resource created → `response.status_code = 201`
- **200 OK**: Successful GET, PUT, login operation
- **204 No Content**: Successful DELETE operation → `status_code=204`
- **404 Not Found**: Resource doesn't exist → `raise HTTPException(status_code=404, detail="Book not found")`

### Validation & Business Logic

- **400 Bad Request**: Email already registered → `raise HTTPException(status_code=400, detail="Email already registered")`
- **400 Bad Request**: ISBN already exists → `raise HTTPException(status_code=400, detail="ISBN already exists in your library")`
- **400 Bad Request**: Author name already exists → `raise HTTPException(status_code=400, detail="Author already exists")`
- **422 Unprocessable Entity**: Pydantic validation fails (automatic from FastAPI)

---

## Best Practices

### ✅ DO

1. **Use appropriate status codes** — Choose the most specific code that matches the situation
2. **Include clear error messages** — `"detail"` should explain what went wrong and (optionally) how to fix it
3. **Return 201 for creation** — Always use 201 when a resource is successfully created
4. **Return 204 for deletion** — Use 204 for successful DELETE with no response body
5. **Use 400 for business logic errors** — Duplicate email, invalid ISBN, constraint violations
6. **Be consistent** — Always use the same error format across all endpoints

### ❌ DON'T

1. **Return 200 for all responses** — Use appropriate success codes (201, 204)
2. **Use 500 for client errors** — 500 is only for unexpected server failures
3. **Include sensitive data in errors** — Don't expose database details, file paths, or system information
4. **Use vague error messages** — "Error" or "Failed" are not helpful; be specific
5. **Return HTML in error responses** — Always return JSON for API endpoints
6. **Use 404 to hide resource existence** — If permission is the issue, use 403 instead

---

## FastAPI Error Handling Pattern

### Basic Error Response

```python
from fastapi import HTTPException, status

# 400 Bad Request
raise HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Email already registered"
)

# 404 Not Found
raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Book not found"
)

# 401 Unauthorized
raise HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid authentication credentials",
    headers={"WWW-Authenticate": "Bearer"}
)
```

### Setting Status Code on Response

```python
from fastapi.responses import JSONResponse

# 201 Created
return JSONResponse(
    status_code=status.HTTP_201_CREATED,
    content={"id": user.id, "email": user.email}
)

# 204 No Content
response = Response(status_code=status.HTTP_204_NO_CONTENT)
return response
```

---

## Common Scenarios

### User Registration

| Scenario               | Status | Detail                       |
| ---------------------- | ------ | ---------------------------- |
| Success                | 201    | Created                      |
| Email already exists   | 400    | `"Email already registered"` |
| Invalid email format   | 422    | (Pydantic validation)        |
| Missing required field | 422    | (Pydantic validation)        |

### Create Book

| Scenario            | Status | Detail                                  |
| ------------------- | ------ | --------------------------------------- |
| Success             | 201    | Created                                 |
| ISBN already exists | 400    | `"ISBN already exists in your library"` |
| Author not found    | 404    | `"Author not found"`                    |
| Unauthenticated     | 401    | `"Not authenticated"`                   |
| Invalid book data   | 422    | (Pydantic validation)                   |

### Delete Book

| Scenario          | Status | Detail                     |
| ----------------- | ------ | -------------------------- |
| Success           | 204    | No Content                 |
| Book not found    | 404    | `"Book not found"`         |
| Not owner of book | 403    | `"Not enough permissions"` |
| Unauthenticated   | 401    | `"Not authenticated"`      |

### Login

| Scenario            | Status | Detail                          |
| ------------------- | ------ | ------------------------------- |
| Success             | 200    | OK (with token)                 |
| Invalid credentials | 401    | `"Incorrect email or password"` |
| User not found      | 401    | `"Incorrect email or password"` |

---

## HTTP Status Code Summary Table

```
1xx: Informational (Request received, continuing process)
     100 Continue, 101 Switching Protocols

2xx: Success (Action received and processed successfully)
     200 OK
     201 Created
     204 No Content

3xx: Redirection (Further action required)
     301 Moved Permanently
     302 Found
     304 Not Modified

4xx: Client Error (Invalid request)
     400 Bad Request
     401 Unauthorized
     403 Forbidden
     404 Not Found
     409 Conflict
     422 Unprocessable Entity

5xx: Server Error (Server failed to fulfill request)
     500 Internal Server Error
     503 Service Unavailable
```

---

## RFC References

- [RFC 7231 - HTTP Semantics and Content](https://tools.ietf.org/html/rfc7231) — Defines 1xx-5xx status codes
- [RFC 7235 - HTTP Authentication](https://tools.ietf.org/html/rfc7235) — Defines 401/403
- [REST API Best Practices](https://restfulapi.net/http-status-codes/) — Common REST patterns

---

## See Also

- [Bibliotheque API Documentation](./API.md)
- [Bibliotheque DEVELOPMENT.md](../server/DEVELOPMENT.md)
- [Security Guidelines](../SECURITY.md)
