// Externals
import { join } from "path";
import { google } from "googleapis";
import keyfile from "./serviceaccount.json";

const initializeAuth = async () => {
  const auth = new google.auth.JWT(
    keyfile.client_email,
    undefined,
    keyfile.private_key,
    [
      "https://www.googleapis.com/auth/spreadsheets"
    ]
  );
  await auth.authorize();
  return auth;
};

export default initializeAuth;
