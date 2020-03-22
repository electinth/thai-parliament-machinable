import search from './parliament-lis';
import * as https from 'https';

const option = new search.Option();
option.sapaNo = 25;
option.system = search.System.Motion;

const agent = new https.Agent({
  minVersion: 'TLSv1',
});

search.getJson(option, agent);