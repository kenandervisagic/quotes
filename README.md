# Anonymous Messages

[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.0-green)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-20.10.21-blue)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Nginx-1.23.3-green)](https://nginx.org/)
[![Bash](https://img.shields.io/badge/Bash-5.1.16-yellow)](https://www.gnu.org/software/bash/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2.0-blue)](https://github.com/features/actions)

An application for anonymously sharing messages and quotes with others. Post thoughts, inspirations, or memorable quotes without revealing your identity.

## Check it out:
[Visit The Words Left Behind](https://kdidp.art)

## 🚀 Features

- Post anonymous messages and quotes
- Browse a feed of messages from other users
- Like and share your favorite quotes
- Generate images for your messages
- Responsive design for mobile and desktop
- Real-time notifications

## 🛠️ Tech Stack

### Frontend
- React with Vite
- JavaScript
- ESLint for code quality

### Backend
- FastAPI microservices architecture
- Python
- MongoDB

### Infrastructure
- Docker & Docker Compose
- Nginx for reverse proxy
- GitHub Actions for CI/CD
- Minio for image storing
- Grafana + Prometheus for monitoring and alerts

## 🏗️ Architecture

The application follows a microservices architecture:

- **backend-core**: Handles core application functionality including user management, messages, and interactions
- **backend-image-generation**: Dedicated service for image generation functionality
- **admin-dashboard**: A frontend + backend app built to manage submitted quotes (Only accesible via VPN)
- **frontend**: React-based user interface
- **nginx-local**: Reverse proxy for local development

## 🔧 Getting Started

### Prerequisites

- Docker and Docker Compose
- Git

### Running the Application Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/kenandervisagic/quotes.git
   cd quotes
   ```
2. Prepare the env variables:
   ```bash
   cp env.example .env
   ```

3. Start the application using Docker Compose:
   ```bash
   docker-compose -f docker-compose-local.yaml up
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3001
   - Core API: http://localhost:8000/api/core
   - Image Generation API: http://localhost:8000/api/generate

## 📝 Development

### Project Structure

```
quotes/
├── .docker/
├── .github/
│   └── workflows/
├── backend-core/             # Core API functionality
├── admin-dashboard/             # Admin dashboard panel
├── backend-image-generation/ # Image generation service
├── frontend/                 # React application
├── nginx-local/              # Local development proxy configuration
├── .dockerignore
├── .env.local
├── .gitignore
├── docker-compose-local.yaml
└── README.md
```

### Environment Configuration

The application uses `.env.local` for local development configuration. Environment variables for production are managed through the CI/CD pipeline.

### Branching Strategy

- `master` branch is for production. A push to master automatically deploys to production.
- Use feature branches for individual features and fixes.
- GitHub Actions will run checks on pull requests and handle deployment.

### CI/CD Pipeline

The application uses GitHub Actions for continuous integration and deployment:

1. On pull requests:
   - `pr-check.yaml` runs tests and code quality checks

2. On push to `master`:
   - `build-deploy-core.yaml` builds and deploys the core application
   - `build-deploy-admin.yaml` builds and deploys the admin dashboard application 
   - You can track deployment progress in the Actions tab

### API Documentation

- Core API documentation: http://localhost:8000/api/core/docs
- Image Generation API documentation: http://localhost:8000/api/generate/docs


## Contributors

- Kenan Dervišagić ([@kenandervisagic](https://github.com/kenandervisagic))
- Muamer Fatić ([@muamerfatic00](https://github.com/muamerfatic00))


