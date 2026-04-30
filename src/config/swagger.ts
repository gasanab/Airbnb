import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Airbnb API',
      version: '1.0.0',
      description: `
        A comprehensive REST API for an Airbnb-like platform with authentication, 
        listings management, booking system, and file uploads.
        
        ## Features
        - 🔐 JWT Authentication & Authorization
        - 👥 User Management (HOST, GUEST, ADMIN roles)
        - 🏠 Property Listings with Photos
        - 📅 Booking System with Conflict Detection
        - 📧 Email Notifications
        - 📸 File Upload (Avatars & Listing Photos)
        
        ## Getting Started
        1. Register a new user or login with existing credentials
        2. Click the "Authorize" button and paste your JWT token
        3. Test any endpoint directly from this documentation
        
        ## Authentication
        Most endpoints require authentication. After logging in, use the "Authorize" button 
        to set your JWT token for all subsequent requests.
      `,
      contact: {
        name: 'API Support',
        email: 'gasanab5@gmail.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from the login endpoint'
        }
      },
      schemas: {
        // Core Models
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
              description: 'Unique user identifier'
            },
            name: {
              type: 'string',
              example: 'John Doe',
              description: 'Full name of the user'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com',
              description: 'User email address'
            },
            username: {
              type: 'string',
              example: 'johndoe',
              description: 'Unique username'
            },
            phone: {
              type: 'string',
              example: '+1234567890',
              description: 'User phone number'
            },
            role: {
              type: 'string',
              enum: ['HOST', 'GUEST', 'ADMIN'],
              example: 'HOST',
              description: 'User role determining permissions'
            },
            avatar: {
              type: 'string',
              nullable: true,
              example: 'https://res.cloudinary.com/demo/image/upload/avatar.jpg',
              description: 'Profile picture URL'
            },
            avatarPublicId: {
              type: 'string',
              nullable: true,
              example: 'airbnb/avatars/user123',
              description: 'Cloudinary public ID for avatar'
            },
            bio: {
              type: 'string',
              nullable: true,
              example: 'Experienced host with 5+ years in hospitality',
              description: 'User biography'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z',
              description: 'Account creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-20T14:45:00Z',
              description: 'Last update timestamp'
            }
          }
        },
        
        Listing: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
              description: 'Unique listing identifier'
            },
            title: {
              type: 'string',
              example: 'Beautiful Beach House',
              description: 'Listing title'
            },
            description: {
              type: 'string',
              example: 'A stunning beachfront property with amazing ocean views',
              description: 'Detailed listing description'
            },
            location: {
              type: 'string',
              example: 'Malibu, California',
              description: 'Property location'
            },
            pricePerNight: {
              type: 'number',
              format: 'float',
              example: 250.00,
              description: 'Price per night in USD'
            },
            guests: {
              type: 'integer',
              example: 6,
              description: 'Maximum number of guests'
            },
            type: {
              type: 'string',
              enum: ['APARTMENT', 'HOUSE', 'VILLA', 'CABIN'],
              example: 'HOUSE',
              description: 'Type of property'
            },
            amenities: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['WiFi', 'Pool', 'Beach Access', 'Parking'],
              description: 'List of available amenities'
            },
            rating: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 4.8,
              minimum: 1,
              maximum: 5,
              description: 'Average rating from reviews'
            },
            hostId: {
              type: 'integer',
              example: 1,
              description: 'ID of the host user'
            },
            host: {
              $ref: '#/components/schemas/User',
              description: 'Host user information'
            },
            photos: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ListingPhoto'
              },
              description: 'Listing photos (max 5)'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-20T14:45:00Z'
            }
          }
        },

        ListingPhoto: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
              description: 'Photo identifier'
            },
            url: {
              type: 'string',
              example: 'https://res.cloudinary.com/demo/image/upload/listing1.jpg',
              description: 'Photo URL'
            },
            publicId: {
              type: 'string',
              example: 'airbnb/listings/photo123',
              description: 'Cloudinary public ID'
            },
            listingId: {
              type: 'integer',
              example: 1,
              description: 'Associated listing ID'
            }
          }
        },
        
        Booking: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
              description: 'Unique booking identifier'
            },
            checkIn: {
              type: 'string',
              format: 'date-time',
              example: '2024-07-01T15:00:00Z',
              description: 'Check-in date and time'
            },
            checkOut: {
              type: 'string',
              format: 'date-time',
              example: '2024-07-05T11:00:00Z',
              description: 'Check-out date and time'
            },
            totalPrice: {
              type: 'number',
              format: 'float',
              example: 1000.00,
              description: 'Total booking price'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
              example: 'CONFIRMED',
              description: 'Booking status'
            },
            guestId: {
              type: 'integer',
              example: 2,
              description: 'ID of the guest user'
            },
            listingId: {
              type: 'integer',
              example: 1,
              description: 'ID of the booked listing'
            },
            guest: {
              $ref: '#/components/schemas/User',
              description: 'Guest user information'
            },
            listing: {
              $ref: '#/components/schemas/Listing',
              description: 'Booked listing information'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },

        // Input Schemas
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'username', 'phone', 'password'],
          properties: {
            name: {
              type: 'string',
              example: 'John Doe',
              description: 'Full name'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com',
              description: 'Email address'
            },
            username: {
              type: 'string',
              example: 'johndoe',
              minLength: 3,
              description: 'Unique username (min 3 characters)'
            },
            phone: {
              type: 'string',
              example: '+1234567890',
              minLength: 10,
              description: 'Phone number (min 10 characters)'
            },
            password: {
              type: 'string',
              example: 'password123',
              minLength: 8,
              description: 'Password (min 8 characters)'
            },
            role: {
              type: 'string',
              enum: ['HOST', 'GUEST'],
              example: 'GUEST',
              description: 'User role (defaults to GUEST if not provided)'
            },
            bio: {
              type: 'string',
              example: 'Travel enthusiast',
              description: 'Optional user biography'
            }
          }
        },

        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com',
              description: 'User email address'
            },
            password: {
              type: 'string',
              example: 'password123',
              description: 'User password'
            }
          }
        },

        CreateListingInput: {
          type: 'object',
          required: ['title', 'description', 'location', 'pricePerNight', 'guests', 'type', 'amenities'],
          properties: {
            title: {
              type: 'string',
              example: 'Beautiful Beach House',
              description: 'Listing title'
            },
            description: {
              type: 'string',
              example: 'A stunning beachfront property with amazing ocean views',
              description: 'Detailed description'
            },
            location: {
              type: 'string',
              example: 'Malibu, California',
              description: 'Property location'
            },
            pricePerNight: {
              type: 'number',
              format: 'float',
              example: 250.00,
              minimum: 0,
              description: 'Price per night in USD'
            },
            guests: {
              type: 'integer',
              example: 6,
              minimum: 1,
              description: 'Maximum number of guests'
            },
            type: {
              type: 'string',
              enum: ['APARTMENT', 'HOUSE', 'VILLA', 'CABIN'],
              example: 'HOUSE',
              description: 'Type of property'
            },
            amenities: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['WiFi', 'Pool', 'Beach Access', 'Parking'],
              description: 'List of available amenities'
            }
          }
        },

        CreateBookingInput: {
          type: 'object',
          required: ['listingId', 'checkIn', 'checkOut'],
          properties: {
            listingId: {
              type: 'integer',
              example: 1,
              description: 'ID of the listing to book'
            },
            checkIn: {
              type: 'string',
              format: 'date',
              example: '2024-07-01',
              description: 'Check-in date (YYYY-MM-DD)'
            },
            checkOut: {
              type: 'string',
              format: 'date',
              example: '2024-07-05',
              description: 'Check-out date (YYYY-MM-DD)'
            }
          }
        },

        UpdateUserInput: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'John Doe',
              description: 'Full name'
            },
            username: {
              type: 'string',
              example: 'johndoe',
              description: 'Username'
            },
            phone: {
              type: 'string',
              example: '+1234567890',
              description: 'Phone number'
            },
            bio: {
              type: 'string',
              example: 'Updated bio',
              description: 'User biography'
            }
          }
        },

        ChangePasswordInput: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: {
              type: 'string',
              example: 'oldpassword123',
              description: 'Current password'
            },
            newPassword: {
              type: 'string',
              example: 'newpassword123',
              minLength: 8,
              description: 'New password (min 8 characters)'
            }
          }
        },

        ForgotPasswordInput: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com',
              description: 'Email address for password reset'
            }
          }
        },

        ResetPasswordInput: {
          type: 'object',
          required: ['password'],
          properties: {
            password: {
              type: 'string',
              example: 'newpassword123',
              minLength: 8,
              description: 'New password (min 8 characters)'
            }
          }
        },

        // Response Schemas
        AuthResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description: 'JWT authentication token'
            },
            user: {
              $ref: '#/components/schemas/User',
              description: 'User information'
            }
          }
        },

        ErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Resource not found',
              description: 'Error message'
            }
          }
        },

        ValidationErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Validation failed',
              description: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: {
                    type: 'string',
                    example: 'body.email'
                  },
                  message: {
                    type: 'string',
                    example: 'Invalid email format'
                  }
                }
              },
              description: 'Detailed validation errors'
            }
          }
        },

        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Operation completed successfully',
              description: 'Success message'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #FF5A5F }
    `,
    customSiteTitle: 'Airbnb API Documentation'
  }));

  // Raw JSON spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 Swagger documentation available at: http://localhost:3000/api-docs');
  console.log('📄 Raw OpenAPI spec available at: http://localhost:3000/api-docs.json');
};

export default specs;