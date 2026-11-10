import swaggerUi from 'swagger-ui-express'
import { Express } from 'express'

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'CampusConnect REST API Documentation',
    version: '1.0.0',
    description:
      'Official REST API for CampusConnect — University Student Services Portal (Dublin Business School B9IS130 CA1). Supports student authentication, lost/found listing management, ownership claims, and administrative moderation.',
    contact: {
      name: 'CampusConnect Engineering',
      email: 'support@campusconnect.dbs.ie',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API base path',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error description' },
          errors: { type: 'array', items: { type: 'object' } },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '672b1234abcd5678ef901234' },
          name: { type: 'string', example: 'Ciaran O’Connor' },
          email: { type: 'string', example: 'c.oconnor@student.dbs.ie' },
          role: { type: 'string', enum: ['student', 'admin'], example: 'student' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Listing: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string', example: 'MacBook Air M2 13-inch Space Grey' },
          description: { type: 'string', example: 'Left on desk 402 in Castle House library.' },
          type: { type: 'string', enum: ['lost', 'found'], example: 'found' },
          category: { type: 'string', example: 'Electronics' },
          location: { type: 'string', example: 'Castle House Library, 4th Floor' },
          itemDate: { type: 'string', format: 'date' },
          image: { type: 'string' },
          status: { type: 'string', enum: ['active', 'claimed', 'archived'], example: 'active' },
          contactInfo: { type: 'string', example: 'student.services@dbs.ie' },
        },
      },
      Claim: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          listingId: { type: 'string' },
          claimantId: { type: 'string' },
          explanation: { type: 'string', example: 'Has an emerald green sticker on bottom lid.' },
          status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
          adminNote: { type: 'string', example: 'Verified serial number matches.' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new student',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string', minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Registration successful' },
          400: { description: 'Validation failed' },
          409: { description: 'Email already exists' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate student or administrator',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful with token' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Current profile returned' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/listings': {
      get: {
        tags: ['Listings'],
        summary: 'List campus lost and found items with filters',
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['lost', 'found'] } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } },
        ],
        responses: {
          200: { description: 'Paginated listings returned' },
        },
      },
      post: {
        tags: ['Listings'],
        summary: 'Create a new listing',
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Listing created' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/claims': {
      post: {
        tags: ['Claims'],
        summary: 'Submit ownership claim for a found item',
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Claim submitted' },
          400: { description: 'Invalid request' },
        },
      },
    },
    '/claims/my-claims': {
      get: {
        tags: ['Claims'],
        summary: 'Retrieve student claims',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User claims list' },
        },
      },
    },
    '/admin/dashboard': {
      get: {
        tags: ['Admin'],
        summary: 'Retrieve administrative metrics',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Dashboard metrics' },
          403: { description: 'Forbidden (admin role required)' },
        },
      },
    },
  },
}

export const setupSwagger = (app: Express) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
}

