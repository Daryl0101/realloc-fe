"use server";
import { getServerSession } from "next-auth";
import { options } from "../../app/api/auth/[...nextauth]/options";
import { ApiResponse, getErrorMessage } from "@/src/lib/utils";

const logoutAPI = `${process.env.BASE_API_PATH}/authentication/logout`;

export const logoutAPICall = async () => {
  const session = await getServerSession(options);
  var res = null;
  try {
    res = await fetch(logoutAPI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${session?.user.token}`,
      },
    });
  } catch (error) {
    return { error: getErrorMessage(error) };
  }

  const result: ApiResponse<boolean> = await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model
    ? { success: "Logout successful" }
    : { error: "Something went wrong" };
};
