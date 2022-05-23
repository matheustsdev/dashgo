import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";
import { AuthTokenError } from "../errors/AuthTokenError";
import { signOut } from "../hooks/useAuth";

type ErrorResponse = {
  code: string;
  message: string;
  error: boolean;
};

let isRefreshing = false;
let failedRequestsQueue = [];

export function setupAuthAPIClient(ctx = undefined) {
  let cookies = parseCookies(ctx);

  const authApi = axios.create({
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
          cookies = parseCookies(ctx);

          const { "dashgoAuth.refreshtoken": refreshToken } = cookies;
          const originalConfig = error.config;

          if (!isRefreshing) {
            isRefreshing = true;

            authApi
              .post("refresh", {
                refreshToken,
              })
              .then((response) => {
                const { token } = response.data;

                setCookie(ctx, "dashgoAuth.token", token, {
                  maxAge: 60 * 60 * 24 * 30, //30 dias
                  path: "/",
                });
                setCookie(
                  ctx,
                  "dashgoAuth.refreshtoken",
                  response.data.refreshToken,
                  {
                    maxAge: 60 * 60 * 24 * 30, //30 dias
                    path: "/",
                  }
                );

                authApi.defaults.headers["Authorization"] = "Bearer " + token;

                failedRequestsQueue.forEach((request) =>
                  request.onSucess(token)
                );
                failedRequestsQueue = [];
              })
              .catch((err) => {
                failedRequestsQueue.forEach((request) =>
                  request.onFailure(err)
                );
                failedRequestsQueue = [];

                if (process.browser) {
                  signOut();
                }
              })
              .finally(() => {
                isRefreshing = false;
              });
          }

          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              onSucess: (token: string) => {
                originalConfig.headers["Authorization"] = "Bearer " + token;

                resolve(authApi(originalConfig));
              },
              onFailure: (err: AxiosError) => {
                reject(err);
              },
            });
          });
        } else {
          if (process.browser) {
            signOut();
          } else {
            return Promise.reject(new AuthTokenError());
          }
        }
      }
      return Promise.reject(error);
    }
  );
  return authApi;
}
