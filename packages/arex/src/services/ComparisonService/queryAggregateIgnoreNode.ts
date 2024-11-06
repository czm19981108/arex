import { ExclusionInfo } from '@/panes/AppSetting/CompareConfigNew/type';
import { PagingRequest, PagingResponse } from '@/services/type';
import { request } from '@/utils';

export type PageQueryComparisonReq = PagingRequest<{
  appId: string;
  operationIds?: (string | null)[]; // use null search for global
  dependencyIds?: string[];
}>;

export type PageQueryComparisonRes = PagingResponse<{ exclusions: ExclusionInfo[] }>;

export async function queryAggregateIgnoreNode(params: PageQueryComparisonReq) {
  const { pageIndex = 1, pageSize = 10, needTotal = true, ...restParams } = params;
  const res = await request.post<PageQueryComparisonRes>(
    '/webApi/config/comparison/exclusions/pageQueryComparisonConfig',
    {
      pageIndex,
      pageSize,
      needTotal,
      ...restParams,
    },
  );
  return res.body;
}
