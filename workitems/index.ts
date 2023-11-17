/* This code sample provides a starter kit to implement server side logic for your Teams App in TypeScript,
 * refer to https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference for complete Azure Functions
 * developer guide.
 */

import { Context, HttpRequest } from '@azure/functions';
import {
  ApiKeyLocation,
  ApiKeyProvider,
  AxiosInstance,
  createApiClient,
} from '@microsoft/teamsfx';

import config from '../config';
import example from '../prompt/example.json';
import sysPrompt from '../prompt/system';

// Define a Response interface.
interface Response {
  status: number;
  body: {
    results: any[];
  };
}

// Define an Example interface with a content string and a role string.
interface Example {
  content: string;
  role: string;
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

  // Extract the param from the request.
  const resp = await callOAI(
    constructRquest(req.query.prompt, sysPrompt, example)
  );
  const parsedResp = JSON.parse(resp.message.content);

  const workItemType = parsedResp.workItemType;
  const assignedTo = parsedResp.assignedTo;
  const priority = parsedResp.priority;
  const title = parsedResp.title;

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

  // Construct query statement based on query parameters.
  let conditions = '';
  if (assignedTo) {
    conditions +=
      assignedTo.toLowerCase() === 'me'
        ? ` AND [System.AssignedTo] = @Me`
        : ` AND [System.AssignedTo] = '${assignedTo}'`;
  }

  if (priority) {
    conditions += ` AND [Microsoft.VSTS.Common.Priority] = ${priority}`;
  }

  if (title) {
    conditions += ` AND [System.Title] Contains '${title}'`;
  }

  // Set the body of the request.
  const body = JSON.stringify({
    query: `Select [System.Id], [System.Title], [System.State] From workitems Where [System.WorkItemType] = '${workItemType}' AND [State] <> 'Closed' AND [State] <> 'Removed' ${conditions} order by [Microsoft.VSTS.Common.Priority] asc, [System.CreatedDate] desc`,
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

/**
 * Constructs a request object for the OpenAI API.
 * @param userInput The user's input.
 * @param prompt The prompt to use.
 * @param example The example to use.
 * @returns
 */
function constructRquest(userInput: string, prompt: string, example: any[]) {
  return {
    messages: [
      {
        content: prompt,
        role: 'system',
      },
      ...getExample(example),
      {
        content: userInput,
        role: 'user',
      },
    ],
  };
}

/**
 * Converts the example data into a list of examples for the OpenAI API.
 * @param exampleData The example data to convert.
 * @returns A list of examples for the OpenAI API.
 */
function getExample(exampleData: any[]): Example[] {
  const examples: Example[] = [];
  exampleData.forEach((item) => {
    examples.push({
      content: item.request,
      role: 'user',
    });
    examples.push({
      content: JSON.stringify(item.response),
      role: 'assistant',
    });
  });
  return examples;
}

/**
 * Calls the OpenAI API with the provided request object.
 * @param request - The request object to be sent to the OpenAI API.
 * @returns The response object from the OpenAI API.
 */
async function callOAI(request: any) {
  const authProvider = new ApiKeyProvider(
    'api-key',
    config.oaiApiKey,
    ApiKeyLocation.Header
  );
  const apiClient: AxiosInstance = createApiClient(
    config.oaiEndpoint,
    authProvider
  );
  const resp = await apiClient.post(config.chatCompletionUrl, request);
  if (resp.status !== 200) {
    throw new Error(`Failed to call OpenAI API. Status code: ${resp.status}`);
  }

  const response = resp.data.choices[0];
  return response;
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
      id: data.id.toString() ?? '',
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
