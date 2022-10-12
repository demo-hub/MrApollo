import { WebClient } from "@slack/web-api";
import { Bitbucket } from "bitbucket";
import * as dotenv from "dotenv";
import auth from "./authentication";
import notifyPRsOpen from "./notifications";

// load env variables
dotenv.config();

auth
  .then(async (token) => {
    const clientOptions = {
      auth: {
        token: token.data.access_token ?? "",
      },
    };

    const bitbucket = new Bitbucket(clientOptions);

    const prs = await notifyPRsOpen(bitbucket);

    if (process.env.SLACK_TOKEN && prs.length > 0) {
      // Read Slack token from the environment variables
      const slackToken = process.env.SLACK_TOKEN;

      // Initialize Slack client
      const slack = new WebClient(slackToken);

      const formattedPRLinks = prs.map((pr) => pr.links?.html?.href).join("\n");

      await slack.chat.postMessage({
        channel: process.env.SLACK_CHANNEL_ID ?? "",
        text: `@${process.env.SLACK_USER_TO_TAG} there are some PRs waiting for your review: ${formattedPRLinks}`,
        link_names: true,
      });
    }
  })
  .catch((error) => {
    throw new Error(error);
  });
