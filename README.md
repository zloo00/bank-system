# **MicroBank — Microservice-Based Banking System**

## 1. General Project Description

As part of the session project, the backend of a banking system called **MicroBank** was developed using a **microservice architecture**.

The system is designed to support:

* user registration and authentication;
* bank account management;
* execution of financial transactions;
* document generation;
* notification delivery.

The project demonstrates modern approaches to building **distributed systems**, including containerization, asynchronous inter-service communication, and a centralized security system.

---

## 2. Rationale for Choosing Microservice Architecture

Microservice architecture was chosen for the following reasons:

* each service performs a single, well-defined business function;
* services can be developed, deployed, and scaled independently;
* system fault tolerance is improved;
* system maintenance and future extension are simplified.

Unlike monolithic applications, a failure of one service does not cause the entire system to stop.

---

## 3. System Architecture

The MicroBank project consists of a set of independent microservices that interact with each other via **REST APIs** and a **message broker**.

### Main system services:

### Discovery Service

Used for service registration and discovery using **Eureka**.

### API Gateway

Acts as a single entry point to the system. It handles request routing and token validation.

### Auth Service

Responsible for user registration, authentication, and token management.

### Account Service

Manages user bank accounts and account balances.

### Transaction Service

Handles money transfer operations between accounts.

### Document Service

Generates transaction-related documents and stores them in the storage system.

### Notification Service

Sends notifications to users (for example, via email).

---

## 4. Inter-Service Communication

Two types of communication are used in the system:

### 1. Synchronous Communication

Direct communication between services is implemented via **REST APIs** using **OpenFeign**.

### 2. Asynchronous Communication

For event processing and notification delivery, the **RabbitMQ** message broker is used.
This approach allows background operations to be executed without blocking core services.

---

## 5. Data Storage

The project utilizes several types of data storage systems:

* **PostgreSQL** — the primary relational database for each microservice;
* **Redis** — temporary storage for activation codes and service-related data;
* **MinIO** — object storage for documents and files.

Each microservice has its own dedicated database, which fully complies with microservice architecture principles.

---

## 6. Security and Authentication

**Keycloak** is used to ensure system security and identity management.

### Implemented security mechanisms include:

* authentication based on **OAuth2** and **OpenID Connect** protocols;
* role-based access control (roles: `USER`, `ADMIN`);
* JWT token validation at the API Gateway level;
* request authorization at the microservice level.

The authentication process includes:

* user registration;
* account activation using an activation code;
* access token generation;
* token usage when accessing the API.

---

## 7. Project Deployment

The project is deployed in a containerized environment using **Docker** and **Docker Compose**.

### Startup sequence:

1. start infrastructure services (databases, Keycloak, Redis, RabbitMQ, MinIO);
2. start the Discovery Service;
3. start the remaining microservices;
4. start the API Gateway.

Containerization ensures a consistent runtime environment and simplifies project deployment.

---

## 8. API Testing

**Postman** is used to test REST API endpoints.
A prepared Postman collection allows verification of:

* user registration and login;
* account operations;
* transaction execution;
* document retrieval.

---

## 9. Project Results

During the development of the session project, the following components were successfully implemented:

* a microservice-based banking system;
* secure user authentication and authorization;
* inter-service communication via REST and RabbitMQ;
* a fully containerized infrastructure.

The project demonstrates the practical application of modern backend development technologies and can serve as a foundation for further system enhancement.

---

## 10. Conclusion

As a result of completing this project, the following skills were acquired:

* microservice architecture design;
* working with Docker and Docker Compose;
* integration of Keycloak with Spring Security;
* configuration of asynchronous inter-service communication;
* development of fault-tolerant distributed systems.
