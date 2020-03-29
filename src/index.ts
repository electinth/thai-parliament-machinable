import fs from 'fs';
import * as lis from './lis';
import * as network from './network';

const exportMotionToJson = async (): Promise<void> => {
  const option: lis.Option = {
    sapaNo: 25,
    system: lis.System.Motion,
    fromPage: 0,
    toPage: 1
  };
  
  const motions = await lis.motion.getAllMotions(option, fetcher);
  return fs.writeFileSync('./results/motion.json', JSON.stringify(motions, null, 4));
};

const fetcher = network.getFetcher();
exportMotionToJson();