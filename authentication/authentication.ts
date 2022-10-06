import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const auth = axios.post("https://bitbucket.org/site/oauth2/access_token", {
  body: "grant_type=urn:bitbucket:oauth2:jwt",
  headers: {
    Authorization: `JWT ${process.env.BITBUCKET_API_TOKEN}`,
    "Content-Type": "application/x-www-form-urlencoded"
  },
  method: "POST"
});

export default auth;