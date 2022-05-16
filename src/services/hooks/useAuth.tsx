import { createContext, ReactNode, useContext, useState } from "react";
import { authApi } from "../api/authApi";

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function signIn({ email, password }: SignInCredentials) {
    console.log(email, password);
    try {
      console.log("OnTryStart");
      const response = await authApi
        .post("sessions", {
          email: email,
          password: password,
        })
        .then((data) => {
          console.log(data);
          return data;
        })
        .catch((e) => console.log(e));

      console.log("OnTryEnd");
      console.log(response);
    } catch (e) {}
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const hook = useContext(AuthContext);

  return hook;
}
