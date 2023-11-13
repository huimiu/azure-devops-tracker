const config = {
  orgName: process.env.DEVOPS_ORGANIZATION_NAME,
  projectName: process.env.DEVOPS_PROJECT_NAME,
  accessToken: process.env.SECRET_DEVOPS_ACCESS_TOKEN,
  oaiEndpoint: process.env.OAI_ENDPOINT,
  oaiApiKey: process.env.OAI_API_KEY,
  chatCompletionUrl: process.env.OAI_CHAT_COMPLETION_URL,
};

export default config;
