# React Auth & Private Routes With Appwrite

The perfect auth combo - In this tutorial I will demonstrate how to handle the entire authentication proccess along with adding private routes to our app wich will protect pages from unauthenticated users. All this with react router version 6.


In this video we will cover the following:

- Private Routes
- Auth Context
- User Login
- Persisting logged in user
- User Logout
- Registration

**Appwrite**

For our backend of choice I will use my new favorite platform called Appwrite wich will make authenication incredibly easy for us. If you haven't head of Appwrite yet it's a Backend As A Service (BaaS) platform that's a great alternitive to firebase. 

Appwrite is fully open sources and can be hosted localy or on the appwrite cloud. In this tutorial we will use the appwrite cloud so setup will take just a few minutes and then we can jump into coding our application.

**Starter Code**

For this project I have setup the boiler plate code with a few pages and some styling - We have a login, register + home and profile page wich we will start building around. 

Before we set anything up let's clone the github repo that we currently have an explore our template.

**appwriteConfig.js**

Once we have the started code setup we'll want to run `npm install` and create an `src/appwriteConfig.js` file.

## Appwrite Console Setup & Config

1. Create an account on appwrite.io
2. Create a project
3. Select a plarform - Select `Web App`
4. Set `localhost` as the host name and give your app a name
5. Install SDK and add to react app (appwriteConfig.js)

```
npm install appwrite
```

```js
//src/appwriteConfig.js
import { Client, Account } from 'appwrite';

export const API_ENDPOINT = 'https://cloud.appwrite.io/v1'
export const PROJECT_ID = 'YOUR PROJECT ID'

const client = new Client()
    .setEndpoint(API_ENDPOINT) 
    .setProject(PROJECT_ID);    

export const account = new Account(client);

export default client;

```

6. Create user


## Private routes

In this approach we will use thew `Outlet` component provided by react router 6.

The `Outlet` component acts as a placeholder for child routes, allowing you to define multiple private sub-routes under the same route.

```jsx
//utils/PrivateRoutes.jsx
import { Outlet, Navigate } from 'react-router-dom'

const PrivateRoutes = () => {
    const user = false; // Replace with your authentication logic

    return user ? <Outlet/> : <Navigate to="/login"/>
}
```

In this example, the `PrivateRoutes` component checks if the user is authenticated using the `checkAuth` function. If the user is authenticated, it renders the child routes defined inside the `Outlet` component. Otherwise, it redirects the user to the `/login` page.

In the next few steps I we will build out our `AuthContext` and a custom hook to check our auth status, until then we will hard code the status of `false` to represent an unauthenticated user.

**Using The `PrivateRoutes` component**

```jsx
...
import PrivateRoutes from './utils/PrivateRoutes'

function App() {
return (
    <Router>
        <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>

            <Route element={<PrivateRoutes />}>
                <Route path="/" element={<Home/>}/>
                <Route path="/profile" element={<Profile/>}/>
            </Route>

        </Routes>
    </Router>
    );
}
```

## AuthContext

Minimalist AuthContext to lift the user/auth state.

```jsx
//utils/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext()

export const AuthProvider = ({children}) => {

        const [loading, setLoading] = useState(true)
        const [user, setUser] = useState(null)

        useEffect(() => {
            setLoading(false)
         }, [])

         const loginUser = async (userInfo) => {}

         const logoutUser = async () => {}

         const registerUser = async (userInfo) => {}

         const checkUserStatus = async () => {}

        const contextData = {
            user,
            loginUser,
            logoutUser,
            registerUser
        }

    return(
        <AuthContext.Provider value={contextData}>
            {loading ? <p>Loading...</p> : children}
        </AuthContext.Provider>
    )
}

//Custom Hook
export const useAuth = ()=> {return useContext(AuthContext)}

export default AuthContext;
```

**Using The `AuthProvider` component**

Wrap all the routes within `App.jsx` with the `AuthProvider`

```jsx
...
import { AuthProvider } from './utils/AuthContext'

function App() {
    return (
        <Router>
            <AuthProvider>
                <Header/>
                <Routes>
                    ...
                </Routes>
            </AuthProvider>
        </Router>
    );
}
```


**Updating Private Route**

User state will now come from `AuthContext`

```js
...
import { useAuth } from './AuthContext'

const PrivateRoutes = () => {
    const {user} = useAuth()
    return user ? <Outlet/> : <Navigate to="/login"/>
}
```

**Header**

Render links & button based on auth state

```jsx
...
import { useAuth } from './AuthContext'

const Header = () => {
    const {user} = useAuth()


    ...

  return (
    <div className="header">
        ...

        <div className="links--wrapper">

            {user ? (
                 <>
                    <Link to="/" className="header--link">Home</Link>
                    <Link to="/profile" className="header--link">Profile</Link>

                    <button onClick={logoutClick} className="btn">Logout</button>
                </>
            ):(
                <Link className="btn" to="/login">Login</Link>
            )}
            
        </div>
    </div>
  )
}
```

## User Login

**Login Page**

Import User login Function

```jsx
//pages/login.jsx
const {user, loginUser} = useAuth()
```

Add ref to form

```jsx
//Import useRef
import React, { useEffect, useRef } from 'react'

//Add loginForm ref
const loginForm = useRef(null)

//Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault()
    const email = loginForm.current.email.value
    const password = loginForm.current.password.value
    
    const userInfo = {email, password}

    loginUser(userInfo)
  }

//Add ref and submit function to form
<form onSubmit={handleSubmit} ref={loginForm}> 
```


**`loginUser` Method**

Import `account` from `appwriteConfig` and add the following to the loginUser method

```jsx
//utils/AuthContext.jsx
...
import { account } from "../appwriteConfig";

...

const loginUser = async (userInfo) => {
    setLoading(true)
    try{
        let response = await account.createEmailSession(userInfo.email, userInfo.password)
        let accountDetails = await account.get();
        setUser(accountDetails)
    }catch(error){
        console.error(error)
    }
    setLoading(false)

}
```


**Persisting User Login**

Even though we may have a user session, the `user` state will always start as null, therefor keeping us from accessing any of the private routes.

We need a way to retrive the user session on load to set the user state.

WE can check the user status by calling the `checkUserStatus` method wich will now be responsible for updating the user and loading state from the useEffect hook.

```jsx
//utils/AuthContext.jsx

useEffect(() => {
    //setLoading(false)
    checkUserStatus()
}, [])


const checkUserStatus = async () => {
    try{
        let accountDetails = await account.get();
        setUser(accountDetails)
    }catch(error){
        
    }
    setLoading(false)
}
```

## User Logout

The user logout method will be stored inside of our `AuthContext` but called from the `Header,jsx` file.

```jsx
//components/Header.jsx

const {user, logoutUser} = useAuth()

<button onClick={logoutUser} className="btn">Logout</button>
```

Use the `account.deleteSession()` to delete the `current` user session

```jsx
//utils/AuthContext.jsx
const logoutUser = async () => {
    await account.deleteSession('current');
    setUser(null)
}
```

## Register User

Import `registerUser` from `AuthContext.jsx`

```jsx
//pages/Register.jsx
import { useAuth } from '../utils/AuthContext'
..
const {registerUser} = useAuth()
```

Add ref to form with submit handler

```jsx
import React, { useEffect, useRef } from 'react'
...
const registerForm = useRef(null)

const handleSubmit = (e) => {
    e.preventDefault()

    const name = registerForm.current.name.value
    const email = registerForm.current.email.value
    const password1 = registerForm.current.password1.value
    const password2 = registerForm.current.password2.value

    if(password1 !== password2){
        alert('Passwords did not match!')
        return 
    }
    
    const userInfo = {name, email, password1, password2}

    registerUser(userInfo)
}

...

<form ref={registerForm} onSubmit={handleSubmit}>
```

**Handeling Registration**

```jsx
//AuthContext.jsx
import { useNavigate } from "react-router-dom";
import { ID} from 'appwrite';

...
const navigate = useNavigate()

const registerUser = async (userInfo) => {
    setLoading(true)

    try{
        
        let response = await account.create(ID.unique(), userInfo.email, userInfo.password1, userInfo.name);

        await account.createEmailSession(userInfo.email, userInfo.password1)
        let accountDetails = await account.get();
        setUser(accountDetails)
        navigate('/')
    }catch(error){
        console.error(error)
    }

    setLoading(false)
}
```
