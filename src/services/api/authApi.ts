import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";
import { api } from ".";

type ErrorResponse = {
  code: string;
  message: string;
  error: boolean;
};

let cookies = parseCookies();

export const authApi = axios.create({
  baseURL: "http://localhost:3333/",
  headers: {
    Authorization: `Bearer ${cookies["dashgoAuth.token"]}`,
  },
});

authApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ErrorResponse>) => {
    if (error.response.status === 401) {
      if (error.response.data?.code === "token.expired") {
        cookies = parseCookies();

        const { "dashgoAuth.refreshtoken": refreshToken } = cookies;

        authApi
          .post("refresh", {
            refreshToken,
          })
          .then((response) => {
            const { token } = response.data;

            setCookie(undefined, "dashgoAuth.token", token, {
              maxAge: 60 * 60 * 24 * 30, //30 dias
              path: "/",
            });
            setCookie(
              undefined,
              "dashgoAuth.refreshtoken",
              response.data.refreshToken,
              {
                maxAge: 60 * 60 * 24 * 30, //30 dias
                path: "/",
              }
            );

            authApi.defaults.headers["Authorization"] = "Bearer " + token;
          });
      } else {
      }
    }
  }
);
