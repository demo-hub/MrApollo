import { Bitbucket } from "bitbucket";
import * as dotenv from "dotenv";
import auth from "./authentication/authentication";
dotenv.config();

auth
  .then((token) => {
    const clientOptions = {
      auth: {
        token: token.data.access_token ?? "",
      },
    };

    const bitbucket = new Bitbucket(clientOptions);

    bitbucket.pullrequests
      .list({
        repo_slug: process.env.REPO_SLUG ?? "",
        workspace: process.env.WORKSPACE ?? "",
        state: "OPEN",
      })
      .then((response) => {
        const accountsToFilter = process.env.ACCOUNT_IDS?.split(",");

        const prs = response.data.values?.filter((pr) =>
          accountsToFilter?.includes(pr.author?.account_id as string)
        );

        if (prs) {
          for (let pr of prs) {
            if (pr.id) {
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
  })
  .catch((error) => {
    console.log(error);
  });
