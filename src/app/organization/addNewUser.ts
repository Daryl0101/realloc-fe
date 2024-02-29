"use server";
import { getServerSession } from "next-auth";
import GlobalConfig from "../../../app.config";
import { options } from "../api/auth/[...nextauth]/options";
import { getErrorMessage } from "../../lib/utils";

const userCreateAPI = `${GlobalConfig.baseAPIPath}/authentication/register`;

export const addNewUser = async (formData: FormData) => {
  const formJson = Object.fromEntries((formData as any).entries());
  const {
    username = "",
    password = "",
    email = "",
    firstName: first_name = "",
    lastName: last_name = "",
    phoneNumber: phone_number = "",
    role: is_ngo_manager = "",
    gender = "",
  } = formJson;
  is_ngo_manager === "true" ? true : false;
  const session = await getServerSession(options);
  var res = null;
  try {
    res = await fetch(userCreateAPI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${session?.user.token}`,
      },
      body: JSON.stringify({
        username,
        password,
        email,
        first_name,
        last_name,
        phone_number,
        is_ngo_manager,
        gender,
      }),
    });
  } catch (error) {
    return { error: getErrorMessage(error) };
  }

  if (res.ok) {
    return { success: "User successfully created" };
  } else return { error: "Failed to create user" };
};
