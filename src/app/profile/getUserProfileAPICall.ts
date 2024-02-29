"use server";
import { getServerSession } from "next-auth";
import { ApiResponse, Gender, getErrorMessage } from "../../lib/utils";
import { options } from "../api/auth/[...nextauth]/options";

type Model = {
  username: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  is_ngo_manager: boolean;
  date_joined: string;
  gender: Gender;
};

const profileGetAPI = `${process.env.BACKEND_API_URL}/authentication/profile`;

export const getUserProfileAPICall = async () => {
  var res = null;
  try {
    const session = await getServerSession(options);
    res = await fetch(profileGetAPI, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${session?.user.token}`,
      },
    });
  } catch (error) {
    return { error: getErrorMessage(error) };
  }

  const result: ApiResponse<Model> = await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return { error: result.errors };
  }

  return result.model ? result.model : { error: "Something went wrong" };
};
