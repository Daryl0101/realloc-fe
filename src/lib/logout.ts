import { getSession, signOut } from "next-auth/react";
import GlobalConfig from "../../app.config";

const logoutAPI = `${GlobalConfig.baseAPIPath}/authentication/logout`;

const logout = async () => {
  var session = await getSession();
  var res = await fetch(logoutAPI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${session?.user.token}`,
    },
  });

  if (res.ok) {
    signOut();
  }
};

export default logout;
