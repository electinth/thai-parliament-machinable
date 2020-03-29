import fs from 'fs';
import * as lis from './lis';
import * as network from './network';

const exportMotionToJson = async (): Promise<void> => {
  const options: lis.Options = {
    sapaNo: 25,
    system: lis.System.Motion
  };
  
  const motions = await lis.motion.getAllMotions(options, fetcher);
  return fs.writeFileSync('./results/motion.json', JSON.stringify(motions, null, 4));
};

const limitterOptions = {
  maxConcurrent: 1,
  minTime: 0,
};
const fetcher = network.getFetcher(limitterOptions);
exportMotionToJson();