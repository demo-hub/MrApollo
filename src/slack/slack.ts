import { WebClient } from "@slack/web-api";

const sendPRMessage = async (prs: any[]) => {
  // Read Slack token from the environment variables
  const slackToken = process.env.SLACK_TOKEN;

  // Initialize Slack client
  const slack = new WebClient(slackToken);

  const formattedPRLinks = prs.map((pr) => pr.links?.html?.href).join("\n");

  await slack.chat.postMessage({
    channel: process.env.SLACK_CHANNEL_ID ?? "",
    text: `@${process.env.SLACK_USER_TO_TAG} some PRs are waiting for your review: ${formattedPRLinks}`,
    link_names: true,
  });
};

export default sendPRMessage;
