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
* `npm run fmt`: Reformat the whole project

## Structure
* `pages`: Different pages of the app, following the Next.js scheme, they only take the arguments in the URL and pass it to a component in `components`
* `components`: Contains the UI components
* `lib`: Contains all of the data structures and logic (in custom hooks)

## TODO list

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
- [ ] compute the number of baguettes needed for a day
- [ ] make a statistical graph for products
- [ ] store the global and products' stats somewhere
- [ ] add more icons and colors
- [ ] add collapse in products page
- [ ] make a backup script for the database

For the customer-side app :
- [ ] show current order for user
- [ ] inform user that the order is ready
- [ ] add the order page
- [ ] add the customer profile page
- [ ] add breakfast menu
- [ ] add formulas (serving+drink, serving+snack...)
- [ ] add current orders screen for staffs
- [ ] send customers notifications when their order is ready
- [ ] add favorites recommendations
- [ ] recommend trending foods ?
- [ ] make a day streak system
- [ ] make a monthly leaderboard of the longest cumulative sandwich size eaten
- [ ] let user add a custom message with the order (would have to sanitize user input, may be unsafe)