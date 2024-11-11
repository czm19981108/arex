import { IgnoreCategoryInfo } from '@/panes/AppSetting/CompareConfigNew/type';
import { PagingResponse } from '@/services/type';
import { request } from '@/utils';

import { PageQueryComparisonReq } from './queryAggregateIgnoreNode';

export type PageQueryIgnoreCategoryComparisonRes = PagingResponse<{
  ignoreCategories: IgnoreCategoryInfo[];
}>;

export async function queryAggregateIgnoreCategory(params: PageQueryComparisonReq) {
  const { pageIndex = 1, pageSize = 10, needTotal = true, ...restParams } = params;
  const res = await request.post<PageQueryIgnoreCategoryComparisonRes>(
    '/webApi/config/comparison/ignoreCategory/pageQueryComparisonConfig',
    {
      pageIndex,
      pageSize,
      needTotal,
      ...restParams,
    },
  );
  return res.body;
}
