# OccluMate - Dental Practice Management System

OccluMate is a comprehensive dental practice management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## System Requirements

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone [repository-url]
cd occlumate

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend Configuration (.env)

Create a `.env` file in the `backend` directory with the following variables:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
NODE_ENV=production

# Optional: Twilio configurations for SMS
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

#### Frontend Configuration (.env)

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Create Initial Admin Account

To create the first admin account, run the following script:

```bash
cd backend
node createInitialAdmin.js
```

This will create an admin account with these credentials:
- Email: admin@occlumate.com
- Password: admin123

**Important**: Change these credentials immediately after first login!

### 4. Change Admin Password

You can change the admin password using either:

1. **Command Line Tool**:
```bash
cd backend
node changeAdminPassword.js
```
Follow the prompts to:
- Enter admin email
- Enter current password
- Enter and confirm new password

2. **Web Interface**:
- Log in to the admin dashboard
- Go to Profile Settings
- Click "Change Password"
- Enter current and new passwords

### 5. Add Staff Members

You can add staff members (Dentists and Receptionists) using either:

1. **Command Line Tool**:
```bash
cd backend
node addStaffMember.js
```
Follow the prompts to:
- Enter your admin credentials
- Enter staff member's details:
  - Name
  - Email
  - Role (Dentist/Receptionist)
- A temporary password will be generated automatically
- Staff credentials will be sent to their email

2. **Web Interface**:
- Log in as admin
- Go to Staff Management
- Click "Add New Staff"
- Fill in the required details
- The staff member will receive their credentials via email

### 6. Start the Application

```bash
# Start backend server
cd backend
npm run start

# In a new terminal, start frontend
cd frontend
npm run dev
```

## First-Time Setup After Installation

1. **Login as Admin**
   - Visit `http://localhost:5173` (or your deployed URL)
   - Login with the initial admin credentials
   - Go to Profile and change the admin password

2. **Create Staff Accounts**
   - In the admin dashboard, go to "Staff Management"
   - Click "Add New Staff"
   - Fill in the staff member's details:
     - Name
     - Email
     - Role (Dentist/Receptionist)
     - Initial password
   - The staff member will receive an email with login credentials

3. **Configure System Settings**
   - Set up working hours
   - Configure appointment slots
   - Set up email notifications
   - Configure SMS settings (if using Twilio)

## Security Recommendations

1. **Change Default Credentials**
   - Immediately change the admin password after first login
   - Require staff to change their passwords on first login
   - Use strong passwords (min. 8 characters, mix of letters, numbers, symbols)

2. **Environment Security**
   - Keep your `.env` files secure and never commit them to version control
   - Regularly rotate JWT secrets and API keys
   - Use secure HTTPS connections in production

## Backup and Maintenance

1. **Database Backup**
   - Regular automated backups are recommended
   - MongoDB Atlas provides automated backup solutions
   - For local MongoDB, set up cron jobs for regular dumps

2. **System Updates**
   - Regularly update npm packages
   - Keep Node.js version updated
   - Monitor security advisories

## Support and Troubleshooting

For support:
- Check the logs in `backend/logs`
- Review MongoDB connection in case of database issues
- Verify environment variables are correctly set
- Check network connectivity and firewall settings

## License

[Your License Information]

---

For additional support or custom development, contact: [Your Contact Information]

## Staff Management

### Adding Staff Members
As an admin, you can add new staff members (Dentists and Receptionists) in two ways:

1. Using the Web Interface:
   - Log in as an admin
   - Navigate to "Staff Management" in the navigation menu
   - Click "Add Staff Member"
   - Fill in the required information:
     - Name
     - Email
     - Role (Dentist or Receptionist)
   - Click "Add Staff" to create the account
   - The staff member will receive an email with their login credentials

2. Using the Command Line Tool:
   - Navigate to the backend directory
   - Run `node addStaffMember.js`
   - Enter your admin credentials when prompted
   - Provide the staff member's details:
     - Name
     - Email
     - Role
   - The script will generate a temporary password and send it to the staff member's email

### Managing Staff Members
As an admin, you can:
- View all staff members
- Edit staff member details
- Delete staff members
- Monitor staff activity

### Security Notes
- Staff members should change their password after their first login
- Only admin users can access the staff management features
- Admin accounts cannot be modified or deleted through the staff management interface 

## Troubleshooting Common Issues

### Authentication Issues

#### 1. Login Success but Immediate Redirect to Login Page

**Symptom:**
- User successfully logs in (API returns 200 status)
- Console shows successful login response with token
- User is immediately redirected back to the login page
- Console shows "Invalid response format" error

**Cause:**
The issue occurred due to a mismatch between the API response format and the frontend's expected format. The authentication context was expecting a nested structure `{ token, user }`, but the API was returning a flat structure with the token as a property alongside user data:

```javascript
// Expected format:
{
  token: "jwt-token",
  user: {
    _id: "user-id",
    name: "username",
    email: "user@email.com",
    role: "Admin"
  }
}

// Actual API response format:
{
  _id: "user-id",
  name: "username",
  email: "user@email.com",
  role: "Admin",
  token: "jwt-token"
}
```

**Solution:**
Updated the login function in `authContext.jsx` to handle the flat response structure:
1. Extract the token from the response data
2. Remove the token from the user data object
3. Store the token in localStorage
4. Set the remaining user data in the application state

```javascript
const userData = response.data;
if (userData && userData.token) {
  const { token, ...userWithoutToken } = userData;
  localStorage.setItem("token", token);
  setUser(userWithoutToken);
}
```

**Prevention:**
- Always validate API response formats during integration
- Add comprehensive debug logging for authentication flows
- Ensure frontend expectations match backend response structures
- Document API response formats in API documentation
