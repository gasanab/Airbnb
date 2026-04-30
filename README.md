# Airbnb API - Authentication & File Upload System

A complete REST API for an Airbnb-like platform with authentication, authorization, email notifications, and file upload capabilities.

## Features

### Authentication & Authorization
- User registration with role-based access (GUEST, HOST, ADMIN)
- JWT-based authentication
- Password hashing with bcrypt
- Password reset via email
- Role-based route protection

### Email Notifications
- Welcome emails on registration
- Booking confirmation emails
- Booking cancellation emails
- Password reset emails

### File Upload & Management
- User avatar upload/delete
- Listing photo upload/delete (up to 5 per listing)
- Cloudinary integration for image storage
- Image optimization utilities

### Booking System
- Date validation and conflict checking
- Automatic price calculation
- Booking status management
- Ownership-based access control

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register as guest or host |
| POST | `/auth/login` | No | Login and receive JWT token |
| GET | `/auth/me` | Yes | Get logged-in user's profile |
| POST | `/auth/change-password` | Yes | Change password |
| POST | `/auth/forgot-password` | No | Request password reset email |
| POST | `/auth/reset-password/:token` | No | Reset password using token |

### Listings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/listings` | No | Get all listings (with filters) |
| GET | `/listings/:id` | No | Get listing by ID |
| POST | `/listings` | Yes (HOST only) | Create new listing |
| PUT | `/listings/:id` | Yes (owner only) | Update listing |
| DELETE | `/listings/:id` | Yes (owner only) | Delete listing |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/bookings` | Yes (ADMIN only) | Get all bookings |
| GET | `/bookings/:id` | Yes | Get booking by ID |
| POST | `/bookings` | Yes (GUEST only) | Create booking |
| PATCH | `/bookings/:id/status` | Yes (ADMIN only) | Update booking status |
| DELETE | `/bookings/:id` | Yes (owner only) | Cancel booking |

### File Upload
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/users/:id/avatar` | Yes (owner only) | Upload profile picture |
| DELETE | `/users/:id/avatar` | Yes (owner only) | Remove profile picture |
| POST | `/listings/:id/photos` | Yes (owner only) | Upload listing photos |
| DELETE | `/listings/:id/photos/:photoId` | Yes (owner only) | Delete listing photo |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | Yes (ADMIN only) | Get all users |
| GET | `/users/:id` | Yes | Get user by ID |
| GET | `/users/:id/listings` | Yes | Get user's listings |
| GET | `/users/:id/bookings` | Yes | Get user's bookings |
| PUT | `/users/:id` | Yes (owner only) | Update user profile |
| DELETE | `/users/:id` | Yes (ADMIN only) | Delete user |

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/airbnb
JWT_SECRET=your-long-random-secret-key
JWT_EXPIRES_IN=7d
API_URL=http://localhost:3000

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=Airbnb <your-email@gmail.com>

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Database Setup
```bash
npm run prisma:migrate
npm run prisma:generate
```

### 3. Start Development Server
```bash
npm run dev
```

## Authentication Flow

### Registration
```json
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "phone": "+1234567890",
  "password": "password123",
  "role": "HOST"
}
```

### Login
```json
POST /auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### Protected Requests
Include JWT token in Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## File Upload

### Avatar Upload
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@avatar.jpg" \
  http://localhost:3000/users/1/avatar
```

### Listing Photos
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photos=@photo1.jpg" \
  -F "photos=@photo2.jpg" \
  http://localhost:3000/listings/1/photos
```

## Booking System

### Create Booking
```json
POST /bookings
{
  "listingId": 1,
  "checkIn": "2024-06-01",
  "checkOut": "2024-06-05"
}
```

The system automatically:
- Validates dates (future check-in, check-out after check-in)
- Checks for booking conflicts
- Calculates total price
- Sends confirmation email

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Signed with secret, include user ID and role
- **Role-based Access**: HOST, GUEST, ADMIN permissions
- **Ownership Checks**: Users can only modify their own resources
- **Input Validation**: Zod schemas for all endpoints
- **File Type Validation**: Only images allowed for uploads
- **Rate Limiting Ready**: Structure supports express-rate-limit

## Email Templates

All emails use branded HTML templates with:
- Airbnb color scheme (#FF5A5F)
- Responsive design
- Clear call-to-action buttons
- Professional styling

## Error Handling

Consistent error responses:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data, booking conflicts)
- `500` - Internal Server Error

## Development Notes

### Database Schema
- Users have roles (GUEST, HOST, ADMIN)
- Listings belong to HOST users
- Bookings connect GUEST users to listings
- Photos are linked to listings with Cloudinary URLs
- Reset tokens are hashed before storage

### File Storage
- Images stored on Cloudinary
- Public IDs saved for deletion
- Automatic cleanup of old files
- Image optimization utilities included

### Email System
- Asynchronous sending (doesn't block responses)
- Error handling (failed emails don't crash server)
- Template-based HTML emails
- Gmail SMTP configuration

## Testing

The API includes comprehensive validation and error handling. Test with tools like:
- Postman
- curl
- Thunder Client (VS Code)
- Insomnia

## Production Considerations

1. **Rate Limiting**: Add express-rate-limit to auth endpoints
2. **CORS**: Configure for your frontend domain
3. **HTTPS**: Use SSL certificates in production
4. **Environment**: Use strong JWT secrets and secure email credentials
5. **Database**: Use connection pooling for PostgreSQL
6. **Monitoring**: Add logging and error tracking
7. **Backup**: Regular database backups
8. **CDN**: Consider CDN for Cloudinary images

## License

MIT License