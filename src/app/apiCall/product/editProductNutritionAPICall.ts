"use server";
import { getServerSession } from "next-auth";
import GlobalConfig from "../../../../app.config";
import { options } from "../../api/auth/[...nextauth]/options";
import { ApiResponse, HalalStatus, getErrorMessage } from "../../../lib/utils";

type Props = {
  id: string | null;
  servingSize: string;
  calorie: string;
  carbohydrate: string;
  protein: string;
  fat: string;
  sugar: string;
  fiber: string;
  saturatedFat: string;
  cholesterol: string;
  sodium: string;
};

export const editProductNutritionAPICall = async (props: Props) => {
  const session = await getServerSession(options);
  var res = null;
  try {
    if (!props.id) return { error: "Product ID is not found" };
    res = await fetch(
      `${GlobalConfig.baseAPIPath}/master-data/products/${props.id}/update-nutrition`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${session?.user.token}`,
        },
        body: JSON.stringify({
          serving_size: parseFloat(props.servingSize),
          calorie: parseFloat(props.calorie),
          carbohydrate: parseFloat(props.carbohydrate),
          protein: parseFloat(props.protein),
          fat: parseFloat(props.fat),
          fiber: parseFloat(props.fiber),
          sugar: parseFloat(props.sugar),
          saturated_fat: parseFloat(props.saturatedFat),
          cholesterol: parseFloat(props.cholesterol),
          sodium: parseFloat(props.sodium),
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
    ? { success: "Product updated successfully" }
    : { error: "Something went wrong" };
};
