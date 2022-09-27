import { CfnWebACL } from 'aws-cdk-lib/aws-wafv2';

interface WafRule {
  name: string;
  rule: CfnWebACL.RuleProperty;
}

export const awsManagedRules: WafRule[] = [
  // AWS IP Reputation list includes known malicious actors/bots and is regularly updated
  {
    name: 'AWS-AWSManagedRulesAmazonIpReputationList',
    rule: {
      name: 'AWS-AWSManagedRulesAmazonIpReputationList',
      priority: 1,
      statement: {
        managedRuleGroupStatement: {
          vendorName: 'AWS',
          name: 'AWSManagedRulesAmazonIpReputationList',
        },
      },
      overrideAction: {
        none: {},
      },
      visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: 'AWSManagedRulesAmazonIpReputationList',
      },
    },
  },
  // Common Rule Set aligns with major portions of OWASP Core Rule Set
  {
    name: 'AWS-AWSManagedRulesCommonRuleSet',
    rule:  {
      name: 'AWS-AWSManagedRulesCommonRuleSet',
      priority: 2,
      statement: {
        managedRuleGroupStatement: {
        vendorName: 'AWS',
        name: 'AWSManagedRulesCommonRuleSet',
        // Excluding body size rules for SNS notifications
        excludedRules: [
          { name: 'GenericRFI_BODY' },
          { name: 'SizeRestrictions_BODY' },
        ],
        },
      },
      overrideAction: {
        none: {},
      },
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'AWS-AWSManagedRulesCommonRuleSet',
      },
    },
  },
  // Blocks invalid/exploit request patterns.
  {
    name: 'AWSManagedRulesKnownBadInputsRuleSet',
    rule: {
      name: 'AWSManagedRulesKnownBadInputsRuleSet',
      priority: 3,
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'AWSManagedRulesKnownBadInputsRuleSet',
      },
      overrideAction: {
        none: {},
      },
      statement: {
        managedRuleGroupStatement: {
          vendorName: 'AWS',
          name: 'AWSManagedRulesKnownBadInputsRuleSet',
          excludedRules: [],
        },
      },
    },
  },
  // Blocks common SQL Injection
  {
    name: 'AWSManagedRulesSQLiRuleSet',
    rule: {
      name: 'AWSManagedRulesSQLiRuleSet',
      priority: 4,
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'AWSManagedRulesSQLiRuleSet',
      },
      overrideAction: {
        none: {},
      },
      statement: {
        managedRuleGroupStatement: {
          vendorName: 'AWS',
          name: 'AWSManagedRulesSQLiRuleSet',
          excludedRules: [],
        },
      },
    },
  },
  // Blocks attacks targeting LFI for linux systems
  {
    name: 'AWSManagedRuleLinux',
    rule: {
      name: 'AWSManagedRuleLinux',
      priority: 5,
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'AWSManagedRuleLinux',
      },
      overrideAction: {
        none: {},
      },
      statement: {
        managedRuleGroupStatement: {
          vendorName: 'AWS',
          name: 'AWSManagedRulesLinuxRuleSet',
          excludedRules: [],
        },
      },
    },
  },
];