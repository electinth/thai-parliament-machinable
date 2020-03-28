import fetch from 'node-fetch';
import { ListPage } from './list-page';
import * as https from 'https';
import { config } from './config';
import { DetailPage } from './detail-page';
import { Motion } from './models/motion';

const itemPerPage = 50;

export const getAll = async (option: Option, agent: https.Agent = new https.Agent()): Promise<Motion[]> => {
  const firstListPageUrl = constructUrl(option, option.fromPage || 0);
  const firstPage = await getListPage(firstListPageUrl, agent);
  const resultCount = firstPage.getResultCount();
  console.log(`Item count: ${resultCount}`);

  const promises = [getMotions(firstPage, agent)];
  
  const lastPage = getLastPageNo(resultCount, option.toPage);
  console.log(`Will scrap til page: ${lastPage}`);

  for (let i = (option.fromPage || 0) + 1; i <= lastPage; i++) {
    promises.push(getMotionsOfListPageNo(i, option, agent));
  }

  const arraysOfMotions = await Promise.all(promises);
  const motions: Motion[] = [];
  for (const each of arraysOfMotions) {
    motions.push(...each);
  }

  console.log(`Scrap ${motions.length} motions`);
  return motions;
};

const getListPage = async (url: URL, agent: https.Agent): Promise<ListPage> => {
  const firstListPageResponse = await fetch(url, { agent });
  const firstListPageText = await firstListPageResponse.text();

  return new ListPage(firstListPageText);
};

const getMotionsOfListPageNo = async (pageNumber: number, option: Option, agent: https.Agent): Promise<Motion[]> => {
  const listUrl = constructUrl(option, pageNumber);
  const listPage = await getListPage(listUrl, agent);

  return getMotions(listPage, agent);
};

const getMotions = async (listPage: ListPage, agent: https.Agent): Promise<Motion[]> => {
  const partialMotions = listPage.getPartialMotions();
  return Promise.all(
    partialMotions
      .map((m: Motion) => getDetailPage(m, agent))
      .map((p: Promise<DetailPage>) => p.then(d => {
        return d.getMotion();
      }))
  );
};

const getDetailPage = async (partialMotion: Motion, agent: https.Agent): Promise<DetailPage> => {
  partialMotion.detailPageUrl = `${config.baseUrl}${partialMotion.detailPageUrl}`;
  const response = await fetch(partialMotion.detailPageUrl, { agent });
  const text = await response.text();

  return new DetailPage(text, partialMotion);
};

const getLastPageNo = (resultCount: number, toPage?: number): number => {
  const possibleLastPage = Math.ceil(resultCount / itemPerPage);
  let lastPage = possibleLastPage;
  if (!toPage) {
    lastPage = 0;
  } else if (toPage > possibleLastPage) {
    lastPage = possibleLastPage;
  } else if (toPage < possibleLastPage) {
    lastPage = toPage;
  }

  return lastPage;
};

const constructUrl = (option: Option, page: number): URL => {
  const url = new URL(`${config.baseUrl}search_advance_detail.php`);
  
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
    url.searchParams.set('offset', (page * itemPerPage).toString());
  }

  return url;
};

export interface Option {
  system?: System;
  sapaNo?: number;
  title?: string;

  // BE
  year?: number;

  // Full party name
  party?: string;
  fromPage?: number;
  toPage?: number;
}

export enum System {
  Motion = 8,
}