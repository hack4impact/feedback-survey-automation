import { google } from "googleapis";
import getAuth from "./Config/google-auth";
import fetch from "node-fetch";

export default async function (projectName:string, surveyPeriod:string, questions:Array<string>) {

  const scriptURL = process.env.APPS_SCRIPT_URL as string;
  let data = await fetch(scriptURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      password: process.env.APPS_SCRIPT_PASSWORD,
      projectName,
      surveyPeriod,
      questions
    })
  });

  let dataText = await data.text();
  let formurls : { editUrl: string, publishedUrl: string} = JSON.parse(dataText);
  return formurls;
}
