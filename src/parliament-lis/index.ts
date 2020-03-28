import fetch from 'node-fetch';
import { ListPage } from './list-page';
import * as https from 'https';

process.env.BASE_URL = 'https://lis.parliament.go.th/index/';

const getJson = async (option: Option, agent: https.Agent = new https.Agent()) => {
  const firstListPageUrl = constructUrl(option, 0);
  const firstListPageResponse = await fetch(firstListPageUrl.href, { agent });
  const firstListPageText = await firstListPageResponse.text();

  const firstListPage = new ListPage(firstListPageText);
  // const links = [firstListPage.getLinks()[36]];
  console.log(firstListPage.getPartialMotions());

  // const motions = await Promise.all(links.map(async link => {
  //   const response = await fetch(BASE_URL + link, { agent });
  //   const text = await response.text();
  //   return new DetailPage(text).getMotion();
  // }));

  // console.log(motions);
};

const constructUrl = (option: Option, page: number): URL => {
  const url = new URL(`${process.env.BASE_URL}search_advance_detail.php`);
  
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