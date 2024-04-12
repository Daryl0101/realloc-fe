"use server";
import { getServerSession } from "next-auth";
import { getErrorMessage, Role } from "../../lib/utils";
import { options } from "../../app/api/auth/[...nextauth]/options";

export const getUserRoleAPICall = async () => {
  var session = null;
  try {
    session = await getServerSession(options);
    if (session === null) {
      return { error: "Unauthorized" };
    }
  } catch (error) {
    return { error: getErrorMessage(error) };
  }

  const result: Role = session.user.role;

  return result;
};
