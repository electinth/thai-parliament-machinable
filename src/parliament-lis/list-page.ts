import * as cheerio from 'cheerio';

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

  getLinks = (): string[] => {
    const trNodes = this.$('td > div > a').toArray();
    return trNodes.map(node => node.attribs['href']);
  }
}