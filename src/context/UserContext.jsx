import React, { createContext, useCallback, useState } from "react";

export const UserContext = createContext(null);

function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const setLoggedInUser = useCallback((user) => {
    setUser(user);
  }, []);

  const clearLoggedInUser = useCallback(() => {
    setUser(null);
  }, []);

  return <UserContext.Provider value={{ user, setLoggedInUser, clearLoggedInUser }}>{children}</UserContext.Provider>;
}

export default UserProvider;
