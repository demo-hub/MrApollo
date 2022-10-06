import { Bitbucket } from 'bitbucket';
import * as dotenv from "dotenv";
import auth from './authentication/authentication';
dotenv.config();

auth.then(token => {
    console.log(token);
    const clientOptions = {
        auth: {
          token: token.data ?? '',
        },
      };
        
      const bitbucket = new Bitbucket(clientOptions);
      
      bitbucket.pullrequests.list({
          repo_slug: 'replai-platform',
          workspace: 'replai',
          state: 'OPEN',
      })
      .then(response => {
          console.log(response);
      })
      .catch(error => {
          console.log(error);
      });
})
.catch(error => {
    console.log(error);
});