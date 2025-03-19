Description

This project provides users with comprehensive information about programming contests from leading competitive programming platforms including Codeforces, LeetCode, and CodeChef. Users can filter contests, bookmark their favorites, and access YouTube solution videos with a single click. The platform automatically attaches YouTube solution links to contests, saving users valuable time when reviewing past competitions.

Features

1. Bookmark contests for quick access to preferred competitions
2. Filter contests by platform name, upcoming events, and completed contests
3. Automatic integration of YouTube solution links for efficient learning
4. Centralized dashboard for tracking all major competitive programming events
5. Cron scheduler to fetch contest details and youtube solution links automatically peiodically after specific time

Installation
```
# Clone the repository
   git clone https://github.com/Jayant-Rajput/TLE_Eliminators_task.git

# Navigate to the backend directory and install dependencies:
   
   cd backend
   npm install

# Navigate to the frontend directory and install dependencies:
   
   cd frontend
   npm install
   

# Install dependencies

    npm install
```
make a .env file in the root of backend folder
```
#.env

PORT = 
MONGODB_URI = 
JWT_SECRET = 
NODE_ENV = 
ADMIN_PASSKEY = 
API_KEY=

```

Open your browser and navigate to `http://localhost:5173` to access the application.


API References

CodeChef: `https://www.codechef.com/api/list/contests/all`
Codeforces: `https://codeforces.com/api/contest.list?gym=false`
LeetCode: `https://leetcode.com/graphql` with query:
```
query {
  allContests {
    title
    titleSlug
    startTime
    duration
  }
}
```
youtube: `https://www.googleapis.com/youtube/v3/search` with params:
```
params: {
        part: "snippet",
        channelId: 
        maxResults: 13,
        order: "date", // To get the latest videos
        key: process.env.API_KEY,
      },
```

App Video : 

https://github.com/user-attachments/assets/35424b55-57dc-4fc2-884e-d631dbe7f153


