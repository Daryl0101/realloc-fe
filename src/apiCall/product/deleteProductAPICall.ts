"use server";
import { getServerSession } from "next-auth";
import { options } from "../../app/api/auth/[...nextauth]/options";
import { ApiResponse, getErrorMessage } from "../../lib/utils";

export const deleteProductAPICall = async (id: string | null) => {
  const session = await getServerSession(options);
  var res = null;
  try {
    if (!id) return { error: "Product ID not found" };
    res = await fetch(
      `${process.env.BASE_API_PATH}/master-data/products/${id}/delete`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${session?.user.token}`,
        },
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
    ? { success: "Product deleted successfully" }
    : { error: "Something went wrong" };
};
