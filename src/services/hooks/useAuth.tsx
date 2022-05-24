import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { parseCookies, setCookie, destroyCookie } from "nookies";
import Router from "next/router";
import { authApi } from "../api/authAPIClient";
import { deflate } from "zlib";

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
  signOut(): void;
  user: User;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

export function signOut() {
  destroyCookie(undefined, "dashgoAuth.token");
  destroyCookie(undefined, "dashgoAuth.refreshtoken");

  authChannel.postMessage("signOut");

  Router.push("/");
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      setIsAuthenticated(true);

      authApi.defaults.headers["Authorization"] = "Bearer " + token;

      Router.push("/dashboard");
      authChannel.postMessage("signIn");
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    const { "dashgoAuth.token": token } = parseCookies();

    if (token) {
      authApi
        .get("me")
        .then((response) => {
          const { email, permissions, roles } = response.data;

          setUser({ email, permissions, roles });
          setIsAuthenticated(true);
        })
        .catch(() => {
          signOut();
        });
    }
  }, []);

  useEffect(() => {
    authChannel = new BroadcastChannel("auth");

    authChannel.onmessage = (message) => {
      switch (message.data) {
        case "signOut":
          Router.reload();
          break;
        case "signIn":
          Router.reload();

          break;
        default:
          break;
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ signIn, signOut, user, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const hook = useContext(AuthContext);

  return hook;
}
