import { Person } from './person';
import { AdHocCommittee } from './ad-hoc-committee';

export class Motion {
  name: string
  registrationNo: string
  proposedDate: string
  votedDate: string
  status: Status
  contentAndPurpose: string
  votedResult: VotedResult 
  purposers: Person[]
  seconders: Person[]
  adHocCommittee: AdHocCommittee
}

export enum Status {

}

export class VotedResult {

}

export enum VotedResultType {
  
}