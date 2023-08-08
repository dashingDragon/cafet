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
- [ ] add history of transactions for users
- [ ] make a statistical graph for products
- [ ] make a better theme and a custom font
- [ ] add custom sandwiches
- [ ] store the global and products' stats somewhere

For the customer-side app :
- [ ] add the order page
- [ ] add the customer profile page
- [ ] take allergies into account
- [ ] add breakfast menu
- [ ] add formulas (serving+drink, serving+snack...)
- [ ] add current orders screen for staffs
- [ ] send customers notifications when
- [ ] add favorites recommendations
- [ ] recommend trending foods ?
