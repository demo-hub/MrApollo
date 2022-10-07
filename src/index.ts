import { Bitbucket } from "bitbucket";
import * as dotenv from "dotenv";
import auth from "./authentication";
import notifyPRsOpen from "./notifications";

// load env variables
dotenv.config();

auth
  .then((token) => {
    const clientOptions = {
      auth: {
        token: token.data.access_token ?? "",
      },
    };

    const bitbucket = new Bitbucket(clientOptions);

    notifyPRsOpen(bitbucket);
  })
  .catch((error) => {
    console.log(error);
  });
