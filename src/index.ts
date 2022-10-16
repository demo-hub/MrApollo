import { Bitbucket } from "bitbucket";
import * as dotenv from "dotenv";
import auth from "./bitbucket/authentication";
import * as BitbucketIntegration from "./bitbucket/bitbucket";
import * as JIRA from "./jira/jira";
import * as Slack from "./slack/slack";

// load env variables
dotenv.config();

const SUNDAY = 0;
const SATURDAY = 6;

setInterval(
  async () => {
    const currentDate = new Date();

    if (
      currentDate.getHours() >=
        parseInt(process.env.WORKING_HOURS_START ?? "8") &&
      currentDate.getHours() <=
        parseInt(process.env.WORKING_HOURS_END ?? "18") &&
      currentDate.getDay() !== SUNDAY &&
      currentDate.getDay() !== SATURDAY
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

      // TODO: notify on PRs with merge conflicts
      await BitbucketIntegration.getPRsWithConflicts(bitbucket);

      await JIRA.addCommentToInactiveIssues();
    }
  },
  process.env.MESSAGES_INTERVAL_IN_MS
    ? parseInt(process.env.MESSAGES_INTERVAL_IN_MS)
    : 10000 // 10 seconds
);
