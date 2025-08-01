# Waivio Campaigns Service

A comprehensive campaign management service for the Waivio platform, built with NestJS and designed to handle various types of marketing campaigns including reviews, giveaways, and contests.

## 🚀 Features

### Campaign Management
- **Campaign Creation & Management**: Create, update, and delete campaigns with comprehensive validation
- **Campaign Types**: Support for Reviews, Giveaways, and Contests
- **Campaign Status Management**: Pending, Active, Suspended, and Expired states
- **Budget & Reward Management**: Flexible reward systems with USD conversion
- **Reservation System**: Time-based campaign reservations with scheduling

### Blockchain Integration
- **Hive Blockchain Integration**: Full integration with Hive blockchain for campaign activation/deactivation
- **Hive Engine Support**: Token operations and market data integration
- **Real-time Processing**: Hive and Engine block processors for live updates
- **Smart Contract Integration**: Automated campaign execution on blockchain

### Advanced Features
- **Fraud Detection**: Built-in fraud detection and prevention mechanisms
- **Blacklist/Whitelist Management**: User filtering capabilities
- **Sponsors Bot**: Automated upvoting and engagement management
- **Payment Processing**: Integrated payment system with multiple token support
- **Notification System**: Real-time notifications for campaign events
- **Currency Conversion**: Multi-currency support with real-time rates

### Technical Features
- **RESTful API**: Comprehensive API with Swagger documentation
- **Real-time Processing**: Event-driven architecture with Redis
- **Scheduled Jobs**: Automated tasks for campaign management
- **Multi-database Support**: MongoDB with separate databases for different data types
- **Caching**: Redis-based caching for performance optimization

## 🏗️ Architecture

The service follows a clean architecture pattern with clear separation of concerns:

```
src/
├── api/                 # API layer (controllers, guards, pipes)
├── common/             # Shared utilities, constants, configs
├── database/           # Database connection management
├── domain/             # Business logic layer
├── persistance/        # Data access layer (repositories, schemas)
├── services/           # External service integrations
└── main.ts            # Application entry point
```

### Key Components

- **API Controllers**: Handle HTTP requests for campaign operations
- **Domain Services**: Core business logic for campaign management
- **Processors**: Real-time blockchain data processing
- **Repositories**: Data access layer with MongoDB
- **External Services**: Hive API, Redis, and other integrations

## 🛠️ Technology Stack

- **Framework**: NestJS 8.x
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Blockchain**: Hive & Hive Engine integration
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Containerization**: Docker

## 📋 Prerequisites

- Node.js 20.10+
- MongoDB 4.4+
- Redis 6.0+
- Docker (optional)

## 🚀 Quick Start

### Environment Setup

Create environment files in the `env/` directory:

```bash
# env/development.env
NODE_ENV=development
PORT=3000
MONGO_HOST=localhost
MONGO_PORT=27017
WAIVIO_DB=waivio
CURRENCIES_DB=currencies
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB_BLOCKS=0
API_KEY=your_api_key
HIVE_AUTH=your_hive_auth_key
```

### Installation

```bash
# Install dependencies
npm install

# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Docker
docker-compose up --build
```

### API Documentation

Once running, access the Swagger documentation at:
```
http://localhost:3000/campaigns-v2/docs
```

## 📚 API Endpoints

### Campaign Management
- `POST /campaigns-v2/campaign` - Create new campaign
- `PATCH /campaigns-v2/campaign` - Update campaign
- `DELETE /campaigns-v2/campaign` - Delete campaign
- `GET /campaigns-v2/campaign/:id` - Get campaign by ID
- `POST /campaigns-v2/campaign/activate` - Validate campaign activation
- `POST /campaigns-v2/campaign/deactivate` - Validate campaign deactivation

### Campaign Operations
- `GET /campaigns-v2/campaigns/manager/:guideName` - Get active campaigns for guide
- `GET /campaigns-v2/campaigns/balance/:guideName` - Get guide balance
- `GET /campaigns-v2/campaigns/history/:guideName` - Get campaign history

### Additional Endpoints
- `GET /campaigns-v2/campaign/details/:campaignId/:object` - Get campaign details
- Various reservation, review, and reward management endpoints

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production/test) | Yes |
| `PORT` | API server port | Yes |
| `MONGO_HOST` | MongoDB host | Yes |
| `MONGO_PORT` | MongoDB port | Yes |
| `WAIVIO_DB` | Main database name | Yes |
| `CURRENCIES_DB` | Currencies database name | Yes |
| `REDIS_HOST` | Redis host | Yes |
| `REDIS_PORT` | Redis port | Yes |
| `REDIS_DB_BLOCKS` | Redis database for blocks | Yes |
| `API_KEY` | API authentication key | Yes |
| `HIVE_AUTH` | Hive authentication key | Yes |

### Database Connections

The service uses multiple MongoDB connections:
- **Waivio Database**: Main application data
- **Currencies Database**: Currency rates and financial data

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Test in watch mode
npm run test:watch
```

## 📦 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t waivio-campaigns .
docker run -p 3000:3000 waivio-campaigns
```

## 🔄 Scheduled Jobs

The service includes several automated jobs:

- **Daily at Midnight**: Campaign suspension checks
- **Every 30 Minutes**: Sponsor bot upvote execution
- **Daily at 6 PM**: Campaign reward recalculation
- **Monthly at Noon**: Limit-based campaign activation

## 🔐 Security

- **Authentication**: Hive-based authentication system
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Built-in rate limiting mechanisms
- **CORS**: Configurable CORS settings

## 📊 Monitoring

- **Logging**: Structured logging with configurable levels
- **Health Checks**: Built-in health check endpoints
- **Metrics**: Performance monitoring capabilities
- **Error Handling**: Comprehensive error handling and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the API documentation at `/campaigns-v2/docs`
- Review the test files for usage examples
- Open an issue for bugs or feature requests

## 🔗 Related Services

This service is part of the larger Waivio ecosystem and integrates with:
- Waivio Frontend
- Hive Blockchain
- Hive Engine
- Other Waivio microservices
