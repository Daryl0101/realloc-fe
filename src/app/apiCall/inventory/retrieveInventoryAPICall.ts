"use server";
import { getServerSession } from "next-auth";
import GlobalConfig from "../../../../app.config";
import { options } from "../../api/auth/[...nextauth]/options";
import { ApiResponse, HalalStatus, getErrorMessage } from "../../../lib/utils";

type FoodCategory = {
  id: number;
  name: string;
  description: string;
};

type ProductResponse = {
  id: number;
  product_no: string;
  name: string;
  description: string;
  serving_size: string;
  calorie: string;
  carbohydrate: string;
  protein: string;
  fat: string;
  fiber: string;
  sugar: string;
  saturated_fat: string;
  cholesterol: string;
  sodium: string;
  is_halal: boolean;
  food_categories: FoodCategory[];
  modified_at: string;
  modified_by: string;
  created_at: string;
  created_by: string;
};

type StorageResponse = {
  id: number;
  storage_no: string;
  description: string;
  is_halal: boolean;
  modified_at: string;
  modified_by: string;
  created_at: string;
  created_by: string;
};

type InventoryResponse = {
  inventory_no: string;
  expiration_date: string;
  received_date: string;
  total_qty: number;
  available_qty: number;
  num_of_serving: string;
  product: ProductResponse;
  storage: StorageResponse;
  modified_at: string;
  modified_by: string;
  created_at: string;
  created_by: string;
};

type ProductResponseCamel = {
  id: number;
  productNo: string;
  productName: string;
  description: string;
  servingSize: string;
  calorie: string;
  carbohydrate: string;
  protein: string;
  fat: string;
  fiber: string;
  sugar: string;
  saturatedFat: string;
  cholesterol: string;
  sodium: string;
  halalStatus: HalalStatus;
  categories: FoodCategory[];
  modifiedAt: string;
  modifiedBy: string;
  createdAt: string;
  createdBy: string;
};

type StorageResponseCamel = {
  id: number;
  storageNo: string;
  description: string;
  halalStatus: HalalStatus;
  modifiedAt: string;
  modifiedBy: string;
  createdAt: string;
  createdBy: string;
};

type InventoryResponseCamel = {
  inventoryNo: string;
  expirationDate: string;
  receivedDate: string;
  totalQty: number;
  availableQty: number;
  numOfServing: number;
  product: ProductResponseCamel;
  storage: StorageResponseCamel;
  modifiedAt: string;
  modifiedBy: string;
  createdAt: string;
  createdBy: string;
};

export const retrieveInventoryAPICall = async (
  id: string | null
): Promise<{ error: string | string[] } | InventoryResponseCamel> => {
  const session = await getServerSession(options);
  var res = null;
  try {
    if (!id) return { error: "Inventory ID not found" };
    res = await fetch(
      `${GlobalConfig.baseAPIPath}/inventory-management/inventories/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${session?.user.token}`,
        },
      }
    );
  } catch (error) {
    return { error: getErrorMessage(error) };
  }

  const result: ApiResponse<InventoryResponse> = await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model
    ? {
        inventoryNo: result.model.inventory_no,
        expirationDate: result.model.expiration_date,
        receivedDate: result.model.received_date,
        totalQty: result.model.total_qty,
        availableQty: result.model.available_qty,
        numOfServing: parseFloat(result.model.num_of_serving),
        product: {
          id: result.model.product.id,
          productNo: result.model.product.product_no,
          productName: result.model.product.name,
          description: result.model.product.description,
          servingSize: result.model.product.serving_size,
          calorie: result.model.product.calorie,
          carbohydrate: result.model.product.carbohydrate,
          protein: result.model.product.protein,
          fat: result.model.product.fat,
          fiber: result.model.product.fiber,
          sugar: result.model.product.sugar,
          saturatedFat: result.model.product.saturated_fat,
          cholesterol: result.model.product.cholesterol,
          sodium: result.model.product.sodium,
          halalStatus: result.model.product.is_halal
            ? HalalStatus.Halal
            : HalalStatus["Non Halal"],
          categories: result.model.product.food_categories,
          modifiedAt: result.model.product.modified_at,
          modifiedBy: result.model.product.modified_by,
          createdAt: result.model.product.created_at,
          createdBy: result.model.product.created_by,
        },
        storage: {
          id: result.model.storage.id,
          storageNo: result.model.storage.storage_no,
          description: result.model.storage.description,
          halalStatus: result.model.storage.is_halal
            ? HalalStatus.Halal
            : HalalStatus["Non Halal"],
          modifiedAt: result.model.storage.modified_at,
          modifiedBy: result.model.storage.modified_by,
          createdAt: result.model.storage.created_at,
          createdBy: result.model.storage.created_by,
        },
        modifiedAt: result.model.modified_at,
        modifiedBy: result.model.modified_by,
        createdAt: result.model.created_at,
        createdBy: result.model.created_by,
      }
    : { error: "Something went wrong" };
};
