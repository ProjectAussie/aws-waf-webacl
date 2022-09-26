import { App,
  Stack,
  StackProps,
  Duration,
  CfnOutput
} from 'aws-cdk-lib';
import { CfnWebACL, CfnWebACLProps } from 'aws-cdk-lib/aws-wafv2';
import { wrapManagedRuleSet } from '@aws-solutions-constructs/core';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Topic, } from 'aws-cdk-lib/aws-sns';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';

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

    // Create sns topic
    const topic = new Topic(this, 'albWafStatus', {
      topicName: `albWafStatus-${environment}`,
      displayName: `albWafStatus-${environment}`,
    });

    // Create lambda function
    const webAclUpdater = new NodejsFunction(this, 'webAclUpdater', {
      functionName: `albWafStatus-${environment}`,
      memorySize: 256,
      timeout: Duration.seconds(5),
      runtime: Runtime.NODEJS_14_X,
      handler: 'main',
      entry: path.join(__dirname, `./src/index.ts`),
      environment: {
        WEB_ACL_ARN: webACL.attrArn
      }
    });

    webAclUpdater.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSNSReadOnlyAccess'));
    webAclUpdater.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AWSWAFFullAccess'));

    // Subscribe Lambda to SNS topic
    topic.addSubscription(new LambdaSubscription(webAclUpdater));

    // const cfnRemediationConfiguration = new config.CfnRemediationConfiguration(this, 'alb-waf-enabled', {
    //   configRuleName: 'alb-waf-enabled',
    //   targetId: topic.topicArn,
    //   targetType: 'SNS',
    
    //   // the properties below are optional
    //   automatic: false,
    // });

    new CfnOutput(this, 'snsTopicArn', {
      value: topic.topicArn,
      description: 'The arn of the albWafStatus SNS topic',
    });
  };
};

const app = new App();

new awsWafWebAcl(app, 'awsWafWebAcl', { stackName: `${serviceName}-${environment}`, env: { account: accountId, region: region }});

app.synth();