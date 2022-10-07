import { APIClient } from "bitbucket";

const MS_IN_AN_HOUR = 3600000;

const notifyPRsOpen = (bitbucket: APIClient) => {
  bitbucket.pullrequests
    .list({
      repo_slug: process.env.REPO_SLUG ?? "",
      workspace: process.env.WORKSPACE ?? "",
      state: "OPEN",
    })
    .then((response) => {
      const accountsToFilter = process.env.ACCOUNT_IDS?.split(",");

      const prs = response.data.values?.filter((pr) =>
        accountsToFilter
          ? accountsToFilter.includes(pr.author?.account_id as string)
          : true
      );

      if (prs) {
        for (let pr of prs) {
          // calculate numbers of hours since the last update
          const dateDiffInMs =
            new Date(pr.updated_on ?? "").getTime() - new Date().getTime();

          const dateDiffInHours = dateDiffInMs / MS_IN_AN_HOUR;

          if (pr.id && dateDiffInHours >= 24) {
            bitbucket.pullrequests
              .get({
                pull_request_id: pr.id,
                repo_slug: process.env.REPO_SLUG ?? "",
                workspace: process.env.WORKSPACE ?? "",
              })
              .then((response) => {
                const approvals = response.data.participants?.filter(
                  (p) => p.role === "REVIEWER" && p.approved
                );

                if (approvals?.length === 0) {
                  // TODO: Send message to Slack
                }
              })
              .catch((error) => console.log(error));
          }
        }
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

export default notifyPRsOpen;
