# Docker Deployment to GitHub Container Registry (GHCR)

This document provides a comprehensive guide for the automated Docker image deployment workflow that publishes the Budget Tracker application images to GitHub Container Registry.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [How It Works](#how-it-works)
- [Deploying New Versions](#deploying-new-versions)
- [Using Published Images](#using-published-images)
- [Repository Configuration](#repository-configuration)
- [Image Information](#image-information)
- [Troubleshooting](#troubleshooting)
- [Manual Deployment](#manual-deployment)
- [Best Practices](#best-practices)

---

## Overview

The Budget Tracker project uses GitHub Actions to automatically build and publish Docker images to GitHub Container Registry (GHCR) whenever the version in `package.json` changes.

### What This Workflow Does

- **Automatic Version Detection**: Monitors `frontend/package.json` and `backend/package.json` for version changes
- **Smart Building**: Only builds and pushes the service whose version was updated
- **Multi-Platform Support**: Builds images for both `linux/amd64` and `linux/arm64` architectures
- **Semantic Versioning**: Tags images with the exact version from `package.json` plus a `latest` tag
- **Public Images**: All images are published as public packages (MIT License)
- **Zero Configuration**: Uses GitHub's built-in `GITHUB_TOKEN`, no manual secrets required

### Published Images

- **Frontend**: `ghcr.io/sujalmittal123/budget-tracker-frontend`
- **Backend**: `ghcr.io/sujalmittal123/budget-tracker-backend`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Workflow                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    Bump version in package.json
                    (frontend or backend or both)
                              │
                              ▼
                    Commit & Push to 'main' branch
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   GitHub Actions Workflow                    │
│                  (.github/workflows/docker-deploy.yml)       │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
     ┌──────────────────┐        ┌──────────────────┐
     │  Frontend Job    │        │  Backend Job     │
     │  (if changed)    │        │  (if changed)    │
     └──────────────────┘        └──────────────────┘
                │                           │
                ▼                           ▼
     Extract version from          Extract version from
     frontend/package.json         backend/package.json
                │                           │
                ▼                           ▼
     Build multi-platform          Build multi-platform
     Docker image                  Docker image
     (amd64, arm64)                (amd64, arm64)
                │                           │
                ▼                           ▼
     Push to GHCR with tags:       Push to GHCR with tags:
     - <version>                   - <version>
     - latest                      - latest
                │                           │
                └─────────────┬─────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           GitHub Container Registry (GHCR)                   │
│                                                               │
│  ghcr.io/sujalmittal123/budget-tracker-frontend:<version>   │
│  ghcr.io/sujalmittal123/budget-tracker-frontend:latest      │
│                                                               │
│  ghcr.io/sujalmittal123/budget-tracker-backend:<version>    │
│  ghcr.io/sujalmittal123/budget-tracker-backend:latest       │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

Before using the automated deployment workflow, ensure:

1. **GitHub Repository**
   - Repository is hosted on GitHub
   - You have admin access to the repository

2. **GitHub Actions**
   - GitHub Actions is enabled for your repository (enabled by default)
   - Workflow permissions are properly configured

3. **Docker Configuration**
   - Both `frontend/Dockerfile` and `backend/Dockerfile` exist (✅ Already present)
   - Dockerfiles are properly configured and tested

4. **Version Control**
   - Your code is in the `main` branch (or configure the workflow for your default branch)

---

## Initial Setup

### Step 1: Enable GitHub Actions Workflow Permissions

1. Go to your repository on GitHub: `https://github.com/sujalmittal123/budget-app`
2. Click **Settings** (top navigation)
3. In the left sidebar, click **Actions** → **General**
4. Scroll to **Workflow permissions**
5. Ensure **Read and write permissions** is selected
6. Check **Allow GitHub Actions to create and approve pull requests** (optional, but recommended)
7. Click **Save**

### Step 2: Verify Package Permissions

No additional configuration needed! The workflow uses GitHub's automatic `GITHUB_TOKEN` which has permission to publish packages.

### Step 3: Initial Workflow Run

After pushing the workflow file to your repository:

1. The workflow will be available but won't run automatically until a version is bumped
2. You can trigger it manually first to test:
   - Go to **Actions** tab
   - Select **Deploy Docker Images to GHCR** workflow
   - Click **Run workflow** dropdown
   - Click **Run workflow** button

### Step 4: Make Packages Public (First Time Only)

After the first successful deployment:

1. Go to your GitHub profile: `https://github.com/sujalmittal123?tab=packages`
2. You'll see your published packages:
   - `budget-tracker-frontend`
   - `budget-tracker-backend`
3. Click on each package
4. Click **Package settings** (right sidebar)
5. Scroll to **Danger Zone** → **Change visibility**
6. Select **Public**
7. Type the package name to confirm
8. Click **I understand, change package visibility**

**Note**: You only need to do this once per package. Subsequent versions will inherit the public visibility.

---

## How It Works

### Workflow Triggers

The workflow triggers automatically when:

1. **Push to `main` branch** AND
2. **One or both** of these files are modified:
   - `frontend/package.json`
   - `backend/package.json`

Additionally, you can trigger it manually:
- Go to **Actions** → **Deploy Docker Images to GHCR** → **Run workflow**

### Build Logic

The workflow uses smart detection:

| Scenario | Frontend Job | Backend Job |
|----------|--------------|-------------|
| Only `frontend/package.json` changed | ✅ Runs | ⏭️ Skipped |
| Only `backend/package.json` changed | ⏭️ Skipped | ✅ Runs |
| Both `package.json` files changed | ✅ Runs | ✅ Runs |
| Manual trigger (`workflow_dispatch`) | ✅ Runs | ✅ Runs |

### Version Extraction

For each service that triggers:
1. Workflow reads the `version` field from `package.json`
2. Example: `"version": "1.2.3"` → Creates tags `1.2.3` and `latest`

### Multi-Platform Builds

Images are built for:
- `linux/amd64` (Intel/AMD 64-bit)
- `linux/arm64` (ARM 64-bit, e.g., Apple Silicon, AWS Graviton)

This ensures compatibility across different deployment environments.

### Caching

The workflow uses GitHub Actions cache to:
- Store Docker layers between builds
- Significantly speed up subsequent builds (only changed layers are rebuilt)

---

## Deploying New Versions

### Deploying Frontend Only

1. **Update the version** in `frontend/package.json`:
   ```json
   {
     "name": "budget-tracker-frontend",
     "version": "1.1.0",  // Changed from 1.0.0
     ...
   }
   ```

2. **Commit and push**:
   ```bash
   git add frontend/package.json
   git commit -m "chore(frontend): bump version to 1.1.0"
   git push origin main
   ```

3. **Monitor the workflow**:
   - Go to **Actions** tab in GitHub
   - Watch the **Deploy Docker Images to GHCR** workflow
   - Only the **Build & Push Frontend** job will run

4. **Verify deployment**:
   - Check the workflow logs for success
   - Visit `https://github.com/sujalmittal123?tab=packages`
   - You should see `budget-tracker-frontend:1.1.0` and `latest` updated

### Deploying Backend Only

1. **Update the version** in `backend/package.json`:
   ```json
   {
     "name": "budget-tracker-backend",
     "version": "2.1.0",  // Changed from 2.0.0
     ...
   }
   ```

2. **Commit and push**:
   ```bash
   git add backend/package.json
   git commit -m "chore(backend): bump version to 2.1.0"
   git push origin main
   ```

3. **Monitor the workflow**:
   - Only the **Build & Push Backend** job will run

### Deploying Both Services

1. **Update both versions**:
   ```bash
   # Update frontend/package.json version
   # Update backend/package.json version
   ```

2. **Commit and push**:
   ```bash
   git add frontend/package.json backend/package.json
   git commit -m "chore: bump versions - frontend 1.1.0, backend 2.1.0"
   git push origin main
   ```

3. **Monitor the workflow**:
   - Both jobs will run **in parallel**
   - Faster overall deployment time

---

## Using Published Images

### Pull Images

Pull the latest version:
```bash
# Frontend
docker pull ghcr.io/sujalmittal123/budget-tracker-frontend:latest

# Backend
docker pull ghcr.io/sujalmittal123/budget-tracker-backend:latest
```

Pull a specific version:
```bash
# Frontend
docker pull ghcr.io/sujalmittal123/budget-tracker-frontend:1.0.0

# Backend
docker pull ghcr.io/sujalmittal123/budget-tracker-backend:2.0.0
```

### Run Containers

#### Frontend
```bash
docker run -d \
  --name budget-frontend \
  -p 3000:80 \
  ghcr.io/sujalmittal123/budget-tracker-frontend:latest
```

Access at: `http://localhost:3000`

#### Backend
```bash
docker run -d \
  --name budget-backend \
  -p 5000:5000 \
  -e MONGODB_URI="mongodb://your-mongo-uri" \
  -e SESSION_SECRET="your-session-secret" \
  -e BETTER_AUTH_SECRET="your-auth-secret" \
  ghcr.io/sujalmittal123/budget-tracker-backend:latest
```

Access at: `http://localhost:5000`

### Docker Compose Integration

Update your `docker-compose.yml` to use GHCR images:

```yaml
version: '3.8'

services:
  frontend:
    image: ghcr.io/sujalmittal123/budget-tracker-frontend:latest
    container_name: budget-frontend
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://localhost:5000
    depends_on:
      - backend

  backend:
    image: ghcr.io/sujalmittal123/budget-tracker-backend:latest
    container_name: budget-backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:admin123@mongodb:27017/budget-tracker?authSource=admin
      - SESSION_SECRET=${SESSION_SECRET}
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
    depends_on:
      - mongodb

  mongodb:
    image: mongo:7
    container_name: budget-mongodb
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=admin123
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

Run with:
```bash
docker-compose up -d
```

### Pin to Specific Versions (Recommended for Production)

Instead of using `:latest`, pin to specific versions in production:

```yaml
services:
  frontend:
    image: ghcr.io/sujalmittal123/budget-tracker-frontend:1.0.0
  
  backend:
    image: ghcr.io/sujalmittal123/budget-tracker-backend:2.0.0
```

This ensures reproducible deployments.

---

## Repository Configuration

### Workflow Permissions

The workflow requires these permissions (configured in workflow file):
- `contents: read` - To checkout repository code
- `packages: write` - To push Docker images to GHCR

These are automatically granted via `GITHUB_TOKEN`.

### Package Settings

Each package (frontend/backend) has settings at:
- `https://github.com/users/sujalmittal123/packages/container/budget-tracker-frontend/settings`
- `https://github.com/users/sujalmittal123/packages/container/budget-tracker-backend/settings`

**Important settings**:
- **Visibility**: Set to **Public** (for MIT licensed open-source project)
- **Manage Actions access**: Ensure repository has write access (default)

---

## Image Information

### Image URLs

| Service | URL | Current Version |
|---------|-----|-----------------|
| Frontend | `ghcr.io/sujalmittal123/budget-tracker-frontend` | 1.0.0 |
| Backend | `ghcr.io/sujalmittal123/budget-tracker-backend` | 2.0.0 |

### Available Tags

Each image has multiple tags:
- **Version tag**: `1.0.0`, `2.0.0`, etc. (from package.json)
- **Latest tag**: `latest` (always points to most recent version)

### Supported Platforms

Both images support:
- `linux/amd64` (x86_64)
- `linux/arm64` (aarch64)

Docker automatically pulls the correct architecture for your system.

### Image Sizes (Approximate)

- **Frontend**: ~50-80 MB (Nginx + React build)
- **Backend**: ~200-250 MB (Node.js + dependencies)

Actual sizes may vary based on dependencies.

### Image Labels (Metadata)

Each image includes OCI-compliant labels:
- `org.opencontainers.image.title` - Image title
- `org.opencontainers.image.description` - Image description
- `org.opencontainers.image.version` - Version from package.json
- `org.opencontainers.image.created` - Build timestamp
- `org.opencontainers.image.source` - Source repository URL
- `org.opencontainers.image.licenses` - MIT

View labels:
```bash
docker inspect ghcr.io/sujalmittal123/budget-tracker-frontend:latest | jq '.[0].Config.Labels'
```

---

## Troubleshooting

### Workflow Not Triggering

**Problem**: Pushed changes but workflow didn't run.

**Solutions**:
1. **Check if version changed**: The workflow only triggers when `package.json` files are modified
   ```bash
   git diff HEAD~1 frontend/package.json
   git diff HEAD~1 backend/package.json
   ```

2. **Check branch**: Workflow only runs on `main` branch
   ```bash
   git branch --show-current
   # Should output: main
   ```

3. **Check file path**: Ensure you modified the correct files:
   - ✅ `frontend/package.json`
   - ✅ `backend/package.json`
   - ❌ `package.json` (root - won't trigger)

4. **Manual trigger**: Test manually:
   - Go to **Actions** → **Deploy Docker Images to GHCR**
   - Click **Run workflow**

### Build Failures

**Problem**: Workflow runs but build fails.

**Solutions**:

1. **Check workflow logs**:
   - Go to **Actions** tab
   - Click on the failed workflow run
   - Expand the failed step to see error details

2. **Test Docker build locally**:
   ```bash
   # Frontend
   cd frontend
   docker build -t test-frontend .
   
   # Backend
   cd backend
   docker build -t test-backend .
   ```

3. **Common issues**:
   - **Missing dependencies**: Check `package.json` and `package-lock.json` are committed
   - **Dockerfile errors**: Verify Dockerfile syntax
   - **Build context**: Ensure all required files are in the build context

### Permission Errors

**Problem**: Error pushing to GHCR - permission denied.

**Solutions**:

1. **Check workflow permissions**:
   - Settings → Actions → General → Workflow permissions
   - Must be **Read and write permissions**

2. **Check GITHUB_TOKEN scope**:
   - The automatic `GITHUB_TOKEN` should work by default
   - If issues persist, check repository settings

3. **Verify package permissions**:
   - Go to package settings
   - Ensure the repository has write access under "Manage Actions access"

### Package Not Public

**Problem**: Can't pull image without authentication.

**Solutions**:

1. **Make package public**:
   - Go to `https://github.com/sujalmittal123?tab=packages`
   - Click on package
   - Package settings → Change visibility → Public

2. **Verify visibility**:
   ```bash
   # Should work without login if public
   docker pull ghcr.io/sujalmittal123/budget-tracker-frontend:latest
   ```

### Version Not Updating

**Problem**: Pushed new version but image tag didn't update.

**Solutions**:

1. **Check workflow ran**:
   - Go to **Actions** tab
   - Verify workflow completed successfully

2. **Check version extraction**:
   - View workflow logs
   - Look for "Frontend version: X.Y.Z" or "Backend version: X.Y.Z"

3. **Force pull**:
   ```bash
   docker pull ghcr.io/sujalmittal123/budget-tracker-frontend:latest --no-cache
   ```

### Viewing Workflow Logs

To debug any issue:

1. Go to **Actions** tab in GitHub
2. Click on the workflow run
3. Click on the job (Build & Push Frontend/Backend)
4. Expand each step to see detailed logs
5. Look for red error messages

---

## Manual Deployment

### Manual Workflow Trigger

Trigger the workflow without changing versions:

1. Go to GitHub repository
2. Click **Actions** tab
3. Click **Deploy Docker Images to GHCR** workflow
4. Click **Run workflow** button (right side)
5. Select branch: `main`
6. Click **Run workflow**

This will build and push both frontend and backend images.

### Local Build and Push

If you need to build and push manually:

#### Prerequisites
```bash
# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u sujalmittal123 --password-stdin
```

#### Build and Push Frontend
```bash
cd frontend

# Extract version
VERSION=$(jq -r '.version' package.json)

# Build multi-platform image
docker buildx create --use
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/sujalmittal123/budget-tracker-frontend:$VERSION \
  -t ghcr.io/sujalmittal123/budget-tracker-frontend:latest \
  --push \
  .
```

#### Build and Push Backend
```bash
cd backend

# Extract version
VERSION=$(jq -r '.version' package.json)

# Build multi-platform image
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/sujalmittal123/budget-tracker-backend:$VERSION \
  -t ghcr.io/sujalmittal123/budget-tracker-backend:latest \
  --push \
  .
```

---

## Best Practices

### Semantic Versioning

Follow semantic versioning (SemVer) for version bumps:

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features (backward compatible)
- **PATCH** (1.0.0 → 1.0.1): Bug fixes (backward compatible)

### When to Bump Versions

**Frontend**:
- UI changes, new features, bug fixes
- Dependency updates that affect the build
- Configuration changes

**Backend**:
- API changes, new endpoints
- Database schema changes
- Security updates
- Dependency updates

### Testing Before Version Bump

1. **Test locally**:
   ```bash
   # Frontend
   cd frontend
   npm install
   npm run build
   
   # Backend
   cd backend
   npm install
   npm test
   ```

2. **Test Docker build**:
   ```bash
   docker build -t test-frontend ./frontend
   docker build -t test-backend ./backend
   ```

3. **Only then** bump version and push

### Version Control Workflow

Recommended Git workflow:

```bash
# 1. Make your changes
git checkout -b feature/new-feature

# 2. Test thoroughly
npm test

# 3. Bump version (if ready for release)
# Edit package.json

# 4. Commit with conventional commit message
git commit -m "feat(frontend): add new dashboard widget

- Add real-time updates
- Improve chart performance

Bumps version to 1.1.0"

# 5. Merge to main (via PR or direct push)
git checkout main
git merge feature/new-feature
git push origin main

# 6. Workflow automatically deploys
```

### Production Deployments

For production:

1. **Pin specific versions** in docker-compose.yml:
   ```yaml
   image: ghcr.io/sujalmittal123/budget-tracker-frontend:1.0.0
   ```

2. **Test images before production**:
   ```bash
   docker pull ghcr.io/sujalmittal123/budget-tracker-frontend:1.1.0
   # Test in staging environment
   # Then update production
   ```

3. **Keep a changelog**: Document what changed in each version

4. **Monitor deployments**: Check workflow success before announcing releases

### Security Considerations

1. **Environment variables**: Never hardcode secrets in Dockerfiles
2. **Use .env files** for local development
3. **Use secrets management** (GitHub Secrets, AWS Secrets Manager, etc.) for production
4. **Regularly update dependencies**: Keep base images and npm packages up to date
5. **Scan images**: Consider adding security scanning to the workflow

---

## Additional Resources

- [GitHub Container Registry Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Multi-Platform Builds](https://docs.docker.com/build/building/multi-platform/)
- [Semantic Versioning](https://semver.org/)

---

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review workflow logs in the **Actions** tab
3. Open an issue in the repository with:
   - Description of the problem
   - Workflow run URL
   - Error messages from logs
   - Steps to reproduce

---

**Last Updated**: February 2026  
**Workflow Version**: 1.0.0  
**Maintainer**: Budget Tracker Team
