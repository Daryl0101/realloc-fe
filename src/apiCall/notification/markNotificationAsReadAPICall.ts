"use server";
import { getServerSession } from "next-auth";
import { options } from "../../app/api/auth/[...nextauth]/options";
import { ApiResponse, getErrorMessage } from "../../lib/utils";

export const markNotificationAsReadAPICall = async (id: string) => {
  const session = await getServerSession(options);
  var res = null;
  if (!id) {
    return { error: "Notification ID is required" };
  }
  try {
    res = await fetch(
      `${process.env.BASE_API_PATH}/notification/mark-as-read`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${session?.user.token}`,
        },
        body: JSON.stringify({ notification_id: id }),
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
    ? { success: "Notification marked as read" }
    : { error: "Something went wrong" };
};
