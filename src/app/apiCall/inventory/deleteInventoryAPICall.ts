"use server";
import { getServerSession } from "next-auth";
import GlobalConfig from "../../../../app.config";
import { options } from "../../api/auth/[...nextauth]/options";
import { ApiResponse, getErrorMessage } from "../../../lib/utils";

export const deleteInventoryAPICall = async (props: {
  id: string | null;
  reason: string;
}) => {
  const session = await getServerSession(options);
  var res = null;
  try {
    if (!props.id) return { error: "Inventory ID not found" };
    res = await fetch(
      `${GlobalConfig.baseAPIPath}/inventory-management/inventories/${props.id}/delete` +
        "?" +
        new URLSearchParams({ qty: "0", reason: props.reason }),
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
    ? { success: "Inventory deleted successfully" }
    : { error: "Something went wrong" };
};
