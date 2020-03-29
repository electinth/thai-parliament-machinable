import * as https from 'https';
import Bottleneck from 'bottleneck';
import fetch from 'node-fetch';
import * as nodeFetch from 'node-fetch';

export type Fetcher = (url: URL | string) => Promise<nodeFetch.Response>;

export const getFetcher = (): Fetcher => {
  const limiter = getLimitter({
    maxConcurrent: 1,
    minTime: 0,
  });

  const agent = new https.Agent({
    minVersion: 'TLSv1',
  });

  return (url: URL | string): Promise<nodeFetch.Response> => {
    console.log(`---- Queued ${url}`);
    return limiter.schedule(() => fetch(url, { agent })
      .then(r => {
        console.log(`---- Fetched ${url}`);
        return r;
      }));
  };
};

const getLimitter = (option: Bottleneck.ConstructorOptions): Bottleneck => {
  console.log(`
-------------------------------------
Limiter concurrent = ${option.maxConcurrent || 'unlimited'}
Delay time between request = ${option.minTime || 0} ms
-------------------------------------`);
  return new Bottleneck(option.limiter);
};