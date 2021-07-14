import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //Hosting Bucket - where we are going to host our website
    const bucket = new s3.Bucket(this, 'ks-static-react-app-hosting', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    //Deployment - how we are going to deploy the files to the hosting bucket
    new s3Deployment.BucketDeployment(this, 'ks-static-react-app-deployment', {
      //what is the hosting bucket
      destinationBucket: bucket,
      //from the build, take the code and package it into zip and upload to deployment bucket, creates lambda, takes the lambda and deploys it to the hosting bucket
      sources: [s3Deployment.Source.asset('../build')],
    });

    //Add permission boundary (prevents us doing insecure things)
    const boundary = iam.ManagedPolicy.fromManagedPolicyArn(this, 'Boundary', `arn:aws:iam::${process.env.AWS_ACCOUNT}:policy/ScopePermissions`);

    iam.PermissionsBoundary.of(this).apply(boundary);

    //cloud formation output

    new cdk.CfnOutput(this, 'Bucket URL', {
      value: bucket.bucketDomainName,
    })
  }
}
