"use server";
import { getServerSession } from "next-auth";
import { getErrorMessage, Role } from "../../lib/utils";
import { options } from "../../app/api/auth/[...nextauth]/options";

type Response = {
  id: string;
  role: Role;
  email: string | null | undefined;
};

export const getUserSessionServerAction = async () => {
  var session = null;
  try {
    session = await getServerSession(options);
    if (session === null) {
      return { error: "Unauthorized" };
    }
  } catch (error) {
    return { error: getErrorMessage(error) };
  }

  const result: Response = {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
  };

  return result;
};
