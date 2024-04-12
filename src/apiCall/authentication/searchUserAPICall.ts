"use server";

import { getServerSession } from "next-auth";

import { options } from "../../app/api/auth/[...nextauth]/options";
import {
  ApiResponse,
  PaginationResponse,
  getErrorMessage,
} from "../../lib/utils";

type SearchParams = {
  wildcard: string;
  role: string;
  gender: string;
};

type UserItem = {
  id: string;
  sequence: number | null;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_ngo_manager: boolean;
};

const userSearchAPI = `${process.env.BASE_API_PATH}/authentication/search`;

export const searchUserAPICall = async ({
  wildcard,
  role,
  gender,
}: SearchParams) => {
  const session = await getServerSession(options);
  var res = null;
  try {
    res = await fetch(
      userSearchAPI +
        "?" +
        new URLSearchParams({
          wildcard: wildcard,
          is_ngo_manager: role,
          gender: gender,
        }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${session?.user.token}`,
        },
      }
    );
  } catch (error) {
    return { error: getErrorMessage(error) };
  }

  const result: ApiResponse<PaginationResponse<UserItem>> = await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model ? result.model.items : { error: "Something went wrong" };
};
