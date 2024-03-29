"use server";
import { getServerSession } from "next-auth";
import GlobalConfig from "../../../../app.config";
import { options } from "../../api/auth/[...nextauth]/options";
import { ApiResponse, HalalStatus, getErrorMessage } from "../../../lib/utils";

const allocationCreateAPI = `${GlobalConfig.baseAPIPath}/allocation/create`;

type InventoryItem = {
  inventoryId: number;
  inventoryNo: string;
  quantity: number;
  maxQuantity: number;
  maxQuantityPerFamily: number;
};

type Props = {
  inventories: InventoryItem[];
  familyIds: number[];
  allocationDays: number;
  diversification: number;
};

export const addNewAllocationAPICall = async (props: Props) => {
  const session = await getServerSession(options);
  var res = null;
  try {
    res = await fetch(allocationCreateAPI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${session?.user.token}`,
      },
      body: JSON.stringify({
        inventories: props.inventories.map((inventory) => ({
          inventory_id: inventory.inventoryId,
          quantity: inventory.quantity,
          max_quantity_per_family: inventory.maxQuantityPerFamily,
        })),
        family_ids: props.familyIds,
        allocation_days: props.allocationDays,
        diversification: props.diversification,
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
    ? { success: "Allocation created successfully" }
    : { error: "Something went wrong" };
};
