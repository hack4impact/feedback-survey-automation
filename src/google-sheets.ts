import { google } from "googleapis";
import { join } from "path";
import initializeAuth from "./Config/google-auth";

const googleSheets = async () => {
  const auth = await initializeAuth();
  // const auth = new google.auth.GoogleAuth({
  //   scopes: [
  //     "https://www.googleapis.com/auth/spreadsheets",
  //     "https://www.googleapis.com/auth/script",
  //   ],
  //   keyFilename: join(__dirname, "Config", "serviceaccount.json"),
  // });

  // console.log(auth);
  // // const token = (await auth.get) as string;

  const sheets = google.sheets({
    version: "v4",
    auth,
  });

  console.log(
    await sheets.spreadsheets.values.get({
      spreadsheetId: "11O5zz8ff1GpWQrGdnmy973Wc7NoU3G_-RHoaFULa4Gk",
      range: "A1:Z200",
    })
  );
};

export default googleSheets;
