# Overview of the Intelligent App Integrated with AzDO

## Get started with the app

> **Prerequisites**
>
> To run this app in your local dev machine, you will need:
>
> - [Node.js](https://nodejs.org/), supported versions: 16, 18
> - A [Microsoft 365 account for development](https://docs.microsoft.com/microsoftteams/platform/toolkit/accounts)
> - [Teams Toolkit Visual Studio Code Extension](https://aka.ms/teams-toolkit) version 5.0.0 and higher or [Teams Toolkit CLI](https://aka.ms/teamsfx-cli)

1. First, select the Teams Toolkit icon on the left in the VS Code toolbar.
2. In the Account section, sign in with your [Microsoft 365 account](https://docs.microsoft.com/microsoftteams/platform/toolkit/accounts) if you haven't already.
3. Provide the Azure DevOps access token in the `env.local.user` file. You can [create a new token](https://docs.microsoft.com/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=preview-page) with `Work Items (Read)` scope.
4. Select `Debug in Teams (Edge)` or `Debug in Teams (Chrome)` from the launch configuration dropdown.
5. When Teams launches in the browser, you can navigate to a chat message and [trigger your search commands from compose message area](https://learn.microsoft.com/microsoftteams/platform/messaging-extensions/what-are-messaging-extensions?tabs=dotnet#search-commands).

## What's included in the app

| Folder       | Contents                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| `.vscode`    | VSCode files for debugging                                                                                  |
| `appPackage` | Templates for the Teams application manifest, the API specification and response template for API responses |
| `env`        | Environment files                                                                                           |
| `infra`      | Templates for provisioning Azure resources                                                                  |
| `workitems`  | The source code for the Azure work items API                                                                |

The following files can be customized and demonstrate an example implementation to get you started.

| File                                        | Contents                                                                      |
| ------------------------------------------- | ----------------------------------------------------------------------------- |
| `workitems/function.json`                   | A configuration file that defines the function’s trigger and other settings.  |
| `workitems/index.ts`                        | The main file of a function in Azure Functions.                               |
| `appPackage/apiSpecificationFiles/azdo.yml` | A file that describes the structure and behavior of the Azure work items API. |
| `appPackage/responseTemplates/azdo.json`    | A generated Adaptive Card that used to render API response.                   |

The following are Teams Toolkit specific project files. You can [visit a complete guide on Github](https://github.com/OfficeDev/TeamsFx/wiki/Teams-Toolkit-Visual-Studio-Code-v5-Guide#overview) to understand how Teams Toolkit works.

| File                 | Contents                                                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `teamsapp.yml`       | This is the main Teams Toolkit project file. The project file defines two primary things: Properties and configuration Stage definitions. |
| `teamsapp.local.yml` | This overrides `teamsapp.yml` with actions that enable local execution and debugging.                                                     |

## Addition information and references

- [Extend Teams platform with APIs](https://aka.ms/teamsfx-api-plugin)
