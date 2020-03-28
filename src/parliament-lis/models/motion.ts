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
  detailPageUrl: string
}

export const parseStatus = (text: string): Status => {
  return Status.Unknown;
};

export enum Status {
  Unknown
}

export class VotedResult {

}

export enum VotedResultType {
  
}