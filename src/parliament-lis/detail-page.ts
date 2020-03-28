import * as cheerio from 'cheerio';
import { Motion } from './models/motion';
import { Person } from './models/person';
import { AdHocCommittee } from './models/ad-hoc-committee';

export class DetailPage {
  $: CheerioStatic
  motion: Motion

  constructor(body: string, partialMotion: Motion) {
    this.$ = cheerio.load(body);
    this.motion = partialMotion;
  }

  getMotion = (): Motion => {
    this.motion.name = this.getName();
    this.motion.registrationNo = this.getRegistrationNo();
    this.motion.proposedDate = this.getProposedDate();
    this.motion.contentAndPurpose = this.getContentAndPurpose();
    this.motion.purposers = this.getPurposers();
    this.motion.seconders = this.getSeconders();
    this.motion.adHocCommittee = this.getAdHocCommittee();

    return this.motion;
  }

  getName = (): string => 
    this.$('h3[class=heading]')
      .text()
      .replace('ชื่อญัตติ : ', '')
      .trim();

  getRegistrationNo = (): string =>
    this.$('td:contains("เลขทะเบียนรับ :")')
      .first()
      .next('td')
      .text()
      .trim();

  getProposedDate = (): string =>
    this.$('strong:contains("วันที่รับ :")')
      .parent()
      .text()
      .replace('วันที่รับ :', '')
      .trim();
  
  getContentAndPurpose = (): string =>
    this.$('td:contains("สาระและวัตถุประสงค์ : ")')
      .next('td')
      .text()
      .trim();
  
  getPurposers = (): Person[] => {
    const purposerTable = this.$('td:contains("ผู้เสนอญัตติ :")')
      .parent()
      .find('td > table > tbody > tr');

    return this.getFromPeopleTable(purposerTable);
  }

  getSeconders = (): Person[] => {
    const seconderTable = this.$('td:contains("ผู้รับรอง :")')
      .parent()
      .find('td > table > tbody > tr');

    return this.getFromPeopleTable(seconderTable);
  }

  getAdHocCommittee = (): AdHocCommittee => {
    const committee = new AdHocCommittee();
    committee.name = this.$('#COMMITTEENAME1 > td:nth-child(2)')
      .text()
      .trim();

    if (committee.name === '') {
      return null;
    }
    
    const personRows = this.$('td:contains("รายชื่อคณะกรรมาธิการ : ")')
      .parent()
      .find('td > table > tbody > tr');

    const persons: Person[] = [];
    personRows.each((_, ele) => {
      const person = new Person();
      const tdNodes = ele.childNodes.filter(n => n.name === 'td');

      tdNodes.forEach((node, i) => {
        if (i === 1) {
          person.name = this.$(node).text().trim();
        }
        if (i === 2) {
          person.type = this.$(node).text().trim();
        }
        if (i === 3) {
          person.party = this.$(node).text().trim();
        }
      });
      persons.push(person);
    });
    committee.members = persons;
    return committee;
  }

  private getFromPeopleTable = (table: Cheerio): Person[] => {
    const persons: Person[] = [];
    table.each((_, ele) => {
      const person = new Person();
      const tdNodes = ele.childNodes.filter(n => n.name === 'td');

      if (tdNodes.length !== 3) {
        return;
      }
      
      tdNodes.forEach((node, i) => {
        if (i === 1) {
          person.name = this.$(node).text().trim();
        }
        if (i === 2) {
          person.party = this.$(node).text().trim();
        }
      });

      persons.push(person);
    });

    return persons;
  }
}