import { APIClient } from "bitbucket";

const MS_IN_AN_HOUR = 3600000;

export const notifyPRsOpen = async (bitbucket: APIClient) => {
  const pullRequests = await bitbucket.pullrequests.list({
    repo_slug: process.env.REPO_SLUG ?? "",
    workspace: process.env.WORKSPACE ?? "",
    state: "OPEN",
    pagelen: 20,
  });

  const accountsToFilter = process.env.ACCOUNT_IDS?.split(",");

  const prs = pullRequests.data.values?.filter((pr) =>
    accountsToFilter
      ? accountsToFilter.includes(pr.author?.account_id as string)
      : true
  );

  if (prs) {
    let prsToNotify: any[] = [];

    for (const pr of prs) {
      // calculate numbers of hours since the last update
      const dateDiffInMs =
        new Date().getTime() - new Date(pr.updated_on ?? "").getTime();

      const dateDiffInHours = dateDiffInMs / MS_IN_AN_HOUR;

      if (
        process.env.TIME_TO_NOTIFY_PR_IN_H &&
        pr.id &&
        dateDiffInHours >= parseInt(process.env.TIME_TO_NOTIFY_PR_IN_H)
      ) {
        const pullRequest = await bitbucket.pullrequests.get({
          pull_request_id: pr.id,
          repo_slug: process.env.REPO_SLUG ?? "",
          workspace: process.env.WORKSPACE ?? "",
        });

        const approvals = pullRequest.data.participants?.filter(
          (p) => p.role === "REVIEWER" && p.approved
        );

        if (
          pullRequest.data.participants &&
          pullRequest.data.participants?.length > 0 &&
          approvals?.length === 0
        ) {
          prsToNotify.push(pr);
        }
      }
    }

    return prsToNotify;
  }

  return [];
};

export const notifyPRsWithConflicts = async (bitbucket: APIClient) => {
  const pullRequests = await bitbucket.pullrequests.list({
    repo_slug: process.env.REPO_SLUG ?? "",
    workspace: process.env.WORKSPACE ?? "",
    state: "OPEN",
    pagelen: 20,
  });

  const accountsToFilter = process.env.ACCOUNT_IDS?.split(",");

  const prs = pullRequests.data.values?.filter((pr) =>
    accountsToFilter
      ? accountsToFilter.includes(pr.author?.account_id as string)
      : true
  );

  if (prs) {
    let prsToNotify: any[] = [];

    for (const pr of prs.slice(8, 9)) {
      if (pr.id) {
        const pullRequest = await bitbucket.pullrequests.getDiffStat({
          pull_request_id: pr.id,
          repo_slug: process.env.REPO_SLUG ?? "",
          workspace: process.env.WORKSPACE ?? "",
        });
      }
    }

    return prsToNotify;
  }

  return [];
};
