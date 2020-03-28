import * as lis from './parliament-lis';
import * as https from 'https';

const option: lis.Option = {
  sapaNo: 25,
  system: lis.System.Motion,
  toPage: 1
};

const agent = new https.Agent({
  minVersion: 'TLSv1',
});

lis.getAll(option, agent);