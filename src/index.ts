import { Bitbucket } from "bitbucket";
import * as dotenv from "dotenv";
import auth from "./bitbucket/authentication";
import * as BitbucketIntegration from "./bitbucket/bitbucket";
import * as JIRA from "./jira/jira";
import * as Slack from "./slack/slack";

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

      const prs = await BitbucketIntegration.getPRsOpen(bitbucket);

      if (process.env.SLACK_TOKEN && prs.length > 0) {
        await Slack.sendPRMessage(prs);
      }

      await BitbucketIntegration.getPRsWithConflicts(bitbucket);

      await JIRA.addCommentToInactiveIssues();
    }
  },
  process.env.MESSAGES_INTERVAL_IN_MS
    ? parseInt(process.env.MESSAGES_INTERVAL_IN_MS)
    : 10000 // 10 seconds
);
