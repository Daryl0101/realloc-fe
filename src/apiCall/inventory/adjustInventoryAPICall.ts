"use server";
import { getServerSession } from "next-auth";
import { options } from "../../app/api/auth/[...nextauth]/options";
import { ApiResponse, getErrorMessage } from "../../lib/utils";

type Props = {
  id: string | null;
  qty: string;
  reason: string;
};

export const adjustInventoryAPICall = async (props: Props) => {
  const session = await getServerSession(options);
  var res = null;
  if (!props.qty) return { error: "Quantity is required" };
  if (!props.reason) return { error: "Reason is required" };
  try {
    if (!props.id) return { error: "Inventory ID is not found" };
    res = await fetch(
      `${process.env.BASE_API_PATH}/inventory-management/inventories/${props.id}/adjust`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${session?.user.token}`,
        },
        body: JSON.stringify({
          qty: props.qty,
          reason: props.reason,
        }),
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
    ? { success: "Inventory adjusted successfully" }
    : { error: "Something went wrong" };
};
