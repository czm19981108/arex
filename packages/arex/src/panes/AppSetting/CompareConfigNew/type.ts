export type BaseConfigInfo<T> = {
  id: string;
  operationName: string;
  dependencyName: string;
  dependencyType: string;
  expirationDate: number;
  expirationType: number;
};

export type ExclusionInfo = BaseConfigInfo<{
  exclusionPath: string[];
}>;

export type ListSortInfo = BaseConfigInfo<{
  listPath: string[];
  keys: string[][];
}>;

type IgnoreCategory = {
  operationType: string;
  operationName?: string;
};

export type IgnoreCategoryInfo = BaseConfigInfo<{ ignoreCategoryDetail: IgnoreCategory }>;

export type RootTransformInfo = BaseConfigInfo<{
  transformMethodName: string;
}>;
