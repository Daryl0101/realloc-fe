"use server";
import { getServerSession } from "next-auth";
import GlobalConfig from "../../../app.config";
import { options } from "../api/auth/[...nextauth]/options";
import {
  ApiResponse,
  Gender,
  HalalStatus,
  getErrorMessage,
} from "../../lib/utils";

const familyCreateAPI = `${GlobalConfig.baseAPIPath}/master-data/families/create`;

type PersonInfo = {
  firstName: string;
  lastName: string;
  gender: string;
  birthdate: string;
  height: string;
  weight: string;
  activityLevel: string;
};

type FoodCategory = {
  id: number;
  name: string;
  description: string;
};

type Props = {
  familyName: string;
  halalStatus: HalalStatus;
  householdIncome: string;
  phoneNumber: string;
  address: string;
  calorieDiscount: string;
  foodRestrictions: FoodCategory[];
  members: PersonInfo[];
};

export const addNewFamilyAPICall = async (props: Props) => {
  const session = await getServerSession(options);
  var res = null;
  if (props.members.map((x) => x.gender).includes("")) {
    return { error: "Gender is required" };
  }
  try {
    res = await fetch(familyCreateAPI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${session?.user.token}`,
      },
      body: JSON.stringify({
        name: props.familyName,
        is_halal: props.halalStatus === HalalStatus.Halal,
        household_income: parseFloat(props.householdIncome),
        phone_number: props.phoneNumber.replace(/\s/g, ""),
        address: props.address,
        calorie_discount: parseFloat(props.calorieDiscount),
        food_restrictions: props.foodRestrictions.map(
          (category) => category.id
        ),
        members: props.members.map((member) => {
          console.log(member.activityLevel);
          return {
            ...member,
            id: 0,
            first_name: member.firstName,
            last_name: member.lastName,
            activity_level: parseInt(member.activityLevel),
            gender: member.gender.toUpperCase(),
          };
        }),
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
    ? { success: "Family created successfully" }
    : { error: "Something went wrong" };
};
