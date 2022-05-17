import { useQuery } from "react-query";
import { api } from "../api";

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type GetUserResponse = {
  totalCount: number;
  users: User[];
};

async function getUsers(page: number): Promise<GetUserResponse> {
  const startUser = (page - 1) * 10;
  const { data, headers } = await api.get("users", {
    params: {
      _start: startUser,
      _limit: 10,
    },
  });

  console.log(data);

  const totalCount = Number(headers["x-total-count"]);

  const users = data.map((user) => {
    return {
      ...user,
      createdAt: new Date(user.createdAt).toLocaleDateString("pt-Br", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    };
  });

  return { users, totalCount };
}

export function useUsers(page: number) {
  return useQuery(["users", page], () => getUsers(page), {
    staleTime: 1000 * 60 * 10, //10 minutos
  });
}
