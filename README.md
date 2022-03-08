# S'Beer Eck App (V2)

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
