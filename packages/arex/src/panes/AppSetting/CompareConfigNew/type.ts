import { IgnoreCategory } from '@/services/ComparisonService';

export type ComparisonConfigInfo = {
  id: string;
  operationName: string;
  dependencyName: string;
  dependencyType: string;
  expirationDate: number;
  expirationType: number;
};

export interface ExclusionInfo extends ComparisonConfigInfo {
  exclusionPath: string[];
}

export interface ListSortInfo extends ComparisonConfigInfo {
  listPath: string[];
  keys: string[][];
}

export interface IgnoreCategoryInfo extends ComparisonConfigInfo {
  ignoreCategoryDetail: IgnoreCategory;
}

export interface RootTransformInfo extends ComparisonConfigInfo {
  transformMethodName: string;
}
