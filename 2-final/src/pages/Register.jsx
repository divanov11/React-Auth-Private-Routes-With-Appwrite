import React, {useRef} from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'

const Register = () => {
  const registerForm = useRef(null)
  const {registerUser} = useAuth()

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

  return (
    <div className="container">
      <div className="login-register-container">
        <form ref={registerForm} onSubmit={handleSubmit}>

        <div className="form-field-wrapper">
              <label>Name:</label>
              <input 
                required
                type="text" 
                name="name"
                placeholder="Enter name..."
                />
          </div>

          <div className="form-field-wrapper">
              <label>Email:</label>
              <input 
                required
                type="email" 
                name="email"
                placeholder="Enter email..."
                />
          </div>

          <div className="form-field-wrapper">
              <label>Password:</label>
              <input 
                type="password"
                name="password1" 
                placeholder="Enter password..."
                autoComplete="password1"
                />
          </div>

          <div className="form-field-wrapper">
              <label>Confirm Password:</label>
              <input 
                type="password"
                name="password2" 
                placeholder="Confirm password..."
                autoComplete="password2"
                />
          </div>


          <div className="form-field-wrapper">

              <input 
                type="submit" 
                value="Register"
                className="btn"
                />

          </div>

        </form>

        <p>Already have an account? <Link to="/login">Login</Link></p>

      </div>
  </div>
  )
}

export default Register
