"use server";
import { getServerSession } from "next-auth";
import { options } from "../../app/api/auth/[...nextauth]/options";
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

type ProductResponseCamel = {
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

export const retrieveProductAPICall = async (
  id: string | null
): Promise<{ error: string | string[] } | ProductResponseCamel> => {
  const session = await getServerSession(options);
  var res = null;
  try {
    if (!id) return { error: "Product ID not found" };
    res = await fetch(
      `${process.env.BASE_API_PATH}/master-data/products/${id}`,
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
        productNo: result.model.product_no,
        productName: result.model.name,
        description: result.model.description,
        categories: result.model.food_categories,
        halalStatus: result.model.is_halal
          ? HalalStatus.Halal
          : HalalStatus["Non Halal"],
        servingSize: result.model.serving_size,
        calorie: result.model.calorie,
        carbohydrate: result.model.carbohydrate,
        protein: result.model.protein,
        fat: result.model.fat,
        sugar: result.model.sugar,
        fiber: result.model.fiber,
        saturatedFat: result.model.saturated_fat,
        cholesterol: result.model.cholesterol,
        sodium: result.model.sodium,
        modifiedAt: result.model.modified_at,
        modifiedBy: result.model.modified_by,
        createdAt: result.model.created_at,
        createdBy: result.model.created_by,
      }
    : { error: "Something went wrong" };
};
