# Digital Underwriting: Usage-Based Insurance AI Coding Guidelines

## System Architecture Overview

This is a **MongoDB Atlas-based usage-based insurance demo** showcasing automated premium calculation via ML predictions. The system processes IoT car trip data through a series of MongoDB aggregation pipelines and triggers that culminate in Databricks ML predictions.

### Core Data Flow Pattern
1. **Raw Trip Data** (`customerTripRaw`) → **Daily Aggregation** (`customerTripDaily`) → **Monthly Aggregation** (`customerTripMonthly`) → **ML Prediction** (Databricks) → **Premium Update** (`customerPolicy`)
2. Uses **MongoDB Atlas triggers** (cron jobs) for daily/monthly aggregation and database triggers for ML predictions
3. **Three-tier deployment**: Atlas backend, Next.js frontend, iOS Swift mobile app

## Critical Development Patterns

### MongoDB Atlas App Services Configuration
- **App ID configuration**: Always update `Atlas_App_ID` in [`mobile_app_copy/Controller/Config.xcconfig`](mobile_app_copy/Controller/Config.xcconfig)
- **Realm authentication**: Uses custom `resetFunc` function for password reset flows
- **Database structure**: Collections follow `customer` → `customerPolicy` → `customerTrip*` hierarchy
- **Triggers**: Database triggers use `pipeline_unirest.js` pattern for external ML API calls

### Data Processing Workflows
```bash
# Deploy full MongoDB cluster with sample data
cd auto-deployment && ./create-cluster.sh

# Run data generation (generates 1000 sample trip records)
cd usage-based-ui/DataMicroservice && python3 dataLoader.py

# Container deployment (both frontend and backend)
cd usage-based-ui && docker-compose up
```

### Python FastAPI Microservice Pattern
- **Server structure**: [`usage-based-ui/DataMicroservice/server.py`](usage-based-ui/DataMicroservice/server.py) uses subprocess calls to trigger data loading
- **Environment setup**: Always load `.env` for `MONGO_DB_CONNECTION_STRING`
- **Data generation**: [`dataLoader.py`](usage-based-ui/DataMicroservice/dataLoader.py) creates time-series trip data with 4-hour intervals

### MongoDB Aggregation Pipeline Conventions
- **Daily aggregation**: Groups by date parts (year/month/day) + customerId, sums `milesDriven`
- **Materialized views**: Use `$merge` with `whenMatched: 'replace'` pattern
- **Date handling**: Extract date parts using `$dateToParts` for grouping operations

### iOS Swift Mobile App Patterns
- **Realm integration**: Uses `RealmSwift` with `ObjectKeyIdentifiable` protocol
- **Data models**: Follow `customer` → `customerPolicy` → embedded documents pattern
- **Navigation**: SwiftUI with separate views for Bills, Customers, Driving, Profile

### Container and Deployment Conventions
- **Port mapping**: Frontend (3457:3000), Backend (8911:8000)
- **Docker context**: Frontend builds from root, backend from `DataMicroservice/`
- **Atlas deployment**: Uses MongoDB Atlas API with programmatic cluster creation and data restore

### External Integration Points
- **Databricks ML**: Pipeline sends `[basePremium, totalDistance]` JSON to model endpoint
- **MongoDB Charts**: Embedded charts for data visualization dashboard
- **Authentication**: Custom Atlas App Services functions for user management

## Development Commands
```bash
# Frontend development
cd usage-based-ui && npm run dev

# Backend development  
cd usage-based-ui/DataMicroservice && uvicorn server:app --reload

# Mobile app (requires Xcode)
open mobile_app_copy/Controller.xcodeproj
```

## Key Files for System Understanding
- [`src/StepbyStep.md`](src/StepbyStep.md) - Complete setup workflow
- [`auto-deployment/create-cluster.sh`](auto-deployment/create-cluster.sh) - Atlas cluster provisioning
- [`src/pipeline_unirest.js`](src/pipeline_unirest.js) - ML prediction trigger function
- [`src/MaterializedViews/dailyTrigger.js`](src/MaterializedViews/dailyTrigger.js) - Daily aggregation pipeline
- [`usage-based-ui/DataMicroservice/dataLoader.py`](usage-based-ui/DataMicroservice/dataLoader.py) - Sample data generation