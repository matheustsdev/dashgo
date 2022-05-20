import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { parseCookies, setCookie } from "nookies";
import Router from "next/router";
import { authApi } from "../api/authApi";
import { api } from "../api";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  user: User;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const { "dashgoAuth.token": token } = parseCookies();

    if (token) {
      authApi.get("me").then((response) => {
        const { email, permissions, roles } = response.data;

        setUser({ email, permissions, roles });
      });
    }
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await authApi.post("sessions", {
        email: email,
        password: password,
      });

      const { token, refreshToken, permissions, roles } = response.data;

      setCookie(undefined, "dashgoAuth.token", token, {
        maxAge: 60 * 60 * 24 * 30, //30 dias
        path: "/",
      });
      setCookie(undefined, "dashgoAuth.refreshtoken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30, //30 dias
        path: "/",
      });

      setUser({ email, permissions, roles });

      authApi.defaults.headers["Authorization"] = "Bearer " + token;

      Router.push("/dashboard");

      console.log(response);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, user, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const hook = useContext(AuthContext);

  return hook;
}
