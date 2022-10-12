import request from '../api/axios';
import { objectArrayFilter } from '../helpers/utils';
import {
  IgnoreNode,
  InsertIgnoreNodeReq,
  OperationInterface,
  QueryInterfacesListRes,
  QueryRecordDynamicClassSettingReq,
  QueryRecordDynamicClassSettingRes,
  QueryRecordSettingReq,
  QueryRecordSettingRes,
  RemoveDynamicClassSettingReq,
  RemoveDynamicClassSettingRes,
  UpdateDynamicClassSettingReq,
  UpdateDynamicClassSettingRes,
  UpdateIgnoreNodeReq,
  UpdateInterfaceResponseReq,
  UpdateRecordSettingReq,
  UpdateRecordSettingRes,
} from './AppSetting.type';

export default class AppSettingService {
  // 查询 Replay - record 设置数据
  static async queryRecordSetting(params: QueryRecordSettingReq) {
    const res = await request.get<QueryRecordSettingRes>(
      '/config/serviceCollect/useResult/appId/' + params.id,
    );
    return res.body;
  }

  // 更新 Replay - record 设置数据
  static async updateRecordSetting(params: UpdateRecordSettingReq) {
    const res = await request.post<UpdateRecordSettingRes>(
      '/config/serviceCollect/modify/UPDATE',
      params,
    );
    return res.body;
  }

  // 查询 Replay - record Dynamic Classes 设置数据
  static async queryRecordDynamicClassSetting(params: QueryRecordDynamicClassSettingReq) {
    const res = await request.get<QueryRecordDynamicClassSettingRes | undefined>(
      '/config/dynamicClass/useResultAsList/appId/' + params.appId,
    );
    return res.body;
  }

  // 添加 Replay - record Dynamic Classes 设置数据
  static async updatedDynamicClassSetting(params: UpdateDynamicClassSettingReq) {
    const res = await request.post<UpdateDynamicClassSettingRes>(
      '/config/dynamicClass/modify/INSERT',
      params,
    );
    return res.body;
  }

  // 删除 Replay - record Dynamic Classes 设置数据
  static async removeDynamicClassSetting(params: RemoveDynamicClassSettingReq) {
    const res = await request.post<RemoveDynamicClassSettingRes>(
      '/config/dynamicClass/modify/REMOVE',
      params,
    );
    return res.body;
  }

  // 查询 InterfaceResponse 数据
  static async queryInterfaceResponse(params: { id: string }) {
    const res = await request.get<OperationInterface>(
      '/config/applicationOperation/useResult/operationId/' + params.id,
    );
    return res.body;
  }

  // 更新 InterfaceResponse 数据
  static async updateInterfaceResponse(params: UpdateInterfaceResponseReq) {
    const res = await request.post<boolean>('/config/applicationOperation/modify/UPDATE', params);
    return res.body;
  }

  // 获取 IgnoreNode Interface/Global 数据
  static async queryIgnoreNode(params: { appId: string; operationId?: string }) {
    const res = await request.get<IgnoreNode[]>(
      '/api/config/comparison/exclusions/useResultAsList',
      params,
    );
    return res.body;
  }

  // 单个新增 IgnoreNode Interface/Global 数据
  static async insertIgnoreNode(params: InsertIgnoreNodeReq) {
    const res = await request.post<boolean>(
      '/api/config/comparison/exclusions/modify/INSERT',
      params,
    );
    return res.body;
  }

  // 批量新增 IgnoreNode Interface/Global 数据
  static async batchInsertIgnoreNode(params: InsertIgnoreNodeReq[]) {
    const res = await request.post<boolean>(
      '/api/config/comparison/exclusions/batchModify/INSERT',
      params,
    );
    return res.body;
  }

  // 更新 IgnoreNode Interface/Global 数据
  static async updateIgnoreNode(params: UpdateIgnoreNodeReq) {
    const res = await request.post<boolean>(
      '/api/config/comparison/exclusions/modify/UPDATE',
      params,
    );
    return res.body;
  }

  // 删除 IgnoreNode Interface/Global 数据
  static async deleteIgnoreNode(params: { id: string }) {
    const res = await request.post<boolean>(
      '/api/config/comparison/exclusions/modify/REMOVE',
      params,
    );
    return res.body;
  }

  // 查询 NodesSort Interfaces
  static async queryInterfacesList(params: { id: string }) {
    const res = await request.get<QueryInterfacesListRes>(
      '/config/applicationService/useResultAsList/appId/' + params.id,
    );
    return objectArrayFilter<OperationInterface>(
      res.body.reduce<OperationInterface[]>((list, cur) => {
        list.push(...cur.operationList);
        return list;
      }, []),
      'id',
    );
  }
}
