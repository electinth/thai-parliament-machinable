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
  if (!(text in statusMap)) return Status.Unknown;
  return statusMap[text];
};

export enum Status {
  Processing = 'อยู่ระหว่างการดำเนินการของเจ้าหน้าที่',
  InQueue = 'รอบรรจุระเบียบวาระเพื่อพิจารณา',
  InSession = 'อยู่ระหว่างการพิจารณา',
  SentToCabinet = 'ส่งคณะรัฐมนตรีดำเนินการแล้ว',
  ParliamentAppointedCommittee = 'มีการแต่งตั้งคณะกรรมาธิการ',
  CommitteeWorking = 'อยู่ระหว่างการพิจารณาของคณะกรรมาธิการ',
  ParliamentApprovedObservation = 'การดำเนินงานตามข้อสังเกตของคณะกรรมาธิการสภาผู้แทนราษฎร',
  Unknown = '',
}

const statusMap: {[ id: string ]: Status } = {
  'อยู่ระหว่างการดำเนินการของเจ้าหน้าที่': Status.Processing,
  'รอบรรจุระเบียบวาระเพื่อพิจารณา': Status.InQueue,
  'อยู่ระหว่างการพิจารณา': Status.InSession,
  'หนังสือส่งค.ร.ม.เรียบร้อยแล้ว': Status.SentToCabinet,
  'ส่งคณะรัฐมนตรีดำเนินการแล้ว': Status.SentToCabinet,
  'ส่งให้คณะรัฐมนตรี': Status.SentToCabinet,
  'มีการแต่งตั้งคณะกรรมาธิการ': Status.ParliamentAppointedCommittee,
  'อยู่ระหว่างการพิจารณาของคณะกรรมาธิการ': Status.CommitteeWorking,
  'การดำเนินงานตามข้อสังเกตของคณะกรรมาธิการสภาผู้แทนราษฎร': Status.ParliamentApprovedObservation,
  'ผลการดำเนินงานตามข้อสังเกตของคณะกรรมาธิการ': Status.ParliamentApprovedObservation,
};

export class VotedResult {

}

export enum VotedResultType {
  
}