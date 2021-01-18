// Externals
import { google } from "googleapis";
import keyfile from "./serviceaccount.json";
import { JWT } from "googleapis-common";

let auth: JWT | null = null;

const getAuth = async (): Promise<
  InstanceType<typeof google["auth"]["JWT"]>
> => {
  if (!auth) {
    auth = new google.auth.JWT(
      keyfile.client_email,
      undefined,
      keyfile.private_key,
      [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/script.projects",
      ]
    );
    await auth.authorize();
  }
  return auth;
};

export default getAuth;
