# API Database Project

## Overview
This project is an API that interacts with a SQLite database. It provides endpoints to retrieve data related to users, games, and transactions. The application is built using Node.js and Express.

## Project Structure
```
api-database-project
├── src
│   ├── app.js               # Entry point of the application
│   ├── db
│   │   ├── connection.js    # Database connection logic
│   │   └── queries.js       # Database query functions
│   ├── routes
│   │   └── index.js         # API routes
│   └── controllers
│       └── index.js         # Controller logic
├── package.json              # npm configuration file
├── .env                      # Environment variables
└── README.md                 # Project documentation
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   cd api-database-project
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your database connection string:
   ```
   DATABASE_URL=your_database_url_here
   ```

4. Start the server:
   ```
   npm start
   ```

## API Endpoints
- `GET /utilisateurs` - Retrieve all users from the database.
- `GET /jeux` - Retrieve all games from the database.
- `GET /transactions` - Retrieve all transactions from the database.

## Usage Examples
To fetch all users, you can use the following curl command:
```
curl http://localhost:3000/utilisateurs
```

## License
This project is licensed under the MIT License.