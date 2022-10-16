import { Version3Client } from "jira.js";

const MS_IN_A_DAY = 86400000;

const addCommentToInactiveIssues = async () => {
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
    jql: `project = ${process.env.JIRA_TARGET_PROJECT} AND issuetype in (Story, Task) AND status = "Backlog" ORDER BY created ASC`,
  });

  for (const issue of jiraIssues.issues ?? []) {
    const issueDetails = await client.issues.getIssue({
      issueIdOrKey: issue.key,
      expand: ["changelog"],
    });

    // Issue updated date excluded "Fix Version/s" updates
    const realUpdatedDate = issueDetails.changelog?.histories
      ?.map((history) => ({
        items: history.items,
        created: history.created,
      }))
      .filter((i) =>
        i.items?.some(
          (item) => item.field !== "Fix Version" && item.field !== "Version"
        )
      )?.[0]?.created;

    const issueUpdatedDate = new Date(realUpdatedDate ?? issue.fields.updated);

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
};

export default addCommentToInactiveIssues;
