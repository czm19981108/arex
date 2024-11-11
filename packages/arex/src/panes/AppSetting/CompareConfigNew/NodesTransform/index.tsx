import { CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from '@arextest/arex-core';
import { useRequest } from 'ahooks';
import { App, Button, Form, Pagination, Popconfirm } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useRef, useState } from 'react';

import AddConfigModal, {
  AddConfigModalProps,
  AddConfigModalRef,
  parseDependency,
} from '@/panes/AppSetting/CompareConfigNew/AddConfigModal';
import ConfigInfoTable, {
  CONFIG_INFO_TABLE_MODE,
} from '@/panes/AppSetting/CompareConfigNew/ConfigInfoTable';
import RootTransformInput from '@/panes/AppSetting/CompareConfigNew/NodesTransform/RootTransformInput';
import { RootTransformInfo } from '@/panes/AppSetting/CompareConfigNew/type';
import { ComparisonService } from '@/services';
import { PageQueryComparisonReq, UpdateTransformRootNodeReq } from '@/services/ComparisonService';

const PAGE_SIZE = {
  SIZE_10: 10,
  SIZE_20: 20,
  SIZE_30: 30,
};

const pageSizeOptions = Object.values(PAGE_SIZE);

export type NodeTransformProps = {
  appId: string;
} & Pick<AddConfigModalProps<RootTransformInfo>, 'operationList'>;

const NodesTransform = (props: NodeTransformProps) => {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const addConfigModalRef = useRef<AddConfigModalRef>(null);

  const [tableMode, setTableMode] = useState<CONFIG_INFO_TABLE_MODE>(
    CONFIG_INFO_TABLE_MODE.DISPLAY,
  );

  const [selectedRows, setSelectedRows] = useState<RootTransformInfo[]>([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE.SIZE_10,
  });

  const [searchParams, setSearchParams] = useState<
    Pick<PageQueryComparisonReq, 'operationIds' | 'dependencyIds'>
  >({});

  const {
    data = { rootTransformInfos: [], totalCount: 0 },
    loading,
    run: queryAggregateRootTransform,
  } = useRequest(
    () =>
      ComparisonService.queryAggregateRootTransform({
        appId: props.appId,
        pageSize: pagination.pageSize,
        pageIndex: pagination.current,
        ...searchParams,
      }),
    {
      refreshDeps: [pagination, searchParams],
    },
  );

  const { run: updateTransformNode } = useRequest(ComparisonService.updateTransformRootNode, {
    manual: true,
    onSuccess: (success) => {
      if (success) {
        queryAggregateRootTransform();
        message.success(t('common:message.updateSuccess'));
      } else message.error(t('common:message.updateFailed'));
    },
  });

  const { run: deleteTransformRootNode } = useRequest(ComparisonService.deleteTransformRootNode, {
    manual: true,
    onSuccess: (success) => {
      if (success) {
        setTableMode(CONFIG_INFO_TABLE_MODE.DISPLAY);
        queryAggregateRootTransform();
        message.success(t('common:message.updateSuccess'));
      } else message.error(t('common:message.updateFailed'));
    },
  });

  const columns: ColumnsType<RootTransformInfo> = [
    {
      dataIndex: 'transformMethodName',
      title: t('components:appSetting.transformMethodName'),
    },
  ];

  const TableFooter = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        {data.totalCount > pagination.pageSize && (
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
        {tableMode === CONFIG_INFO_TABLE_MODE.DISPLAY ? (
          <>
            <Button
              type='text'
              icon={<PlusOutlined />}
              onClick={() => addConfigModalRef.current?.open()}
            >
              {t('common:add')}
            </Button>
            <Button
              type='text'
              icon={<EditOutlined />}
              onClick={() => setTableMode(CONFIG_INFO_TABLE_MODE.EDIT)}
            >
              {t('common:edit')}
            </Button>
          </>
        ) : (
          // tableMode === CONFIG_INFO_TABLE_MODE.EDIT
          <>
            <Button
              type='text'
              icon={<CloseOutlined />}
              onClick={() => setTableMode(CONFIG_INFO_TABLE_MODE.DISPLAY)}
            >
              {t('common:cancel')}
            </Button>
            <Popconfirm title={t('components:appSetting.confirmDelete')} onConfirm={handleDelete}>
              <Button danger type='text' icon={<DeleteOutlined />} disabled={!selectedRows?.length}>
                {t('common:delete')}
              </Button>
            </Popconfirm>
          </>
        )}
      </div>
    </div>
  );

  const handleSubmit: AddConfigModalProps<RootTransformInfo>['onSubmit'] = (form) =>
    form.validateFields().then(({ dependency, ...rest }) => {
      const params = {
        ...parseDependency(dependency),
        ...rest,
      } as UpdateTransformRootNodeReq;
      updateTransformNode(params);
    });

  function handleSearch(search: Record<string, string | undefined>) {
    if (pagination.current !== 1) {
      setPagination({ current: 1, pageSize: pagination.pageSize });
    }

    const operationIds: PageQueryComparisonReq['operationIds'] = [];
    const dependencyIds: PageQueryComparisonReq['dependencyIds'] = [];
    const operationNameSearchLowerCase = search['operationName']?.toLowerCase() || '';
    const dependencyNameSearchLowerCase = search['dependencyName']?.toLowerCase() || '';

    // if (operationNameSearchLowerCase && 'global'.includes(operationNameSearchLowerCase))
    //   operationIds.push(null);

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
    const id = selectedRows[0]?.id;
    if (id) deleteTransformRootNode(id);
  }

  return (
    <>
      <ConfigInfoTable<RootTransformInfo>
        rowKey='id'
        requestSearch
        loading={loading}
        columns={columns}
        dataSource={data.rootTransformInfos}
        footer={TableFooter}
        rowSelection={
          tableMode !== CONFIG_INFO_TABLE_MODE.DISPLAY
            ? {
                type: 'radio',
                onSelect: (record, selected, selectedRows) => {
                  setSelectedRows(selectedRows.filter(Boolean));
                },
              }
            : undefined
        }
        onSearch={handleSearch}
      />

      <AddConfigModal<RootTransformInfo>
        ref={addConfigModalRef}
        title={t('components:appSetting.methodName')} // TODO
        appId={props.appId}
        operationList={props.operationList}
        rules={{
          operationId: [
            {
              required: true,
            },
          ],
        }}
        field={(fieldProps) => (
          <Form.Item
            name='transformMethodName'
            label={t('components:appSetting.addTransformNode')}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <RootTransformInput appId={fieldProps.appId} />
          </Form.Item>
        )}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default NodesTransform;
