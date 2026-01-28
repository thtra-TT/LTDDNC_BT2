import Realm from "realm";
import { UserSchema } from "./UserSchema";

export const realm = await Realm.open({
  path: "auth.realm",
  schema: [UserSchema],
});
