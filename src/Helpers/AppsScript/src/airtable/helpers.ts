const AIRTABLE_AUTH = `Bearer ${process.env.AIRTABLE_API_KEY}`;

const BASE_API_URL = "https://api.airtable.com/v0/app0TDYnyirqeRk1T";

export const airtableRequest = (
  table: string,
  headers?: Record<string, unknown>,
  params?: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions
): ReturnType<typeof UrlFetchApp.fetch> => {
  return UrlFetchApp.fetch(`${BASE_API_URL}/${table}`, {
    headers: {
      Authorization: AIRTABLE_AUTH,
      ...headers,
    },
    ...params,
  });
};
