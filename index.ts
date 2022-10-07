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
        repo_slug: "replai-platform",
        workspace: "replai",
        state: "OPEN",
      })
      .then((response) => {
        console.log(response.data.values);
      })
      .catch((error) => {
        console.log(error);
      });
  })
  .catch((error) => {
    console.log(error);
  });
