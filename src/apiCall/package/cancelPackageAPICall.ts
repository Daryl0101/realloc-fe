"use server";
import { getServerSession } from "next-auth";
import { options } from "../../app/api/auth/[...nextauth]/options";
import { ApiResponse, getErrorMessage } from "../../lib/utils";

export const cancelPackageAPICall = async (
  id: string | null,
  cancelReason: string
) => {
  const session = await getServerSession(options);
  var res = null;
  try {
    if (!id) return { error: "Package ID not found" };
    res = await fetch(`${process.env.BASE_API_PATH}/package/${id}/cancel`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${session?.user.token}`,
      },
      body: JSON.stringify({
        cancel_reason: cancelReason,
      }),
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
    ? { success: "Package cancelled successfully" }
    : { error: "Something went wrong" };
};
