import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const auth = () =>
  axios.post<{ access_token: string }>(
    "https://bitbucket.org/site/oauth2/access_token",
    { grant_type: "client_credentials" },
    {
      headers: {
        Authorization: `Basic ${process.env.BITBUCKET_BASIC_AUTH_CREDENTIAL}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    }
  );

export default auth;
