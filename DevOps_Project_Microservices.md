# DevOps Project: Microservices Application

## 1. Project Overview

Students will build a simplified **microservices application** in any domain they choose (e-commerce, social media, task tracker, etc.).  
The project demonstrates microservices architecture with:

- Independent services and databases  
- REST APIs or asynchronous messaging for communication  
- Containerization with Docker  
- CI/CD pipelines for automated testing and deployment  

### Core Ideas
- Each microservice manages its own domain and data.  
- Services communicate via REST APIs or asynchronous messaging.  
- Services can scale, be updated, or deployed independently.  

> **Note:** A frontend is optional. Students may implement a simple UI to demonstrate API usage, but testing via Postman, `curl`, or automated tests is sufficient.

---

## 2. Microservices Example (Template)

Students can adapt this structure to their chosen domain.

### 2.1 User Service
**Responsibilities**
- Manage user accounts and authentication  

**Endpoints**
- `POST /users` → create user  
- `GET /users/:id` → get user details  

**Database**
- MongoDB (or any database)

**Tech Stack**
- Node.js + Express + MongoDB  

---

### 2.2 Product / Resource / Core Service
**Responsibilities**
- Manage main domain objects (products, posts, tasks, etc.)

**Endpoints**
- `POST /products` → add resource  
- `GET /products/:id` → get resource details  

**Database**
- MongoDB  

**Tech Stack**
- Node.js + Express + MongoDB  

---

### 2.3 Order / Transaction / Interaction Service
**Responsibilities**
- Manage interactions between users and resources (orders, comments, assignments)

**Endpoints**
- `POST /orders` → create interaction  
- `GET /orders/:id` → get details  

**Database**
- MongoDB  

**Communication**
- Calls other services via REST APIs  

#### Explanation
1. Each service runs independently with its own database.  
2. User Service handles authentication and user accounts.  
3. Core Service manages domain-specific resources (products, posts, tasks).  
4. Interaction Service handles transactions or interactions between users and resources, calling other services’ APIs as needed.  

---

## 3. Development Steps

1. Project setup: Create separate Node.js projects for each service.  
2. Define models & APIs for each service.  
3. Test each service individually using Postman, `curl`, or automated tests.  
4. Implement service-to-service communication (Interaction service calls User & Core service APIs).  
5. Optional: Add authentication (JWT or OAuth2) for User service.  
6. Optional: Add asynchronous messaging (RabbitMQ, Kafka) for event-driven communication.  
7. Dockerize each service for isolation and reproducible environments.  
8. CI/CD pipelines:
   - Use GitHub Actions, GitLab CI, or similar  
   - Steps:
     1. Run tests for each service  
     2. Build Docker images  
     3. Push images to Docker Hub or container registry  
     4. Deploy to staging or production environment  
9. Optional: Add observability
   - Centralized logging (ELK, Winston, or similar)  
   - Metrics collection (Prometheus, Grafana dashboards)  
   - Distributed tracing (Jaeger, OpenTelemetry)  

---

## 4. Deployment Plan

### Local Development
- Each service runs on a separate port  
- MongoDB instances can run locally  

### Dockerized Deployment
- Each service runs in its own container  
- Each MongoDB can run in a container or share one instance with multiple databases  
- Use `docker-compose` to orchestrate services locally  

### Cloud Deployment
- Deploy services to Heroku, Vercel, AWS ECS, or Kubernetes  
- CI/CD pipelines should automate testing, image build, and deployment  

Optional observability services can be deployed alongside or integrated into existing services.

---

## 5. Deliverables

Students must submit:

1. **Source code** for all microservices (Dockerized, with README instructions).  
2. **Project report** (about 5 pages) including:
   - Project overview (domain, purpose, target users)  
   - Architecture (how services interact)  
   - Technology stack (languages, frameworks, databases, tools)  
   - CI/CD pipeline setup and deployment plan  
   - Optional: Observability implementation  
   - Challenges faced and lessons learned  
3. **Presentation** (10 minutes) covering:
   - Project overview and target users  
   - Key microservices and interactions  
   - Technology used, deployment approach, and optional observability  
   - Demo (via Postman, `curl`, or optional frontend)  

---

## 6. Student Flexibility

- Students choose their own domain (e-commerce, social media, blogging, task management, etc.).  
- Must implement at least **2–3 independent services** communicating via APIs.  
- Encouraged to implement Docker and CI/CD for real-world workflow.  
- Optional: Frontend UI, observability, authentication, and async messaging.  

---

## 7. Learning Outcomes

By completing this project, students will learn:

- Designing and implementing microservices architecture  
- Building REST APIs and managing independent databases  
- Service-to-service communication patterns  
- Containerization with Docker  
- Automated CI/CD pipelines  
- Deployment strategies for independent microservices  
- Optional observability (logging, metrics, tracing)  
- Communicating technical work through reports and presentations  
