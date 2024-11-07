import { ListSortInfo } from '@/panes/AppSetting/CompareConfigNew/type';
import { PagingResponse } from '@/services/type';
import { request } from '@/utils';

import { PageQueryComparisonReq } from './queryAggregateIgnoreNode';

export type PageQuerySortComparisonRes = PagingResponse<{ listSorts: ListSortInfo[] }>;

export async function queryAggregateSortNode(params: PageQueryComparisonReq) {
  const { pageIndex = 1, pageSize = 10, needTotal = true, ...restParams } = params;
  const res = await request.post<PageQuerySortComparisonRes>(
    '/webApi/config/comparison/listsort/pageQueryComparisonConfig',
    {
      pageIndex,
      pageSize,
      needTotal,
      ...restParams,
    },
  );
  return res.body;
}
