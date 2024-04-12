"use server";
import { getServerSession } from "next-auth";
import { options } from "../../app/api/auth/[...nextauth]/options";
import { ApiResponse, HalalStatus, getErrorMessage } from "../../lib/utils";

type PersonInfo = {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  birthdate: string;
  height: string;
  weight: string;
  activity_level: string;
};

type FoodCategory = {
  id: number;
  name: string;
  description: string;
};

type FamilyResponse = {
  family_no: string;
  name: string;
  is_halal: boolean;
  household_income: string;
  phone_number: string;
  last_received_date: string | null;
  address: string;
  total_member: string;
  calorie_discount: string;
  food_restrictions: FoodCategory[];
  members: PersonInfo[];
  modified_at: string;
  modified_by: string;
  created_at: string;
  created_by: string;
};

type PersonInfoCamel = {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthdate: string;
  height: string;
  weight: string;
  activityLevel: string;
};

type FamilyResponseCamel = {
  familyNo: string;
  familyName: string;
  halalStatus: HalalStatus;
  householdIncome: string;
  phoneNumber: string;
  lastReceivedDate: string;
  address: string;
  totalMember: string;
  calorieDiscount: string;
  foodRestrictions: FoodCategory[];
  members: PersonInfoCamel[];
  modifiedAt: string;
  modifiedBy: string;
  createdAt: string;
  createdBy: string;
};

export const retrieveFamilyAPICall = async (
  id: string | null
): Promise<{ error: string | string[] } | FamilyResponseCamel> => {
  const session = await getServerSession(options);
  var res = null;
  try {
    if (!id) return { error: "Family ID not found" };
    res = await fetch(
      `${process.env.BASE_API_PATH}/master-data/families/${id}`,
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

  const result: ApiResponse<FamilyResponse> = await res.json();

  if (!res.ok && result.errors && result.model === null) {
    return {
      error: result.errors,
    };
  }

  return result.model
    ? {
        familyNo: result.model.family_no,
        familyName: result.model.name,
        halalStatus: result.model.is_halal
          ? HalalStatus.Halal
          : HalalStatus["Non Halal"],
        householdIncome: result.model.household_income,
        phoneNumber: result.model.phone_number,
        lastReceivedDate:
          result.model.last_received_date === null
            ? "NA"
            : result.model.last_received_date,
        address: result.model.address,
        totalMember: result.model.total_member,
        calorieDiscount: result.model.calorie_discount,
        foodRestrictions: result.model.food_restrictions,
        members: result.model.members.map((member) => {
          return {
            id: member.id,
            firstName: member.first_name,
            lastName: member.last_name,
            gender:
              member.gender.charAt(0) + member.gender.slice(1).toLowerCase(),
            birthdate: member.birthdate,
            height: member.height,
            weight: member.weight,
            activityLevel: member.activity_level,
          };
        }),
        modifiedAt: result.model.modified_at,
        modifiedBy: result.model.modified_by,
        createdAt: result.model.created_at,
        createdBy: result.model.created_by,
      }
    : { error: "Something went wrong" };
};
