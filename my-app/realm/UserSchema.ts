export class UserSchema {
  static schema = {
    name: "User",
    properties: {
      id: "string",
      username: "string",
      email: "string",
      token: "string",
    },
    primaryKey: "id",
  };
}
