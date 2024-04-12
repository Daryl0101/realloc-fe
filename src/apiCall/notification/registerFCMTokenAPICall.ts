"use server";
import { getServerSession } from "next-auth";
import { options } from "../../app/api/auth/[...nextauth]/options";
import { ApiResponse, getErrorMessage } from "../../lib/utils";

export const registerFCMTokenAPICall = async (token: string) => {
  const session = await getServerSession(options);
  var res = null;
  if (!token) {
    return { error: "FCM Token is required" };
  }
  try {
    res = await fetch(
      `${process.env.BASE_API_PATH}/notification/fcm/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${session?.user.token}`,
        },
        body: JSON.stringify({ fcm_token: token }),
      }
    );
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
    ? { success: "FCM Token registered successfully" }
    : { error: "Something went wrong" };
};
