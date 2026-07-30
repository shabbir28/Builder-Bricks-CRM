# API Reference - Real Estate CRM

This document provides detailed information about the API endpoints available in the Real Estate CRM backend.

## Base URL
The API is served at `http://localhost:5000/api` in development.

## Authentication
Most endpoints require a valid JSON Web Token (JWT) in the `Authorization` header.

**Format:** `Authorization: Bearer <your_jwt_token>`

### Auth Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new agent/user. | No |
| `POST` | `/auth/login` | Login and receive a JWT token. | No |
| `GET` | `/auth/me` | Get the profile of the current logged-in user. | Yes |

## Leads Management
Endpoints for managing potential customers.

### `GET /leads`
Retrieves a list of all leads. Supports pagination and filtering.
- **Query Params**: `status`, `priority`, `page`, `limit`.
- **Response**: `200 OK` with an array of lead objects.

### `POST /leads`
Creates a new lead.
- **Body**: `{ name, email, phone, status, budget, ... }`
- **Response**: `201 Created` with the new lead object.

### `GET /leads/kanban`
Retrieves leads grouped by their pipeline stage for the Kanban board view.

## Property Management
Endpoints for managing real estate listings.

### `GET /properties`
Retrieves all properties.
- **Response**: `200 OK`

### `POST /properties`
Creates a new property listing. Supports image uploads via `multipart/form-data`.
- **Body**: Uses `FormData` to include fields like `title`, `description`, `price`, and `images`.

## Deals & Pipeline
Track sales progress and revenue.

### `GET /deals`
Lists all active and closed deals.

### `GET /deals/pipeline/data`
Aggregates deal data for visualization in charts.

## Activities & Tasks
Scheduled events and to-do items.

### `GET /activities/today/list`
Fetch all activities scheduled for the current date.

---

## Error Handling
The API returns standard HTTP status codes:
- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Validation error or invalid input
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions (e.g., agent trying to access admin route)
- `404 Not Found`: Resource does not exist
- `500 Internal Server Error`: Server-side issues
