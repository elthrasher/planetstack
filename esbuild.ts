import { build, BuildOptions, BuildResult, serve } from 'esbuild';
import sassPlugin from 'esbuild-plugin-sass';
import { createServer, request, Server, ServerResponse } from 'http';
import { stageName } from './cdk/apigw';

const clients: ServerResponse[] = [];

const mode = process.argv[2];
const env = mode === 'build' ? 'production' : 'development';

const socketUrl = 'wss://jdnif5uxok.execute-api.us-east-1.amazonaws.com';

// Thanks https://github.com/evanw/esbuild/issues/802#issuecomment-819578182
const buildOptions: BuildOptions = {
  bundle: true,
  define: { 'process.env.NODE_ENV': `"${env}"` }, // must be double-quoted
  entryPoints: ['app/index.tsx'],
  loader: { '.js': 'tsx' },
  logLevel: 'warning',
  minify: true,
  outdir: 'web/js',
  plugins: [sassPlugin()],
  sourcemap: true,
};

export const run = async (mode: string): Promise<BuildResult | Server> => {
  if (mode === 'build') {
    return build(buildOptions);
  }
  build({
    ...buildOptions,
    banner: { js: ' (() => new EventSource("/esbuild").onmessage = () => location.reload())();' },
    watch: {
      onRebuild(error) {
        clients.forEach((res) => res.write('data: update\n\n'));
        clients.length = 0;
        console.log(error ? error : '...');
      },
    },
  });
  return serve({ servedir: 'web' }, {}).then(() => {
    return createServer((req, res) => {
      const { url, method, headers } = req;
      if (req.url === '/esbuild') {
        return clients.push(
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          }),
        );
      }
      if (req.url === '/config.json') {
        res.writeHead(200, { 'Cache-Control': 'no-cache', 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ socketUrl, stageName }));
        return res.end();
      }
      const path = url?.includes('.') ? url : '/index.html';
      req.pipe(
        request({ hostname: '0.0.0.0', port: 8000, path, method, headers }, (prxRes) => {
          res.writeHead(prxRes.statusCode || 500, prxRes.headers);
          prxRes.pipe(res, { end: true });
        }),
        { end: true },
      );
      return;
    }).listen(3000);
  });
};

run(mode);
