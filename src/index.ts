import { Bitbucket } from "bitbucket";
import * as dotenv from "dotenv";
import auth from "./bitbucket/authentication";
import { getPRsOpen, getPRsWithConflicts } from "./bitbucket/bitbucket";
import addCommentToInactiveIssues from "./jira/jira";
import sendPRMessage from "./slack/slack";

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

      const prs = await getPRsOpen(bitbucket);

      if (process.env.SLACK_TOKEN && prs.length > 0) {
        await sendPRMessage(prs);
      }

      await getPRsWithConflicts(bitbucket);

      await addCommentToInactiveIssues();
    }
  },
  process.env.MESSAGES_INTERVAL_IN_MS
    ? parseInt(process.env.MESSAGES_INTERVAL_IN_MS)
    : 10000 // 10 seconds
);
