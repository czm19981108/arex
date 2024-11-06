import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from '@arextest/arex-core';
import { useRequest } from 'ahooks';
import { App, Pagination, Popconfirm } from 'antd';
import { Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useRef, useState } from 'react';

import { ComparisonService } from '@/services';
import { PageQueryComparisonReq } from '@/services/ComparisonService';

import ConfigInfoTable from '../ConfigInfoTable';
import { ExclusionInfo } from '../type';
import AddIgnoreModal, { AddIgnoreModalProps } from './AddIgnoreModal';
import { AddIgnoreModalRef } from './AddIgnoreModal';

const PAGE_SIZE = {
  SIZE_10: 10,
  SIZE_20: 20,
  SIZE_30: 30,
};

const pageSizeOptions = Object.values(PAGE_SIZE);

export type NodeIgnoreProps = { appId: string } & Pick<AddIgnoreModalProps, 'operationList'>;

// NodeIgnore 组件
export default function NodeIgnore(props: NodeIgnoreProps) {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const addIgnoreModalRef = useRef<AddIgnoreModalRef>(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE.SIZE_10,
  });

  const [searchParams, setSearchParams] = useState<
    Pick<PageQueryComparisonReq, 'operationIds' | 'dependencyIds'>
  >({});

  const [selectedRows, setSelectedRows] = useState<ExclusionInfo[]>([]);

  // 定义表格的列配置
  const columns: ColumnsType<ExclusionInfo> = [
    {
      title: t('components:appSetting.path'),
      dataIndex: 'exclusionPath',
      // ...getColumnSearchProps('exclusionPath'),
      render: (path: string[]) => '/ ' + path.join(' / '),
    },
  ];

  const {
    data = { totalCount: 0, exclusions: [] },
    loading,
    run: queryAggregateIgnoreNode,
  } = useRequest(
    () =>
      ComparisonService.queryAggregateIgnoreNode({
        appId: props.appId,
        pageSize: pagination.pageSize,
        pageIndex: pagination.current,
        ...searchParams,
      }),
    {
      refreshDeps: [pagination, searchParams],
    },
  );

  /**
   * 批量删除 IgnoreNode
   */
  const { run: batchDeleteIgnoreNode } = useRequest(ComparisonService.batchDeleteIgnoreNode, {
    manual: true,
    onSuccess(success) {
      if (success) {
        queryAggregateIgnoreNode();
      } else {
        message.error(t('common:message.delFailed'));
      }
    },
  });

  function handleSearch(search: Record<string, string | undefined>) {
    if (pagination.current !== 1) {
      setPagination({ current: 1, pageSize: pagination.pageSize });
    }

    const operationIds: PageQueryComparisonReq['operationIds'] = [];
    const dependencyIds: PageQueryComparisonReq['dependencyIds'] = [];
    const operationNameSearchLowerCase = search['operationName']?.toLowerCase() || '';
    const dependencyNameSearchLowerCase = search['dependencyName']?.toLowerCase() || '';

    if (operationNameSearchLowerCase && 'global'.includes(operationNameSearchLowerCase))
      operationIds.push(null);

    props.operationList?.forEach((operation) => {
      if (
        operationNameSearchLowerCase &&
        operation.operationName.toLowerCase().includes(operationNameSearchLowerCase)
      )
        operationIds.push(operation.id);
      operation.dependencyList?.forEach((dependency) => {
        if (
          dependencyNameSearchLowerCase &&
          dependency.operationName?.toLowerCase()?.includes(dependencyNameSearchLowerCase)
        )
          dependencyIds.push(dependency.dependencyId);
      });
    });

    setSearchParams({
      operationIds,
      dependencyIds,
    });
  }

  function handleDelete() {
    batchDeleteIgnoreNode(selectedRows.map((row) => ({ id: row.id })));
  }

  const TableFooter = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        {data.totalCount >= pagination.pageSize && (
          <Pagination
            total={data.totalCount}
            current={pagination.current}
            pageSize={pagination.pageSize}
            pageSizeOptions={pageSizeOptions}
            onChange={(page, pageSize) => {
              setPagination({
                current: page,
                pageSize,
              });
            }}
          />
        )}
      </div>

      <div>
        <Button
          type='text'
          icon={<PlusOutlined />}
          onClick={() => addIgnoreModalRef.current?.open()}
        >
          {t('common:add')}
        </Button>

        <Popconfirm title={t('components:appSetting.confirmDelete')} onConfirm={handleDelete}>
          <Button danger type='text' icon={<DeleteOutlined />} disabled={!selectedRows?.length}>
            {t('common:delete')}
          </Button>
        </Popconfirm>
      </div>
    </div>
  );

  return (
    <div>
      <ConfigInfoTable<ExclusionInfo>
        rowKey='id'
        requestSearch
        loading={loading}
        columns={columns}
        dataSource={data?.exclusions}
        footer={TableFooter}
        rowSelection={{
          selections: true,
          onSelect: (record, selected, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        onSearch={handleSearch}
      />

      <AddIgnoreModal
        ref={addIgnoreModalRef}
        appId={props.appId}
        operationList={props.operationList}
        onSuccess={queryAggregateIgnoreNode}
      />
    </div>
  );
}
