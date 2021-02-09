// Externals
import { google } from "googleapis";

// Internals
import keyfile from "../serviceaccount.json";

const drive = async () => {
  const auth = new google.auth.JWT(
    keyfile.client_email,
    undefined,
    keyfile.private_key,
    [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/forms",
    ]
  );

  await auth.authorize();

  const drive = google.drive({
    version: "v2",
    auth,
  });

  const response = await drive.children.list({
    folderId: "1qfx3jwE7QE_TPgSuOHUn_s31FmcoUGEd",
  });

  const { data: folderData } = response;

  for (const item of folderData.items ?? []) {
    const itemResponse = await drive.files.get({
      fileId: item.id ?? undefined,
    });
    console.log(itemResponse);
  }
};

drive();
