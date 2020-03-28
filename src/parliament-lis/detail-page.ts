import * as cheerio from 'cheerio';
import { Motion, Status } from './models/motion';
import { Person } from './models/person';
import { AdHocCommittee } from './models/ad-hoc-committee';

export class DetailPage {
  $: CheerioStatic
  voteDateFromListPage: string
  statusFromListPage: Status

  constructor(body: string, voteDate: string, status: Status) {
    this.$ = cheerio.load(body);
    this.voteDateFromListPage = voteDate;
    this.statusFromListPage = status;
  }

  getMotion = (): Motion => {
    const motion = new Motion();
    motion.name = this.getName();
    motion.registrationNo = this.getRegistrationNo();
    motion.proposedDate = this.getProposedDate();
    motion.votedDate = this.voteDateFromListPage;
    motion.status = this.statusFromListPage;
    motion.contentAndPurpose = this.getContentAndPurpose();
    motion.purposers = this.getPurposers();
    motion.seconders = this.getSeconders();
    motion.adHocCommittee = this.getAdHocCommittee();

    return motion;
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