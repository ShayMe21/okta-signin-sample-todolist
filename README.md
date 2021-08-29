# React Sample To do List Application with Okta PKCE

This repository is a to do list single-page application (SPA) in React using PKCE OAuth2.0 flow.
`/okta-hosted-login` directory contains the React front-end
`/samples-nodejs-express-4` directory contains the resource server API for maintaining the to do list backend APIs that the front end will interact with.

The application features:
* Login with Okta hosted page using PKCE
* Fetch User Info details (ID Token)
* Fetch a User's to do list
* Secured backend resource server/API that connects to MongoDB
* Ability to add new items to the to do list
* Ability to delete items from to do list

### To run this locally:
1. Clone the repository
2. Run `npm install` on the root project directory and `/okta-hosted-login`
3. Run `npm run resource-server` from the root directory to start the resource server on port 8000.
4. Run `npm start` on the `/okta-hosted-login` to start the React application.
5. Visit `http://localhost:8080` on your browser to interact with the App.
6. When asked to sign use the sample credentials below.
```
sh@gmail.com / MyPassword123
```
