"use server";
import { getServerSession } from "next-auth";
import { options } from "../../app/api/auth/[...nextauth]/options";
import { ApiResponse, apiDateFormat, getErrorMessage } from "../../lib/utils";
import dayjs from "dayjs";

const inventoryCreateAPI = `${process.env.BASE_API_PATH}/inventory-management/inventories/inbound`;

type Props = {
  productId: number;
  storageId: number;
  expirationDate: string;
  receivedDate: string;
  totalQty: string;
  numOfServing: string;
};

export const inboundNewInventoryAPICall = async (props: Props) => {
  const session = await getServerSession(options);
  var res = null;
  if (Object.values(props).includes("")) {
    return { error: "Fields cannot be empty" };
  }
  try {
    res = await fetch(inventoryCreateAPI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${session?.user.token}`,
      },
      body: JSON.stringify({
        product_id: props.productId,
        storage_id: props.storageId,
        expiration_date: dayjs(props.expirationDate).format(apiDateFormat),
        received_date: dayjs(props.receivedDate).format(apiDateFormat),
        total_qty: parseInt(props.totalQty),
        num_of_serving: parseFloat(props.numOfServing).toFixed(2),
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
    ? { success: "Inbound successful" }
    : { error: "Something went wrong" };
};
