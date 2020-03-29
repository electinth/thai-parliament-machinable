
import { config } from './config';
import { ListPage } from './list-page';
import { DetailPage } from './detail-page';
import { Motion } from './models/motion';
import { Fetcher } from './../network';

const itemPerPage = 50;

export const getAllMotions = async (option: Option, fetcher: Fetcher): Promise<Motion[]> => {
  
  const firstListPageUrl = constructUrl(option, option.fromPage || 0);
  const firstPage = await getListPage(firstListPageUrl, fetcher);
  const resultCount = firstPage.getResultCount();
  console.log(`Item count: ${resultCount}`);
  
  const lastPage = getLastPageNo(resultCount, option.toPage);
  console.log(`Will scrap til page: ${lastPage}`);
  
  const promises = [getMotions(firstPage, fetcher)];

  for (let i = (option.fromPage || 0) + 1; i <= lastPage; i++) {
    promises.push(getMotionsOfListPageNo(i, option, fetcher));
  }

  const arraysOfMotions = await Promise.all(promises);
  const motions: Motion[] = [];
  for (const each of arraysOfMotions) {
    motions.push(...each);
  }

  console.log(`Scrap ${motions.length} motions`);
  return motions;
};

export const getListPage = async (url: URL, fetcher: Fetcher): Promise<ListPage> => {
  const firstListPageResponse = await fetcher(url);
  const firstListPageText = await firstListPageResponse.text();

  return new ListPage(firstListPageText);
};

export const getDetailPage = async (partialMotion: Motion, fetcher: Fetcher): Promise<DetailPage> => {
  partialMotion.detailPageUrl = `${config.baseUrl}${partialMotion.detailPageUrl}`;
  const response = await fetcher(partialMotion.detailPageUrl);
  const text = await response.text();

  return new DetailPage(text, partialMotion);
};

const getMotionsOfListPageNo = async (pageNumber: number, option: Option, fetcher: Fetcher): Promise<Motion[]> => {
  const listUrl = constructUrl(option, pageNumber);
  const listPage = await getListPage(listUrl, fetcher);

  return getMotions(listPage, fetcher);
};

const getMotions = async (listPage: ListPage, fetcher: Fetcher): Promise<Motion[]> => {
  const partialMotions = listPage.getPartialMotions();
  return Promise.all(
    partialMotions
      .map((m: Motion) => getDetailPage(m, fetcher))
      .map((p: Promise<DetailPage>) => p.then(d => {
        return d.getMotion();
      }))
  );
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
  
  // Paging
  fromPage?: number;
  toPage?: number;
}

export enum System {
  Motion = 8,
}