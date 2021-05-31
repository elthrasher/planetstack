import { Distribution, OriginAccessIdentity, ViewerProtocolPolicy } from '@aws-cdk/aws-cloudfront';
import { S3Origin } from '@aws-cdk/aws-cloudfront-origins';
import { BlockPublicAccess, Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { CfnOutput, Construct, DockerImage, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';
import { execSync, ExecSyncOptions } from 'child_process';
import { copySync } from 'fs-extra';
import { join } from 'path';

export class PlanetStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const websiteBucket = new Bucket(this, 'WebsiteBucket', {
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const originAccessIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity');
    websiteBucket.grantRead(originAccessIdentity);

    const distribution = new Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new S3Origin(websiteBucket, { originAccessIdentity }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [{ httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' }],
    });

    const execOptions: ExecSyncOptions = { stdio: ['ignore', process.stderr, 'inherit'] };

    const bundle = Source.asset(join(__dirname, '../app'), {
      bundling: {
        command: ['sh', '-c', 'echo "Docker build not supported. Please install esbuild."'],
        image: DockerImage.fromRegistry('alpine'),
        local: {
          tryBundle(outputDir: string) {
            try {
              execSync('esbuild --version', execOptions);
            } catch {
              return false;
            }
            execSync('npm run build', execOptions);
            copySync(join(__dirname, '../web'), outputDir, { ...execOptions, recursive: true });
            return true;
          },
        },
      },
    });

    new BucketDeployment(this, 'DeployWebsite', {
      destinationBucket: websiteBucket,
      distribution,
      memoryLimit: 1024,
      sources: [bundle],
    });

    new CfnOutput(this, 'webUrl', { value: distribution.distributionDomainName });
  }
}
