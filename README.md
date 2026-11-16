# Pro Business App

A full-stack business management application built with React, Vite, Node.js, Express, and MongoDB. The application provides user authentication, product management, and employee management through a responsive web interface.

## Live Demo

**Live Website:** https://pro-business-app.pages.dev

**Backend API:** https://pro-business-app-1.onrender.com

**GitHub Repository:** https://github.com/OmerMasih/pro-business-app

Visit the live website, create an account, and log in to explore the application.

> Note: The free Render backend may take around 50 seconds or more to respond after a period of inactivity while it starts up.

## Project Overview

Pro Business App is designed to help businesses manage basic operations in one place.

The application includes a frontend built with React and a backend REST API built with Node.js and Express. MongoDB Atlas stores application data, while JSON Web Tokens (JWT) provide authentication for protected API routes.

## Features

### 1. User Authentication

- User registration with full name, email, and password.
- User login with email and password.
- Password hashing using bcryptjs.
- JWT-based authentication.
- Protected API endpoints.
- Token expiration after 24 hours.

### 2. Product Management

- View products.
- Add new products.
- Update existing products.
- Delete products.
- Store product information in MongoDB.

### 3. Employee Management

- Add employees.
- View employee records.
- Search employees by name or position.
- Update employee information.
- Delete employee records.
- Track employee status.
- View employee statistics.

### 4. Dashboard

- Home page for accessing business information.
- Product and employee data displayed through backend API requests.

## Technologies Used

### Frontend

- React.js
- Vite
- JavaScript (ES6+)
- HTML5
- CSS3
- React Router
- Fetch API

### Backend

- Node.js
- Express.js
- MongoDB
- MongoDB Atlas
- Mongoose
- JSON Web Token (JWT)
- bcryptjs
- CORS
- dotenv

### Deployment and Development Tools

- Git and GitHub
- Cloudflare Pages
- Render
- MongoDB Atlas
- npm
- Visual Studio Code

## Application Architecture

The application uses a three-part architecture:

1. **Frontend:** React application hosted on Cloudflare Pages.
2. **Backend:** Express REST API hosted on Render.
3. **Database:** MongoDB Atlas for storing users, products, and employees.

The frontend sends HTTP requests to the backend API. The backend validates requests, communicates with MongoDB, and returns JSON responses.

## Project Structure

```text
pro-business-app/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Products.jsx
│   │   └── Employees.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── server/
│   ├── models/
│   │   ├── User.js
│   │   ├── product.js
│   │   └── Employee.js
│   │
│   ├── index.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env
│
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
└── README.md
```

## API Endpoints

The backend provides the following REST API endpoints.

### Authentication

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Log in a user       |

### Products

| Method | Endpoint            | Description      |
| ------ | ------------------- | ---------------- |
| GET    | `/api/products`     | Get all products |
| POST   | `/api/products`     | Create a product |
| PUT    | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |

### Employees

| Method | Endpoint             | Description        |
| ------ | -------------------- | ------------------ |
| GET    | `/api/employees`     | Get employees      |
| POST   | `/api/employees`     | Create an employee |
| PUT    | `/api/employees/:id` | Update an employee |
| DELETE | `/api/employees/:id` | Delete an employee |

Product and employee endpoints require a valid JWT access token in the Authorization header:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

## Installation and Local Development

Follow these steps to run the application locally.

### 1. Clone the Repository

```bash
git clone https://github.com/OmerMasih/pro-business-app.git
```

### 2. Open the Project

```bash
cd pro-business-app
```

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Install Backend Dependencies

```bash
cd server
npm install
```

### 5. Configure Environment Variables

Create a `.env` file inside the `server` directory.

Add the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_private_random_secret
```

Important:

- Use your own MongoDB Atlas connection string.
- Generate a strong private JWT secret.
- Never upload your `.env` file or expose your credentials on GitHub.

### 6. Start the Backend

From the `server` directory:

```bash
npm start
```

The backend will run locally on:

```text
http://localhost:5000
```

### 7. Start the Frontend

Open a second Terminal window.

Go to the project root:

```bash
cd pro-business-app
```

Start the Vite development server:

```bash
npm run dev
```

Open the local development URL shown in your Terminal, usually:

```text
http://localhost:5173
```

For local development, configure the frontend API addresses to use your local backend. For the deployed website, use the Render backend URL.

## Environment Variables

The backend uses the following environment variables:

| Variable     | Purpose                                   |
| ------------ | ----------------------------------------- |
| `PORT`       | Backend server port                       |
| `MONGO_URI`  | MongoDB database connection               |
| `JWT_SECRET` | Secret used to sign and verify JWT tokens |

Never commit actual environment variable values or passwords.

## Deployment

### Frontend – Cloudflare Pages

The React frontend is deployed using Cloudflare Pages.

- Repository: `OmerMasih/pro-business-app`
- Framework: React + Vite
- Build command: `npm run build`
- Build output directory: `dist`
- Live URL: https://pro-business-app.pages.dev

### Backend – Render

The Express backend is deployed using Render.

- Repository: `OmerMasih/pro-business-app`
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Live URL: https://pro-business-app-1.onrender.com

Set the backend environment variables in Render's Environment settings.

### Database – MongoDB Atlas

MongoDB Atlas provides cloud database hosting.

The application uses Mongoose to connect to MongoDB and manage:

- User records
- Product records
- Employee records

Keep the database credentials private and configure appropriate database access permissions.

## Production Build

To create an optimized frontend production build:

```bash
npm run build
```

Vite generates the production files inside the `dist` directory.

## Learning Outcomes

This project provided practical experience with:

- Building a full-stack application.
- Developing reusable React components.
- Creating REST APIs with Express.
- Connecting a Node.js backend to MongoDB Atlas.
- Implementing user registration and login.
- Hashing passwords securely.
- Creating and verifying JWT authentication tokens.
- Protecting backend routes.
- Managing application data with Mongoose.
- Deploying a frontend and backend separately.
- Using Git and GitHub for version control.
- Configuring production environment variables.
- Troubleshooting deployment and API connection issues.

## Future Improvements

Potential future enhancements include:

- Role-based access control.
- Improved dashboard analytics.
- Product categories and inventory tracking.
- Employee profile management.
- Form validation and improved error handling.
- Pagination and advanced search.
- Automated testing.
- Improved API security and monitoring.

## Author

**Masihullah Omer**

Full-Stack Web Development Project

GitHub: https://github.com/OmerMasih

---

## Project Links

- **Live Application:** https://pro-business-app.pages.dev
- **GitHub Repository:** https://github.com/OmerMasih/pro-business-app
- **Backend API:** https://pro-business-app-1.onrender.com
