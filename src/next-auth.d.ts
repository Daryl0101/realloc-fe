// Reference https://reacthustle.com/blog/extend-user-session-nextauth-typescript
import { DefaultSession, DefaultUser } from "next-auth";
import { Role } from "./lib/utils";

interface IModel {
  id: string;
  name?: string | null;
  email?: string | null;
  token: string;
  role: Role;
}

interface IUser extends DefaultUser {
  model: IModel;
}
declare module "next-auth" {
  interface User extends IUser {}

  interface Session extends DefaultSession {
    user: IModel;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends IModel {}
}
