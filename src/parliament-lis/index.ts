const getJson = (option: Option) => {
};

const constructUrl = (option: Option, page: number): URL => {
  const url = new URL('https://lis.parliament.go.th/index/search_advance_detail.php');
  
  const allParams = [
    'S_SYSTEM',
    'S_SAPA_NO',
    'S_TITLE',
    'S_PROPOS_NAME',
    'S_HPARL',
    'S_CATEGORY',
    'S_YEAR',
    'S_PROPOSTYPE',
    'S_PRIME',
    'S_PARTY',
    'bt_submit',
    'SEARCH_DATA'];

  allParams
    .forEach(param => url.searchParams.set(param, ''));
  
  if (option.system) {
    url.searchParams.set('S_SYSTEM', option.system.toString());
  }

  if (option.sapaNo) {
    url.searchParams.set('S_SAPA_NO', option.sapaNo.toString());
  }

  if (option.title) {
    url.searchParams.set('S_TITLE', option.title);
  }

  if (option.year) {
    url.searchParams.set('S_YEAR', option.year.toString());
  }

  if (option.party) {
    url.searchParams.set('S_PATY', option.party);
  }

  if (page != 0) {
    url.searchParams.set('offset', (page * 50).toString());
  }

  return url;
};

class Option {
  system?: System
  sapaNo?: number
  title?: string

  // BE
  year?: number

  // Full party name
  party?: string
}

enum System {
  Motion = 8,
}

export default {
  getJson,
  constructUrl,
  Option,
  System,
};