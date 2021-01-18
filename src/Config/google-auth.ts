// Externals
import { google } from "googleapis";
import keyfile from "./serviceaccount.json";

const initializeAuth = async (): Promise<
  InstanceType<typeof google["auth"]["JWT"]>
> => {
  const auth = new google.auth.JWT(
    keyfile.client_email,
    undefined,
    keyfile.private_key,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
  await auth.authorize();
  return auth;
};

export default initializeAuth;
