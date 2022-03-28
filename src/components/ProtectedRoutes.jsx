import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'

function ProtectedRoutes({ isPrivate, children }) {
  const { user } = useContext(UserContext)
  const redirectTo = isPrivate ? '/login': '/'
  if(( user && isPrivate ) || ( !user && !isPrivate )){
    return <div>{children}</div>
  }
  else{
    return <Navigate to={redirectTo} />
  }
}

export default ProtectedRoutes