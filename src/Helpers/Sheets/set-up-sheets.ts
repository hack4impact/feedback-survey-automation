// Externals
import { google, sheets_v4 } from "googleapis";

// Internals
import initializeAuth from "../../Config/google-auth";

const setUpSheets = async (): Promise<sheets_v4.Sheets> => {
  const auth = await initializeAuth();

  const sheets = google.sheets({
    version: "v4",
    auth,
  });

  return sheets;
};

export default setUpSheets;
