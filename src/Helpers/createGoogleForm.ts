import fetch from "node-fetch";

export default async function (
  projectName: string,
  surveyPeriod: string,
  questions: Array<string>
): Promise<{ editUrl: string; publishedUrl: string }> {
  const scriptURL = process.env.APPS_SCRIPT_URL as string;
  const data = await fetch(scriptURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password: process.env.APPS_SCRIPT_PASSWORD,
      projectName,
      surveyPeriod,
      questions,
    }),
  });

  const dataText = await data.text();
  const formurls = JSON.parse(dataText);
  return formurls;
}
