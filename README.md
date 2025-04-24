# Anonymous Messages

[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.0-green)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-20.10.21-blue)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Nginx-1.23.3-green)](https://nginx.org/)
[![Bash](https://img.shields.io/badge/Bash-5.1.16-yellow)](https://www.gnu.org/software/bash/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2.0-blue)](https://github.com/features/actions)

An application for anonymously sharing messages and quotes with others. Post thoughts, inspirations, or memorable quotes without revealing your identity.

## 🚀 Features

- Post anonymous messages and quotes
- Browse a feed of messages from other users
- Like and share your favorite quotes
- Responsive design for mobile and desktop
- Real-time notifications

## 🛠️ Tech Stack

### Frontend
- React with Vite
- JavaScript/TypeScript
- Node.js
- ESLint for code quality

### Backend
- FastAPI
- Python
- Slack integration

### DevOps/Infrastructure
- Docker & Docker Compose
- GitHub Actions for CI/CD
- Nginx as reverse proxy
- Bash scripting
- Automated deployment workflow

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

2. Start the application using Docker Compose:
   ```bash
   docker-compose -f docker-compose-local.yaml up
   ```

3. Access the application:
    - Frontend: http://localhost:3000
    - Backend API: http://localhost:8000

## 📝 Development

### Project Structure

```
anonymous_messages/
├── .docker/
│   ├── docker-compose.yaml
│   └── docker-tls-setup.sh
├── .github/
│   └── workflows/
│       ├── build-deploy.yaml
│       └── pr-check.yaml
├── backend/
│   └── images/
│       ├── white/
│       └── black/
│   ├── Dockerfile
│   ├── local.Dockerfile
│   ├── requirements.txt
│   └── slack.py
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── index.html
│   ├── local.Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
├── .dockerignore
├── .env.local
├── .gitignore
├── docker-compose-local.yaml
└── README.md
```


### Branching Strategy

- `master` branch is for production. A push to master automatically deploys to production.
- Use feature branches for individual features and fixes.
- GitHub Actions will run checks on pull requests and handle deployment.

### CI/CD Pipeline

The application uses GitHub Actions for continuous integration and deployment:

1. On pull requests:
    - `pr-check.yaml` runs tests and code quality checks

2. On push to `master`:
    - `build-deploy.yaml` builds and deploys the application
    - You can track deployment progress in the Actions tab
