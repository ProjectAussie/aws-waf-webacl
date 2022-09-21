import { App, Stack, StackProps } from 'aws-cdk-lib';
import { CfnWebACL, CfnWebACLProps } from 'aws-cdk-lib/aws-wafv2';
import { wrapManagedRuleSet } from '@aws-solutions-constructs/core';

const serviceName = 'awswafwebacl';
const environment = process.env.ENVIRONMENT || 'dev';
const accountId =  process.env.ACCOUNT_ID || '763216446258';
const region = process.env.REGION || 'us-east-1';

class awsWafWebAcl extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const webaclProps: CfnWebACLProps = {
      defaultAction: {
        allow: {}
      },
      scope: 'REGIONAL',
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `${serviceName}-${environment}`,
        sampledRequestsEnabled: true
      },
      rules: [
        wrapManagedRuleSet('AWSManagedRulesCommonRuleSet', 'AWS', 0),
        wrapManagedRuleSet('AWSManagedRulesKnownBadInputsRuleSet', 'AWS', 1),
        wrapManagedRuleSet('AWSManagedRulesAmazonIpReputationList', 'AWS', 2),
        wrapManagedRuleSet('AWSManagedRulesSQLiRuleSet', 'AWS', 3)
      ]
    };

    const webACL = new CfnWebACL(this, `${serviceName}-${environment}`, webaclProps)
  };
};

const app = new App();

new awsWafWebAcl(app, 'awsWafWebAcl', { stackName: `${serviceName}-${environment}`, env: { account: accountId, region: region }});

app.synth();