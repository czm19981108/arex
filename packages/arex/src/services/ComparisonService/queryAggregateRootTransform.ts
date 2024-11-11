import { RootTransformInfo } from '@/panes/AppSetting/CompareConfigNew/type';
import { PagingResponse } from '@/services/type';
import { request } from '@/utils';

import { PageQueryComparisonReq } from './queryAggregateIgnoreNode';

export type PageQueryRootTransformComparisonRes = PagingResponse<{
  rootTransformInfos: RootTransformInfo[];
}>;

export async function queryAggregateRootTransform(params: PageQueryComparisonReq) {
  const { pageIndex = 1, pageSize = 10, needTotal = true, ...restParams } = params;
  const res = await request.post<PageQueryRootTransformComparisonRes>(
    '/webApi/config/comparison/rootTransform/pageQueryComparisonConfig',
    {
      pageIndex,
      pageSize,
      needTotal,
      ...restParams,
    },
  );
  return res.body;
}
