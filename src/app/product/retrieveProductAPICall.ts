"use server";
import { getServerSession } from "next-auth";
import GlobalConfig from "../../../app.config";
import { options } from "../api/auth/[...nextauth]/options";
import { ApiResponse, HalalStatus, getErrorMessage } from "../../lib/utils";

type FoodCategory = {
  id: number;
  name: string;
  description: string;
};

type ProductResponse = {
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

export const retrieveProductAPICall = async (id: string | null) => {
  const session = await getServerSession(options);
  var res = null;
  try {
    if (!id) return { error: "Product ID not found" };
    res = await fetch(
      `${GlobalConfig.baseAPIPath}/master-data/products/${id}`,
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

  const result: ApiResponse<ProductResponse> = await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model
    ? {
        ...result.model,
        productNo: result.model.product_no,
        productName: result.model.name,
        servingSize: result.model.serving_size,
        saturatedFat: result.model.saturated_fat,
        categories: result.model.food_categories,
        halalStatus: result.model.is_halal
          ? HalalStatus.Halal
          : HalalStatus["Non Halal"],
        modifiedAt: result.model.modified_at,
        modifiedBy: result.model.modified_by,
        createdAt: result.model.created_at,
        createdBy: result.model.created_by,
      }
    : { error: "Something went wrong" };
};
