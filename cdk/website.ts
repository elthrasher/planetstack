import { WebSocketApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { DockerImage, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Distribution, OriginAccessIdentity, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources';
import { execSync, ExecSyncOptions } from 'child_process';
import { copySync } from 'fs-extra';
import { join } from 'path';

import { stageName } from './apigw';

export const getWebsite = (scope: Stack, socketApi: WebSocketApi): string => {
  // NOT an S3 website as all access is via cloudfront.
  const websiteBucket = new Bucket(scope, 'WebsiteBucket', {
    autoDeleteObjects: true,
    blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    removalPolicy: RemovalPolicy.DESTROY,
  });

  // Gives permission for cloudfront to serve files from the bucket.
  const originAccessIdentity = new OriginAccessIdentity(scope, 'OriginAccessIdentity');
  websiteBucket.grantRead(originAccessIdentity);

  // The cloudfront distribution.
  const distribution = new Distribution(scope, 'Distribution', {
    defaultBehavior: {
      origin: new S3Origin(websiteBucket, { originAccessIdentity }),
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    },
    defaultRootObject: 'index.html',
    errorResponses: [{ httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' }],
  });

  const execOptions: ExecSyncOptions = { stdio: ['ignore', process.stderr, 'inherit'] };

  // Code bundling with esbuild. This avoids any separate build step for the React app.
  const bundle = Source.asset(join(__dirname, '../app'), {
    bundling: {
      command: ['sh', '-c', 'echo "Docker build not supported. Please install esbuild."'],
      image: DockerImage.fromRegistry('alpine'),
      local: {
        tryBundle(outputDir: string) {
          try {
            execSync('esbuild --version', execOptions);
          } catch {
            /* istanbul ignore next */
            return false;
          }
          execSync('npm run build', execOptions);
          copySync(join(__dirname, '../web'), outputDir, {
            ...execOptions,
            recursive: true,
          });
          return true;
        },
      },
    },
  });

  // Deploys web assets and performs cache invalidation.
  // `prune: false` is needed here or the deployment will remove the `config.json` file.
  new BucketDeployment(scope, 'DeployWebsite', {
    destinationBucket: websiteBucket,
    distribution,
    memoryLimit: 1024,
    prune: false,
    sources: [bundle],
  });

  // Creates the `config.json` file necessary for the UI app to find the API.
  // This resource only updates if its inputs change.
  new AwsCustomResource(scope, 'ConfigResource', {
    onUpdate: {
      action: 'putObject',
      parameters: {
        Body: Stack.of(scope).toJsonString({
          socketUrl: socketApi.apiEndpoint,
          stageName,
        }),
        Bucket: websiteBucket.bucketName,
        CacheControl: 'max-age=0, no-cache, no-store, must-revalidate',
        ContentType: 'application/json',
        Key: 'config.json',
      },
      physicalResourceId: PhysicalResourceId.of('config'),
      service: 'S3',
    },
    policy: AwsCustomResourcePolicy.fromStatements([
      new PolicyStatement({ actions: ['s3:PutObject'], resources: [websiteBucket.arnForObjects('config.json')] }),
    ]),
  });

  return distribution.distributionDomainName;
};
