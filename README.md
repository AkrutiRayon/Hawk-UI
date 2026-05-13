# Hawk-UI

A modern, responsive documentation tracker UI built with Node.js, Express, and EJS. This application displays real-time documentation changes across Perforce products (Akana, BlazeMeter, P4, Perfecto, and Puppet) with filtering and search capabilities.

## Overview

Hawk-UI is a frontend application that serves as a documentation changes tracker for Perforce products. It connects to a backend API (hawk-api-server) to fetch MongoDB records of documentation updates and renders them dynamically through an Express/EJS server. The UI provides an intuitive interface for users to browse product documentation changes filtered by tags, time ranges, and custom search.

## Project Architecture

```
MongoDB (Local)
      ↓
Backend API (hawk-api-server on localhost:3000)
      ↓
Frontend UI (Hawk-UI on localhost:5000)
      ↓
Browser
```

The application follows a three-tier architecture:
1. **Database Layer**: MongoDB storing documentation change records
2. **API Layer**: Backend API providing RESTful endpoints
3. **UI Layer**: Node.js/Express frontend rendering dynamic HTML via EJS

## Features

- **Multi-Product Support**: Track documentation changes for Akana, BlazeMeter, P4, Perfecto, and Puppet
- **Dynamic Filtering**: Filter updates by tags (Added, Updated, Critical, Release Notes) and time ranges (24h, 7d, 30d)
- **Date Range Selection**: Custom date range filtering via form inputs
- **Search Functionality**: Search through product cards and documentation updates
- **Responsive Design**: Mobile-friendly UI with dark mode support
- **Live Status Indicator**: Shows real-time update status
- **Subscription Modal**: Subscribe to documentation updates via Email or Slack
- **Expandable Content**: Read more functionality for long documentation summaries

## Technology Stack

- **Runtime**: Node.js
- **Server Framework**: Express.js (v5.2.1)
- **Templating Engine**: EJS (v5.0.2) - 4.1% of codebase
- **HTTP Client**: Axios (v1.15.2)
- **Frontend**: HTML (92.5%), CSS, JavaScript (2.3%)
- **Deployment**: Docker & Kubernetes
- **Package Manager**: npm

## Project Structure

```
Hawk-UI/
├── app.js                          # Main Express server application
├── package.json                    # Node.js dependencies
├── package-lock.json               # Dependency lock file
├── makefile                        # Build automation
├── localhost-server                # Local development script
├── notes.txt                       # Development documentation
├── views/
│   └── index.ejs                   # Main EJS template (92.5% HTML)
├── public/
│   ├── css/
│   │   └── index.css               # Styling (134 KB)
│   ├── js/
│   │   └── index.js                # Client-side JavaScript (26 KB)
│   └── images/                     # Product logos and assets
├── env/
│   └── .env                        # Environment variables
├── Kubernetes/
│   └── hawk-ui-deploy.yaml         # Kubernetes deployment config
├── ContainerFile/
│   └── Dockerfile                  # Docker container definition
└── node_modules/                   # npm dependencies
```

## File Descriptions

### Core Application Files

**app.js**
- Main Express server file
- Handles routing for home page (`/`) and product pages (`/:product`)
- Manages environment variable loading from `env/.env`
- Normalizes BASE_URL and BASE_PATH for flexible deployment
- Establishes EJS templating and static file serving
- Makes server-side API calls to backend using Axios
- Passes dynamic data to the EJS template for rendering
- Supports query parameters for filtering: `tag`, `days`, `start`, `end`
- Runs on port 5000 (or custom PORT via environment variable)

**package.json**
- Project metadata and version (1.0.0)
- Defines three core dependencies:
  - `axios`: HTTP client for backend API calls
  - `ejs`: Template engine for dynamic HTML rendering
  - `express`: Web server framework
- Configured as CommonJS module

### Template & Static Files

**views/index.ejs** (7.7 KB, 158 lines)
- Single-page template rendered by Express
- Contains both home page and detail page layouts
- Home page: Product grid with search functionality
- Detail page: Shows selected product with documentation updates
- Features:
  - Dynamic product header and description
  - Filter bar with date range form
  - Time-based quick filters (24h, 7d, 30d)
  - Tag-based navigation (All, Added, Updated, Critical, Release Notes)
  - Update cards with title, summary, and metadata
  - Subscribe modal for email/Slack notifications
  - Dark mode toggle
  - Responsive layout with geometric background

**public/css/index.css** (134 KB)
- Comprehensive styling for the entire UI
- Responsive design for mobile and desktop
- Dark mode theme support
- Styling for:
  - Header with branding and theme toggle
  - Hero section on home page
  - Product grid and cards
  - Detail page layout
  - Filter bars and tabs
  - Update cards with tags
  - Modal overlay and subscription form
  - Geometric background elements
  - Animations and transitions

**public/js/index.js** (26 KB)
- Client-side functionality and interactivity
- Key features:
  - Product grid rendering on home page
  - Search filtering for products and updates
  - Modal management (open/close subscription dialog)
  - Theme toggle (light/dark mode)
  - Read more/collapse functionality for long summaries
  - Event listeners for buttons and forms
  - Dynamic product data population

### Configuration & Deployment

**Kubernetes/hawk-ui-deploy.yaml** (1 KB)
- Kubernetes deployment manifest
- Defines container image, replicas, and resources
- Sets environment variables for production:
  - `BASE_URL`: Points to backend API service (`hawk-apiserver-svc:3000`)
  - `BASE_PATH`: UI path prefix (`/v1` for production)
- Configures health checks and port mappings
- Used for deploying to Kubernetes cluster at `hawk.k8s.net/v1`

**ContainerFile/Dockerfile**
- Docker container definition
- Creates lightweight Node.js image
- Copies application files and installs dependencies
- Exposes port 5000
- Default command: `node app.js`
- Used for containerized deployment

**makefile** (1.4 KB)
- Build automation commands
- Targets for building, running, and deploying
- Docker image build and push commands
- Kubernetes deployment commands

**env/.env**
- Environment configuration file (local development)
- Variables:
  - `BASE_URL`: Backend API endpoint (default: hawk.k8s.net or http://localhost:3000)
  - `BASE_PATH`: URL path prefix (empty for local, `/v1` for production)
  - `PORT`: Server port (default: 5000)

### Documentation & Notes

**notes.txt** (12.6 KB)
- Comprehensive development notes
- Architecture explanation
- Setup instructions
- Port configuration guide
- Environment variable details
- Development workflow
- Troubleshooting and fixes

**localhost-server** (1.5 KB)
- Script for local development server setup

## Environment Variables

### Local Development
```bash
BASE_URL=http://localhost:3000
PORT=5000
# No BASE_PATH needed
```

### Production (Kubernetes)
```bash
BASE_URL=http://hawk-apiserver-svc:3000
BASE_PATH=/v1
PORT=5000
```

## Running the Application

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   - Create or edit `env/.env` with local API endpoint

3. **Start the server**
   ```bash
   node app.js
   ```

4. **Access the UI**
   - Open `http://localhost:5000` in your browser

### Docker

1. **Build image**
   ```bash
   docker build -f ContainerFile/Dockerfile -t hawk-ui:latest .
   ```

2. **Run container**
   ```bash
   docker run -p 5000:5000 -e BASE_URL=http://api-service:3000 hawk-ui:latest
   ```

### Kubernetes

1. **Deploy to cluster**
   ```bash
   kubectl apply -f Kubernetes/hawk-ui-deploy.yaml
   ```

2. **Access via**
   ```
   https://hawk.k8s.net/v1
   ```

## API Integration

The UI communicates with the backend API using these endpoints:

- `GET /api/document/:product/getbytags/:tag` - Get updates by tag
- `GET /api/document/:product/getbydays/:days` - Get recent updates
- `GET /api/document/:product/getbydaterange/:start/:end` - Get updates in date range

Supported products: `akana`, `blazemeter`, `p4`, `perfecto`, `puppet`

## Language Composition

- **HTML**: 92.5% (7,729 lines in index.ejs + static markup)
- **EJS**: 4.1% (Template syntax in views)
- **JavaScript**: 2.3% (Client-side interactivity)
- **Other**: 1.1% (Configuration files, CSS imports)

## Key Features Explanation

### Dynamic Routing
- Home route (`/`) displays product grid
- Product routes (`/:product`) show documentation updates
- Query parameters enable filtering without page reload

### Server-Side Rendering
- Express renders HTML on server using EJS
- Backend API calls happen server-side (not exposed to browser)
- Data passed to template as local variables

### Environment Flexibility
- Base URL and path normalized for any deployment scenario
- Supports localhost development, Docker containers, and Kubernetes
- Single codebase works across environments

### Responsive UI
- Geometric background design elements
- Mobile-friendly layout
- Dark mode support for reduced eye strain
- Smooth animations and transitions

## Development Workflow

1. Edit views in `views/index.ejs`
2. Style updates in `public/css/index.css`
3. Add interactivity in `public/js/index.js`
4. Modify routes in `app.js` as needed
5. Test locally: `node app.js`
6. Deploy via Docker or Kubernetes

## License

ISC

## Author

Created by Akruti Rayon

---

**Last Updated**: May 13, 2026
