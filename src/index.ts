import { WebClient } from "@slack/web-api";
import { Bitbucket } from "bitbucket";
import * as dotenv from "dotenv";
import { Version3Client } from "jira.js";
import auth from "./authentication";
import { notifyPRsOpen, notifyPRsWithConflicts } from "./notifications";

// load env variables
dotenv.config();

const MS_IN_A_DAY = 86400000;

setInterval(
  async () => {
    const currentDate = new Date();

    const client = new Version3Client({
      host: process.env.JIRA_HOST ?? "",
      authentication: {
        basic: {
          email: process.env.JIRA_EMAIL ?? "",
          apiToken: process.env.JIRA_API_TOKEN ?? "",
        },
      },
    });

    const jiraIssues = await client.issueSearch.searchForIssuesUsingJql({
      jql: `project = ${process.env.JIRA_TARGET_PROJECT} AND issuetype in (Story, Task) AND status = "Backlog"`,
    });

    for (const issue of jiraIssues.issues ?? []) {
      const issueDetails = await client.issues.getIssue({
        issueIdOrKey: issue.key,
      });

      const issueUpdatedDate = new Date(issueDetails.fields.updated);

      const dateDiffInMs = currentDate.getTime() - issueUpdatedDate.getTime();

      const dateDiffInDays = dateDiffInMs / MS_IN_A_DAY;

      if (
        dateDiffInDays >
        parseInt(process.env.TIME_TO_NOTIFY_ISSUE_IN_DAYS ?? "30")
      ) {
        await client.issueComments.addComment({
          issueIdOrKey: issue.key,
          body: {
            type: "text",
            text: `This issue has been in the backlog for more than ${process.env.TIME_TO_NOTIFY_ISSUE_IN_DAYS} days without updates. Please review if it still makes sense to have it.`,
            version: 1,
          },
        });
      }
    }

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
    : 100 // 10 seconds
);
