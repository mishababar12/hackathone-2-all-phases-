# Data Model: Phase 2 Web Application

## Entities

### User
Represents a unique account in the system.
- `id`: `String` (Primary Key, UUID/BetterAuth ID)
- `email`: `String` (Unique, Indexed)
- `hashed_password`: `String`
- `name`: `String` (Optional)
- `created_at`: `DateTime`
- `updated_at`: `DateTime`

### Task
Represents an individual todo item.
- `id`: `Integer` (Primary Key, Auto-increment)
- `user_id`: `String` (Foreign Key -> User.id, Indexed)
- `title`: `String` (Max 200 chars, Not Null)
- `description`: `Text` (Optional)
- `completed`: `Boolean` (Default: false)
- `created_at`: `DateTime`
- `updated_at`: `DateTime`

## Relationships
- **User -> Task**: One-to-Many (A user can have many tasks; a task belongs to exactly one user).

## Security Invariants
1. A Task MUST always have a valid `user_id`.
2. Queries for Tasks MUST always filter by the `user_id` of the authenticated request.
