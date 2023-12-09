# Kfet web app (V1)

The stack used:
* React
* Next.js
* MUI
* Firebase (Firestore)

## Build

A few scripts are available:
* `npm run dev`: Start a development server
* `npm run build`: Build the app for production
* `npm start`: Start a production server (requires a production build to be available)
* `npm deploy-web`: Deploy the application only (not the cloud functions)
* `npm run fmt`: Reformat the whole project

The scripts are defined in `package.json`.
Note : the cafet and kafet-imag-functions projects are separate. You can build them independently using ``npm run build`` in their respective root directories.

## Deployment

To deploy the app to firebase, you should have the firebase CLI installed and be connected to a firebase account with privilege for this application.
After building the app, you can deploy it : 
```bash
npm run build
firebase deploy
```
Note : ``firebase deploy`` will build the kafet-imag-functions project under the hood.

You can also decide to only deploy some functions to reduce overhead work from the server (by default functions are redeployed even if there is no change) : 
```bash
firebase deploy --only functions
firebase deploy --only functions:makeTransaction,functions:getFirestoreUser
```

At any moment, you can check the status of the application on Firebase and the associated cloud functions on GCP.

Note : the logging on GCP functions can be tricky. In case you need to debug the functions, I would recommend that you deploy them locally using 
```bash
firebase emulators:start --only functions
```
Then go to the ``firebaseFunctionHooks.ts`` file and set the boolean to ``LOCAL_FUNCTIONS`` to True. 
**WARNING** : do not forget to set it back to False when building the production app !!!

You can also emulate Firestore locally if you do not want to affect the production database.
Lastly, if you plan on logging things in the production functions, you should try logging the most valuable information only, with the highest precisison possible about what happened.
The GCP function logs are very messy and do not bear metadata (request origin, payload, etc)


## Structure
* `pages`: Different pages of the app, following the Next.js scheme, they only take the arguments in the URL and pass it to a component in `components`.
* `components`: Contains the UI components.
* `lib`: Contains all of the data structures and logic (in custom hooks).
* `public`: contains assets like images or logos.
* `firestore.rules`: contains the firestore rules to control access to the database
* `firestore.indexes.json`: defines special indexes to perform relational requests on the database (you can define them in the Firebase console and download them when it is suggested to you in the deploying phase).
* `.firebaserc`: configuration file for the Firebase CLI.
* `firebase.json`: defines scripts and arguments for Firebase commands (hosting and functions).
* `kafet-imag-functions` : separate project containing the GCP functions used in the application. You only need to care about the ``src/index.ts`` file. It is very touchy with the Typescript syntax.
* `styles`: folder with the css styles of the app. Not used here.

If you are not familiar with Next applications, here is a summary of the other elements : 
* `out` : built application.
* `node_modules`: npm packages and modules you need in your app.
* `package.json`: contains metadata about the application (name, version), scripts or aliases for commands in the local directory, the root dependencies for your application and the developer dependencies that will not be compiled in the production application.
* `package-lock.json`: represents the exact state of your npm project, with all installed packages, their dependencies and their versions. Installing from package.json with npm install will look for the latest version of the package by default, however installing
* `.eslintrc.json`: rules for ESLint, a linter for JS.
* `tsconfig.json`: defines the TypeScript configuration. You can customize it.
* `.next`: NextJS configuration files. Do not touch.
* `.firebase`: Firebase configuration files. Do not touch.
* `.gitignore`: defines the files that should be ignored by git.

## Security

**A quick note about appsec**

This application, given the sensitive data is handles, ought to be secure.

Firstly, the GCP API is the crucial point to defend. Each request should properly check if the requesting user has permission to call the function, and each parameter should be sanitized and verified. **Do not trust the user**. Always check quantities and balance with the server. I have used zod to perform runtime checks on request payloads. You should also be careful about input sanitization in the future, in order to avoid XSS attacks.

Secondly, Firestore rules should be properly configured and give the least privilege to each role. It can be easier to create a GCP function for some action instead of creating a new role or adding permissions to a role.

Finally, the client-side of the application should restrict a user to only what they are allowed to see. As of today, I don't think the access control on the client-side is properly implemented, meaning if a customer wants to access the admin page, it could be able to do it, but it should not be able to list orders or other customers because the API is correctly secured. 

## Git

I have been using the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) syntax, and you should do the same. All the progress in this app can be understood from the commit tree.

## TODO list

It would be great to create User Stories (use cases) and automatic tests to check if the functionalities of the application are well implemented.

Here is the TODO-list of the project, for the staff-side app :
- [x] add list of customers
- [x] add menu to edit customer account, balance
- [x] add servings, drinks and snacks images
- [x] add product editor
- [x] add history of transactions for users
- [x] make transaction function
- [x] make a better theme and a custom font
- [x] add the list of current orders with daily number
- [x] add ingredients
- [x] take allergies into account
- [x] add sandwich size
- [x] add custom composition for sandwiches
- [x] add more icons and colors
- [x] compute the number of baguettes needed for a day
- [x] store the global and products' stats somewhere
- [x] cash in the order when serving
- [x] add snackbars when adding a product to the basket
- [x] add modify order button
- [x] put snackbar in the top level component
- [x] show if an account is linked to a google account
- [x] check if ingredientPrice is taken into account everywhere
- [x] use better images
- [x] add cancel order button
- [x] make a backup script for the database
- [ ] make a statistical graph for products

For the customer-side app :
- [x] add current orders screen for staffs
- [x] add the order page
- [x] change error screen for user
- [x] add a current and previous order list
- [x] add banner for user if their account money is low
- [x] add the customer profile page
- [x] use form validation to handle the sign up form
- [x] let user pick favorite foods
- [x] do not allow orders on weekend
- [x] add spinner when registering
- [x] add favorites recommendations
- [x] add banner for user if it is not time to order
- [ ] add cancel button for users
- [ ] add a button to disable orders for a day
- [ ] send customers notifications when their order is ready
- [ ] add banner for user if there is maintenance
- [ ] add formulas (serving+drink, serving+snack...)
- [ ] recommend trending foods ?
- [ ] make a day streak system
- [ ] make a monthly leaderboard of the longest cumulative sandwich size eaten
- [ ] let user add a custom message with the order (would have to sanitize user input, may be unsafe)
- [ ] add breakfast menu

