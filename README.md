# FIRE AVENGERS Web Application

A full-stack web application for managing fire safety data with admin and user dashboards.

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express
- MySQL
- JWT Authentication
- Multer (file uploads)

## Project Structure

```
fire-avengers-app/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── fireData.js
│   ├── uploads/
│   ├── .env
│   ├── database.sql
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AdminLogin.jsx
    │   │   ├── AdminRegister.jsx
    │   │   ├── UserLogin.jsx
    │   │   ├── UserRegister.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   └── UserDashboard.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

## Setup Instructions

### Prerequisites
- Node.js installed
- MySQL/XAMPP installed and running
- Git (optional)

### Database Setup

1. Start MySQL/XAMPP
2. Open phpMyAdmin or MySQL command line
3. Import the database schema:
   ```bash
   mysql -u root -p < backend/database.sql
   ```
   Or manually run the SQL commands in `backend/database.sql`

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=fire_avengers
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   UPLOAD_DIR=uploads
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173` (or another port as specified by Vite)

## Features

### Admin Dashboard
- User management (Create, Read, Update, Delete)
- Admin authentication
- View all registered users
- Edit user roles and information

### User Dashboard
- Fire safety data entry form matching the provided image layout
- Fields include:
  - Client Name
  - Serial Number
  - Installation Date
  - Area Name, District Name, State
  - Cylinder Size
  - Supply Type (Supply Only/SITC)
  - Handover Certificate upload
  - Invoice Number
  - Vehicle Name (Kitelen/Panel/TRFS)
  - Vehicle Number
  - Warranty dates
- Data display and search functionality
- Edit and delete own records
- Search by Client Name, Serial Number, State, or Invoice Number

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Fire Data (Authenticated users)
- `GET /api/fire-data` - Get all fire data for user
- `GET /api/fire-data/:id` - Get single fire data entry
- `GET /api/fire-data/search/:query` - Search fire data
- `POST /api/fire-data` - Create new fire data entry
- `PUT /api/fire-data/:id` - Update fire data entry
- `DELETE /api/fire-data/:id` - Delete fire data entry

## Default Credentials

After setting up the database, you can register new admin and user accounts through the respective registration pages.

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Choose between Admin or User login/register
3. For Admin: Register an admin account, then login to access the admin dashboard
4. For User: Register a user account, then login to access the user dashboard
5. Use the dashboards to manage users (admin) or fire safety data (user)

## File Uploads

- Handover certificates can be uploaded as images (JPEG, PNG) or PDFs
- Maximum file size: 5MB
- Files are stored in the `backend/uploads` directory
- Uploaded files are accessible via `http://localhost:5000/uploads/filename`

## Security Notes

- Change the JWT_SECRET in the backend `.env` file for production
- Use strong passwords for database and application accounts
- Implement HTTPS for production deployment
- Add rate limiting for API endpoints in production
- Validate and sanitize all user inputs

## Troubleshooting

### Database Connection Issues
- Ensure MySQL/XAMPP is running
- Check database credentials in `.env` file
- Verify the database `fire_avengers` exists

### Backend Issues
- Check that the backend server is running on port 5000
- Verify all dependencies are installed
- Check console for error messages

### Frontend Issues
- Ensure the frontend development server is running
- Check that the backend API is accessible
- Verify CORS settings in the backend

## Development

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run dev
```

## License

This project is for educational purposes.
