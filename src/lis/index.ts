import fetch from 'node-fetch';
import * as nodeFetch from 'node-fetch';
import * as https from 'https';
import Bottleneck from 'bottleneck';
import { config } from './config';
import { ListPage } from './list-page';
import { DetailPage } from './detail-page';
import { Motion } from './models/motion';

const itemPerPage = 50;

export const getAllMotions = async (option: Option, agent: https.Agent = new https.Agent()): Promise<Motion[]> => {
  configLimiter(option);
  
  const firstListPageUrl = constructUrl(option, option.fromPage || 0);
  const firstPage = await getListPage(firstListPageUrl, agent);
  const resultCount = firstPage.getResultCount();
  console.log(`Item count: ${resultCount}`);
  
  const lastPage = getLastPageNo(resultCount, option.toPage);
  console.log(`Will scrap til page: ${lastPage}`);
  
  const promises = [getMotions(firstPage, agent)];

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
  const firstListPageResponse = await fetchUrl(url, agent);
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
  const response = await fetchUrl(partialMotion.detailPageUrl, agent);
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

let limiter = new Bottleneck();

const configLimiter = (option: Option): void => {
  console.log(`
-------------------------------------
Limiter concurrent = ${option.limiter.maxConcurrent || 'unlimited'}
Delay time between request = ${option.limiter.minTime || 0} ms
-------------------------------------`);

  limiter = new Bottleneck(option.limiter);
};

const fetchUrl = (url: URL | string, agent: https.Agent): Promise<nodeFetch.Response> => {
  console.log(`---- Queued ${url}`);
  return limiter.schedule(() => fetch(url, { agent })
    .then(r => {
      console.log(`---- Fetched ${url}`);
      return r;
    }));
};

export interface Option {
  system?: System;
  sapaNo?: number;
  title?: string;

  // BE
  year?: number;

  // Full party name
  party?: string;
  
  // Paging
  fromPage?: number;
  toPage?: number;

  limiter: Bottleneck.ConstructorOptions;
}

export enum System {
  Motion = 8,
}