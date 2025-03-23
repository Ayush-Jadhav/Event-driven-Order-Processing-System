# Event-driven Order Processing System

A **scalable** and **efficient** order processing system built using **Node.js, Express.js, MongoDB, Redis, AWS SQS, and AWS SES**.
This system enables seamless order management with **event-driven architecture**, **caching**, and **email notifications**.

---

## Features
- **User Authentication** (JWT-based login and refresh tokens)
- **Order Management API** (CRUD operations on orders)
- **Event-Driven Processing** (Orders are pushed to AWS SQS and processed asynchronously)
- **Inventory Validation** (Orders validated before processing)
- **Redis Caching** (Faster order retrieval with a 10-minute expiration)
- **AWS SES Email Notifications** (Users receive order status updates)

---

## Architecture

### Components
1️⃣ **Order Service** - Handles order creation, updates, and retrieval.  
2️⃣ **Inventory Service** - Manages product stock & ensures availability.  
3️⃣ **Notification Service** - Sends email updates to users.
4️⃣ **Worker Service** - Polls AWS SQS for messages & processes orders.  

### 🔄 Order Flow
1. **User places an order** via the Order Service.  
2. The **order event** is published to AWS SQS.  
3. **Worker Service** listens to the SQS queue & validates the order.  
4. **Inventory Service** checks stock availability.  
5. If **successful**, an event triggers the **Notification Service** to send an **email**.
6. Order status is updated to **Processed or Failed** accordingly.  

---

## Setup Instructions

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/Ayush-Jadhav/Event-driven-Order-Processing-System.git
cd Event-driven-Order-Processing-System
```

### **2️⃣ Set Up Environment Variables**
Ensure all required environment variables are set in the `.env` file for the code to run properly.

### **3️⃣ Start the Application**
```sh
npm run dev
```
Now you are ready to work with the API.

---

## API Endpoints

### 🔹 **User Authentication**
#### **User Login (JWT-based)**
```http
POST /api/auth/login
```
**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```
**Response:**
```json
{
  "success": true,
  "token": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```


#### **Verify Email using OTP**
```http
POST /api/auth/emailVerify
```
**Request:**
```json
{
  "email": "user@example.com",
  "number": "123456789"
}
```
**Response:**
```json
{
  "success": true,
  "message": "OTP generated and sent successfully"
}
```


#### **User Registration**
```http
POST /api/auth/register
```
**Request:**
```json
{
  "name": "userDefault",
  "email": "user@example.com",
  "phone": "1234567890",
  "password": "securepassword",
  "confirmPassword": "securepassword",
  "otp": "123456"
}
```
**Response:**
```json
{
  "success": true,
  "message": "User created successfully"
}
```


#### **Refresh Token**
```http
POST /api/auth/refresh
```
**Request:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```
**Response:**
```json
{
  "success": true,
  "accessToken": "new_jwt_access_token"
}
```

---

### 🔹 **Order Management**
#### **Create a New Order**
```http
POST /api/orders
```
**Authentication:** ✅ Requires Bearer Token

**Request:**
```json
{
  "items": [
    { "productId": "product_id_1", "quantity": 2 },
    { "productId": "product_id_2", "quantity": 1 }
  ]
}
```
**Response:**
```json
{
    "success": true,
    "order": {
        "orderId": "e5ffc649-8ffa-4955-874a-55efce1a69b3",
        "userId": "67c84cae50d78eb016affe65",
        "items": [
            {
                "productId": "67c6f3ff25a916502ea3497d",
                "quantity": 2,
                "_id": "67c8bb03b19f5fedd14423d5"
            },
        ],
        "totalAmount": 240,
        "status": "Pending",
        "createdAt": "2025-03-05T20:58:17.036Z",
        "_id": "67c8bb03b19f5fedd14423d4",
    },
    "message": "Order placed successfully and sent to queue"
}
```

#### **Get Order Details**
```http
GET /api/orders/:id
```
**Authentication:** ✅ Requires Bearer Token

**Response:**
```json
{
    "_id": "67c8bb03b19f5fedd14423d4",
    "orderId": "e5ffc649-8ffa-4955-874a-55efce1a69b3",
    "userId": "67c84cae50d78eb016affe65",
    "items": [
        {
            "productId": "67c6f3ff25a916502ea3497d",
            "quantity": 2,
            "_id": "67c8bb03b19f5fedd14423d5"
        },
    ],
    "totalAmount": 240,
    "status": "Processed",
    "createdAt": "2025-03-05T20:58:17.036Z",
}
```

---

### 🔹 **Product Management**
#### **Add a New Product**
```http
POST /api/products
```
**Request:**
```json
{
  "name": "pen",
  "price": 10,
  "stock": 20
}
```
**Response:**
```json
{
    "success": true,
    "product": {
        "name": "pen",
        "price": 10,
        "stock": 20,
        "_id": "67c8a85a29bf2f9cb47c07a9",
        "createdAt": "2025-03-05T19:39:06.514Z",
        "__v": 0
    },
    "message": "Product added successfully"
}
```

#### **Update an Existing Product**
```http
PUT /api/products/:id
```
**Request:**
```json
{
  "name": "Gaming Laptop",
  "price": 1200,
  "stock": 8
}
```
**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully"
}
```

#### **Delete a Product**
```http
DELETE /api/products/:id
```
**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 🔹 **Performance & Scalability Features**
### **Redis Caching for Fast Order Retrieval**
- When an order is retrieved for the first time, it is fetched from **MongoDB** and cached in **Redis** for **10 minutes**.
- Subsequent requests fetch the order from **Redis**, improving performance.

### **Asynchronous Order Processing (AWS SQS)**
- Orders are **validated** and pushed to **AWS SQS**.
- A worker **polls the queue**, processes orders, and **updates status**.
- Once processed, an **email notification** is sent via **AWS SES**.

---




