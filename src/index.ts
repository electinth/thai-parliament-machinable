import * as lis from './parliament-lis';
import * as https from 'https';
import fs from 'fs';

const exportToJson = async (): Promise<void> => {
  const option: lis.Option = {
    sapaNo: 25,
    system: lis.System.Motion,
    fromPage: 1,
    toPage: 1,
    limiter: {
      maxConcurrent: 1,
      minTime: 0,
    }
  };
  
  const agent = new https.Agent({
    minVersion: 'TLSv1',
  });
  
  const motions = await lis.getAll(option, agent);
  return fs.writeFileSync('./results/motion.json', JSON.stringify(motions, null, 4));
};

exportToJson();
