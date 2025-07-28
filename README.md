# Time Tracking Management System

A comprehensive web application for managing tasks, tracking time, and monitoring productivity. Built with React.js frontend and Node.js/Express backend with MongoDB database.

## 🚀 Features

### Core Functionality
- **Task Management**: Create, read, update, and delete tasks
- **Time Tracking**: Track scheduled vs actual time spent on tasks
- **Daily Activity View**: View tasks grouped by daily activities
- **Productivity Analytics**: Comprehensive dashboard with charts and statistics
- **User Authentication**: Secure login/registration system
- **Real-time Updates**: Live task status updates and timer functionality

### Task Features
- Task creation with title, description, and category
- Scheduled start/end times
- Task status management (Scheduled, In Progress, Completed, Missed)
- Productivity scoring (1-10 scale)
- Timer functionality (start/stop tasks)
- Recurring tasks support

### Analytics & Reporting
- Daily, weekly, monthly productivity statistics
- Category-based performance analysis
- Time efficiency metrics
- Completion rate tracking
- Visual charts and graphs

## 🛠 Tech Stack

### Frontend
- **React.js** - UI framework
- **Material-UI** - Component library
- **Axios** - HTTP client
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Date-fns** - Date manipulation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📋 Prerequisites

Before running this application, make sure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd TimeTrackingMangementSystem
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend Environment
Create a `.env` file in the `backend` directory:
```env
MONGODB_URL=mongodb://localhost:27017/timetracking
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
PORT=5000
```

#### Frontend Configuration
The frontend is configured to proxy requests to the backend on port 5000. This is already set in `frontend/package.json`.

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On Windows
mongod

# On macOS/Linux
sudo systemctl start mongod
```

## 🏃‍♂️ Running the Application

### 1. Start the Backend Server
```bash
cd backend
npm start
```
The backend will start on `http://localhost:5000`

### 2. Start the Frontend Development Server
```bash
cd frontend
npm start
```
The frontend will start on `http://localhost:3000`

### 3. Access the Application
Open your browser and navigate to `http://localhost:3000`

## 📖 Usage Guide

### 1. User Registration/Login
- Navigate to the registration page
- Fill in your details (First Name, Last Name, Email, Password)
- After registration, you'll be automatically logged in
- Use the login page for subsequent access

### 2. Dashboard
- View today's task summary
- See productivity statistics
- Access quick actions for common tasks
- Monitor recent activities

### 3. Task Management
- **Create Tasks**: Click "Add Task" button
- **Edit Tasks**: Click the edit icon on any task
- **Delete Tasks**: Click the delete icon (with confirmation)
- **Start/Stop Tasks**: Use play/stop buttons to manage task status

### 4. Daily Activity View
- Select any date to view tasks for that day
- See task completion progress
- Start/stop timers for individual tasks
- View daily statistics

### 5. Productivity Dashboard
- Analyze productivity trends
- View category performance
- Monitor time efficiency
- Filter data by different time periods

## 🔧 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

### Task Endpoints

#### Get All Tasks
```
GET /api/tasks
Authorization: Bearer <token>
```

#### Create Task
```
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Task Title",
  "description": "Task Description",
  "category": "Work",
  "scheduledStart": "2024-01-15T09:00:00",
  "scheduledEnd": "2024-01-15T10:00:00",
  "status": "scheduled",
  "productivityScore": 8
}
```

#### Update Task
```
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Task Title",
  "status": "completed"
}
```

#### Delete Task
```
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

#### Start Task Timer
```
PUT /api/tasks/:id/start
Authorization: Bearer <token>
```

#### Stop Task Timer
```
PUT /api/tasks/:id/stop
Authorization: Bearer <token>
```

### Daily Activity Endpoints

#### Get Daily Activities
```
GET /api/daily-activities
Authorization: Bearer <token>
```

#### Get Daily Activity by Date
```
GET /api/daily-activities/:date
Authorization: Bearer <token>
```

### Statistics Endpoints

#### Get Productivity Statistics
```
GET /api/stats/productivity?period=week
Authorization: Bearer <token>
```

#### Get Category Statistics
```
GET /api/stats/categories
Authorization: Bearer <token>
```

#### Get Time Tracking Trends
```
GET /api/stats/trends?days=30
Authorization: Bearer <token>
```

## 📁 Project Structure

```
TimeTrackingMangementSystem/
├── backend/
│   ├── controllers/
│   │   ├── auth.js
│   │   ├── task.js
│   │   ├── dailyActivity.js
│   │   └── stats.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── async.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Task.js
│   │   └── DailyActivity.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── task.js
│   │   ├── dailyActivity.js
│   │   └── stats.js
│   ├── utils/
│   │   ├── errorResponse.js
│   │   ├── recurringTasks.js
│   │   └── reminderLogic.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.js
│   │   │   │   └── Register.js
│   │   │   ├── dashboard/
│   │   │   │   └── Dashboard.js
│   │   │   ├── tasks/
│   │   │   │   └── TaskManager.js
│   │   │   ├── daily/
│   │   │   │   └── DailyActivityView.js
│   │   │   ├── productivity/
│   │   │   │   └── ProductivityDashboard.js
│   │   │   ├── profile/
│   │   │   │   └── Profile.js
│   │   │   ├── layout/
│   │   │   │   ├── Header.js
│   │   │   │   ├── Footer.js
│   │   │   │   └── NotFound.js
│   │   │   └── routing/
│   │   │       └── PrivateRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation and sanitization
- CORS configuration
- Environment variable management

## 🚀 Deployment

### Backend Deployment
1. Set up a MongoDB database (MongoDB Atlas recommended)
2. Configure environment variables
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the connection string in `.env`
   - Verify network connectivity

2. **Authentication Errors**
   - Clear browser localStorage
   - Check JWT_SECRET in environment variables
   - Verify token expiration

3. **CORS Errors**
   - Ensure backend CORS is properly configured
   - Check frontend proxy settings

4. **Port Conflicts**
   - Change ports in `.env` files if needed
   - Ensure no other services are using the same ports

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 🔄 Version History

- **v1.0.0** - Initial release with basic task management
- **v1.1.0** - Added productivity analytics
- **v1.2.0** - Enhanced daily activity view
- **v1.3.0** - Added recurring tasks and reminders

---

**Happy Time Tracking! ⏰**