import React from "react";

export const UserContext = createContext(null);

function UserProvider({children}) {
  return <UserContext.Provider value={{}}>{children}</UserContext.Provider>;
}

export default UserProvider;
