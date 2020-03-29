import * as cheerio from 'cheerio';
import { Motion, parseStatus } from './models/motion';

export class ListPage {
  $: CheerioStatic

  constructor(body: string) {
    this.$ = cheerio.load(body);
  }

  getResultCount = (): number => {
    return parseInt(
      this.$('td[align=right] h3')
        .text()
        .match(/\d+/g)[0]
    );
  }

  getPartialMotions = (): Motion[] => {
    const motionTrNodes = this.$('table.table-condensed > tbody > tr').toArray();
    const motions = [];
    for (const trNode of motionTrNodes) {
      const motion = new Motion();
      const tdNodes = this.$('td', trNode).toArray();
      
      for (let i = 0; i < tdNodes.length; i++) {
        if (i === 3) {
          motion.registrationNo = this.$('div', tdNodes[i]).text();
        } else if (i === 6) {
          const data = this.$(tdNodes[i]).text().trim();
          motion.status = parseStatus(data);
        } else if (i === 7) {
          motion.detailPageUrl = this.$('div > a', tdNodes[i]).attr('href');
        }
      }
      motions.push(motion);
    }
    return motions;
  }
}