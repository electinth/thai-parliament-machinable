import * as motion from './motion';
import { config } from './config';

const itemPerPage = 50;

export const getLastPageNo = (resultCount: number, toPage?: number): number => {
  const possibleLastPage = Math.ceil(resultCount / itemPerPage);
  if (!toPage) {
    return possibleLastPage;
  }
  
  if (toPage < possibleLastPage) {
    return toPage;
  }

  return possibleLastPage;
};

export const constructUrl = (options: Options, page: number): URL => {
  const url = new URL(`${config.lisBaseUrl}search_advance_detail.php`);
  
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
  
  if (options.system) {
    url.searchParams.set('S_SYSTEM', options.system.toString());
  }

  if (options.sapaNo) {
    url.searchParams.set('S_SAPA_NO', options.sapaNo.toString());
  }

  if (options.title) {
    url.searchParams.set('S_TITLE', options.title);
  }

  if (options.year) {
    url.searchParams.set('S_YEAR', options.year.toString());
  }

  if (options.party) {
    url.searchParams.set('S_PATY', options.party);
  }

  if (page != 0) {
    url.searchParams.set('offset', (page * itemPerPage).toString());
  }

  return url;
};

export interface Options {
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

export {
  motion,
};
