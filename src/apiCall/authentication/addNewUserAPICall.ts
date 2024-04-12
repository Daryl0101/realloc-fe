"use server";
import { getServerSession } from "next-auth";
import { options } from "../../app/api/auth/[...nextauth]/options";
import { getErrorMessage } from "../../lib/utils";

const userCreateAPI = `${process.env.BASE_API_PATH}/authentication/register`;

export const addNewUserAPICall = async (formData: FormData) => {
  const formJson = Object.fromEntries(formData.entries());
  // const {
  //   username,
  //   password = "",
  //   email = "",
  //   firstName: first_name = "",
  //   lastName: last_name = "",
  //   phoneNumber: phone_number = "",
  //   role: is_ngo_manager = "",
  //   gender = "",
  // }: {
  //   username: string;
  //   password: string;
  //   email: string;
  //   firstName: string;
  //   lastName: string;
  //   phoneNumber: string;
  //   role: string;
  //   gender: string;
  // } = formJson.toString() as any;
  // is_ngo_manager === "true" ? true : false;
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
        username: formJson.username.toString(),
        password: formJson.password.toString(),
        email: formJson.email.toString(),
        first_name: formJson.firstName.toString(),
        last_name: formJson.lastName.toString(),
        phone_number: formJson.phoneNumber.toString().replace(/\s/g, ""),
        is_ngo_manager: formJson.role === "true" ? true : false,
        gender: formJson.gender.toString(),
      }),
    });
  } catch (error) {
    return { error: getErrorMessage(error) };
  }

  if (res.ok) {
    return { success: "User successfully created" };
  } else return { error: "Failed to create user" };
};
