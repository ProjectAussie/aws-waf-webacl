import { App,
  Stack,
  StackProps,
  Duration,
  CfnOutput,
  Tags
} from 'aws-cdk-lib';
import { CfnWebACL, CfnWebACLProps } from 'aws-cdk-lib/aws-wafv2';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import { awsManagedRules } from './awswafwebaclrules';

const serviceName = 'awswafwebacl';
const environment = String(process.env.ENVIRONMENT);
const accountId =  String(process.env.ACCOUNT_ID);
const region = String(process.env.REGION);

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
      rules: awsManagedRules.map(wafRule => wafRule.rule),
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

    webAclUpdater.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSNSReadOnlyAccess'));
    webAclUpdater.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AWSWAFFullAccess'));

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

Tags.of(app).add('product', 'aws-waf-webacl');
Tags.of(app).add('owner', 'Platform Operations');
Tags.of(app).add('environment', environment);

new awsWafWebAcl(app, 'awsWafWebAcl', { stackName: `${serviceName}-${environment}`, env: { account: accountId, region: region }});

app.synth();