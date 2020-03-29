import * as https from 'https';
import Bottleneck from 'bottleneck';
import fetch from 'node-fetch';
import * as nodeFetch from 'node-fetch';

export type Fetcher = (url: URL | string) => Promise<nodeFetch.Response>;

export const getFetcher = (options: Bottleneck.ConstructorOptions): Fetcher => {
  const limiter = getLimitter(options);

  const agent = new https.Agent({
    minVersion: 'TLSv1',
  });

  return (url: URL | string): Promise<nodeFetch.Response> => {
    console.log(`---- Queued ${url} at ${(new Date()).toISOString()}`);
    return limiter.schedule(() => fetch(url, { agent })
      .then(r => {
        console.log(`---- Fetched ${url} at ${(new Date()).toISOString()}`);
        return r;
      }));
  };
};

const getLimitter = (options: Bottleneck.ConstructorOptions): Bottleneck => {
  console.log(`
-------------------------------------
Limiter concurrent = ${options.maxConcurrent || 'unlimited'}
Delay time between request = ${options.minTime || 0} ms
-------------------------------------`);
  return new Bottleneck(options);
};