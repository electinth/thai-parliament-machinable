
import { Options, constructUrl, getLastPageNo } from './index';
import { config } from './config';
import { ListPage } from './list-page';
import { DetailPage } from './detail-page';
import { Motion } from './models/motion';
import { Fetcher } from '../network';

export const getAllMotions = async (options: Options, fetcher: Fetcher): Promise<Motion[]> => {
  
  const firstListPageUrl = constructUrl(options, options.fromPage || 0);
  const firstPage = await getListPage(firstListPageUrl, fetcher);
  const resultCount = firstPage.getResultCount();
  console.log(`Item count: ${resultCount}`);
  
  const lastPage = getLastPageNo(resultCount, options.toPage);
  console.log(`Will scrap til page: ${lastPage}`);
  
  const promises = [getMotions(firstPage, fetcher)];

  for (let i = (options.fromPage || 0) + 1; i <= lastPage; i++) {
    promises.push(getMotionsOfListPageNo(i, options, fetcher));
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

const getMotionsOfListPageNo = async (pageNumber: number, options: Options, fetcher: Fetcher): Promise<Motion[]> => {
  const listUrl = constructUrl(options, pageNumber);
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
