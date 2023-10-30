/* This code sample provides a starter kit to implement server side logic for your Teams App in TypeScript,
 * refer to https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference for complete Azure Functions
 * developer guide.
 */

import { Context, HttpRequest } from "@azure/functions";

import config from "../config";

// Define a Response interface.
interface Response {
  status: number;
  body: {
    results: any[];
  };
}

/**
 * This function handles the HTTP request and returns work items information.
 *
 * @param {Context} context - The Azure Functions context object.
 * @param {HttpRequest} req - The HTTP request.
 * @returns {Promise<Response>} - A promise that resolves with the HTTP response containing work items information.
 */
export default async function run(
  context: Context,
  req: HttpRequest
): Promise<Response> {
  // Initialize response.
  let res: Response = {
    status: 200,
    body: {
      results: [],
    },
  };

  // Get the query parameters.
  const orgName = config.orgName;
  const projectName = config.projectName;

  // Define the URL to retrieve work items.
  const url = `https://dev.azure.com/${orgName}/${projectName}/_apis/wit/wiql?api-version=7.1-preview.2`;

  // Encode the access token for authentication.
  const auth = Buffer.from(`:${config.accessToken}`).toString('base64');

  // Set the headers for the request.
  const headers = {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/json',
  };

  // Set the body of the request.
  const body = JSON.stringify({
    query: `Select [System.Id], [System.Title], [System.State] From workitems Where [System.WorkItemType] = 'Task' AND [State] <> 'Closed' AND [State] <> 'Removed' AND [System.AssignedTo] = @Me order by [Microsoft.VSTS.Common.Priority] asc, [System.CreatedDate] desc`,
  });

  // Send the request to retrieve work items.
  const response = await fetch(url, { body, headers, method: 'POST' });

  if (!response.ok) {
    // The request failed, return the error.
    return {
      status: response.status,
      body: {
        results: [],
      },
    };
  }

  // Parse the response as JSON.
  const data = await response.json();

  // Get the work items.
  for (const item of data.workItems) {
    const itemUrl = item.url;
    const itemDetail = await getWorkItemById(itemUrl);
    res.body.results.push(itemDetail);
  }

  return res;
}

async function getWorkItemById(url: string) {
  try {
    // Encode the access token for authentication.
    const auth = Buffer.from(`:${config.accessToken}`).toString('base64');

    // Set the headers for the request.
    const headers = {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    };

    // Send the request to retrieve work items.
    const response = await fetch(url, { headers });

    if (!response.ok) {
      return {};
    }

    // Parse the response as JSON.
    const data = await response.json();

    return {
      id: data.id,
      title: data.fields['System.Title'] ?? '',
      assignedTo: data.fields['System.AssignedTo']?.displayName ?? '',
      url: data._links.html.href ?? '',
      avatar: data.fields['System.AssignedTo']?.imageUrl ?? '',
    };
  } catch (error) {
    console.error(error);
    return {};
  }
}
