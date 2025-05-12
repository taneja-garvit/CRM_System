Xeno CRM Backend
Backend for the Xeno SDE Internship Mini CRM Platform.
Setup Instructions

Clone the repository:
git clone <repo-url>
cd xeno-crm-backend


Install dependencies:
npm install


Create a .env file with the following:
PORT=5000
MONGO_URI=mongodb://localhost:27017/xeno-crm
REDIS_URL=redis://localhost:6379
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret


Start MongoDB and Redis locally.

Run the server:
npm start


Access Swagger UI at http://localhost:5000/api-docs.


Architecture

Frontend: (To be built with React.js)
Backend: Node.js, Express.js
Database: MongoDB
Message Broker: Redis Streams
Authentication: Google OAuth 2.0, JWT

Known Limitations

AI integration not yet implemented.
Batch processing for delivery status updates is basic.

Tech Used

Node.js, Express.js, MongoDB, Redis, Passport.js, Swagger UI

