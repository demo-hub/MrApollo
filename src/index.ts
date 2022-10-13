import { WebClient } from "@slack/web-api";
import { Bitbucket } from "bitbucket";
import * as dotenv from "dotenv";
import auth from "./authentication";
import { notifyPRsOpen, notifyPRsWithConflicts } from "./notifications";

// load env variables
dotenv.config();

setInterval(
  async () => {
    const currentDate = new Date();

    if (
      currentDate.getHours() >=
        parseInt(process.env.WORKING_HOURS_START ?? "8") &&
      currentDate.getHours() <= parseInt(process.env.WORKING_HOURS_END ?? "18")
    ) {
      const token = await auth();

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

        const formattedPRLinks = prs
          .map((pr) => pr.links?.html?.href)
          .join("\n");

        await slack.chat.postMessage({
          channel: process.env.SLACK_CHANNEL_ID ?? "",
          text: `@${process.env.SLACK_USER_TO_TAG} some PRs are waiting for your review: ${formattedPRLinks}`,
          link_names: true,
        });
      }

      await notifyPRsWithConflicts(bitbucket);
    }
  },
  process.env.MESSAGES_INTERVAL_IN_MS
    ? parseInt(process.env.MESSAGES_INTERVAL_IN_MS)
    : 10000 // 10 seconds
);
