import { Construct } from 'constructs';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { CfnWebACLProps, WafwebaclToAlb } from '@aws-solutions-constructs/aws-wafwebacl-alb';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws_elasticloadbalancingv2';
import { wrapManagedRuleSet } from '@aws-solutions-constructs/core';

const serviceName = process.env.SERVICE_NAME || 'wafwebacl';
const environment = process.env.ENVIRONMENT || 'dev';
const accountId =  process.env.ACCOUNT_ID || '763216446258';
const region = process.env.REGION || 'us-east-1';

class DemoFargate extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);
    
    const loadBalancerArns = ["",""]
    loadBalancerArns.forEach( (loadBalancerArn) => {
      const loadBalancer = ApplicationLoadBalancer.fromLookup(this, 'ALB', {
        loadBalancerArn: loadBalancerArn,
      });
    });


    const webaclProps: CfnWebACLProps = {
      defaultAction: {
        allow: {}
      },
      scope: 'REGIONAL',
      visibilityConfig: {
        cloudWatchMetricsEnabled: false,
        metricName: 'webACL',
        sampledRequestsEnabled: true
      },
      rules: [
        wrapManagedRuleSet('AWSManagedRulesCommonRuleSet', 'AWS', 0),
        wrapManagedRuleSet('AWSManagedRulesKnownBadInputsRuleSet', 'AWS', 1),
        wrapManagedRuleSet('AWSManagedRulesAmazonIpReputationList', 'AWS', 2),
        wrapManagedRuleSet('AWSManagedRulesSQLiRuleSet', 'AWS', 3)
      ]
    };

    new WafwebaclToAlb(this, 'waf', {
      existingLoadBalancerObj: fargateService.loadBalancers[0],
      webaclProps: webaclProps
    });

new WafwebaclToAlb(this, 'test-wafwebacl-alb', {
    existingLoadBalancerObj: existingLoadBalancer
});

const app = new cdk.App();

new wafWebAcl(app, 'Demo', { stackName: `${serviceName}-${environment}`, env: { account: accountId, region: region }});

app.synth();