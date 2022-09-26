import { SNSEvent } from 'aws-lambda';
import { WAFRegionalClient, AssociateWebACLCommand } from '@aws-sdk/client-waf-regional'

export async function main(event: SNSEvent): Promise<void> {
  const message = event.Records[0].Sns.Message;
  console.log('Adding ALB resource: ', message);

  var params = {
    ResourceArn: message,
    WebACLId: process.env.WEB_ACL_ID
  };

  const client = new WAFRegionalClient({});
  const command = new AssociateWebACLCommand(params);
  client.send(command)
}
