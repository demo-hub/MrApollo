# Mr. Apollo

## Integrations
### Slack

- Notifies Slack channel/user/group if a PR is without activity for at least X hours

## Development

### Bitbucket

For authentication, you will need to [create a consumer on Bitbucket](https://support.atlassian.com/bitbucket-cloud/docs/use-oauth-on-bitbucket-cloud/#OAuthonBitbucketCloud-Createaconsumer) first.

### Slack

You will need to [create a new app](https://api.slack.com/start/overview#creating) with the scopes *channels:read* and *chat:write*

It's recommended to [create a new, empty public channel](https://slack.com/help/articles/201402297-Create-a-channel) just for testing while developing

### Environment variables

**BITBUCKET_BASIC_AUTH_CREDENTIAL**: Bitbucket credential for basic auth in base64

**ACCOUNT_IDS**: Account IDs of PRs authors

**REPO_SLUG**: Repository name

**WORKSPACE**: Workspace name

**TIME_TO_NOTIFY_PR_IN_H**: Time in hours a PR needs to be without activity to trigger notifications

**SLACK_TOKEN**: Slack App Token

**SLACK_CHANNEL_ID**: Slack channel ID

**SLACK_USER_TO_TAG**: Slack handle of the user/group to tag in messages

**MESSAGES_INTERVAL_IN_MS**: Interval in milliseconds between messages

**WORKING_HOURS_START**: Working start hour time in 24h format

**WORKING_HOURS_END**: Working end hour time in 24h format