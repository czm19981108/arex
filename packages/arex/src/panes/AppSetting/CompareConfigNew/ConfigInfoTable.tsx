import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from '@arextest/arex-core';
import { InputRef, TableProps, theme } from 'antd';
import { Button, Card, Input, Table, Typography } from 'antd';
import { ColumnsType, ColumnType } from 'antd/es/table';
import type { FilterConfirmProps } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import React, { Key, ReactNode, useRef } from 'react';
import { useImmer } from 'use-immer';

import { SearchHighLight } from '@/components';

import { ComparisonConfigInfo, ExpirationType } from './type';

export enum CONFIG_INFO_TABLE_MODE {
  DISPLAY,
  EDIT,
}

export interface ConfigInfoTableProps<T> extends TableProps<T> {
  builtInColumns?: Partial<Record<keyof T, ColumnsType<T>[number]>>;
  requestSearch?: boolean;
  onSearch?: (search: Record<string, string | undefined>) => void;
}

export default function ConfigInfoTable<T extends ComparisonConfigInfo>(
  props: ConfigInfoTableProps<T>,
) {
  const { t } = useTranslation();

  const { columns: configColumns, ...tableProps } = props;
  const { token } = theme.useToken();

  const [search, setSearch] = useImmer<Record<string, string | undefined> | undefined>(undefined);
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: string,
  ) => {
    const searchValue = selectedKeys[0];

    setSearch((draft) => {
      if (!draft) {
        return { [dataIndex]: searchValue };
      } else {
        draft[dataIndex] = searchValue;
      }
    });
    !props.requestSearch && confirm();
    search && props.onSearch?.({ ...search, [dataIndex]: searchValue });
  };

  // 获取列搜索配置
  const getColumnSearchProps = (
    dataIndex: keyof T,
    fallback?: ReactNode | ((record: T) => ReactNode),
  ): ColumnType<T> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 12 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex.toString()}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex.toString())}
          style={{ marginBottom: 8, display: 'block' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
          <Button
            size='small'
            onClick={() => {
              clearFilters?.();
              setSearch((draft) => {
                if (!draft) {
                  return {};
                } else {
                  draft[dataIndex as string] = '';
                }
              });
            }}
          >
            {t('common:reset')}
          </Button>

          <Button
            size='small'
            type='primary'
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex.toString())}
            icon={<SearchOutlined />}
          >
            {t('common:search')}
          </Button>
        </div>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined
        style={{
          color: search?.[dataIndex as string] || filtered ? token.colorPrimary : undefined,
        }}
      />
    ),
    onFilter: (value: boolean | Key, record: T) =>
      record[dataIndex]
        ? String(record[dataIndex])?.toLowerCase().includes(value.toString().toLowerCase())
        : false,
    onFilterDropdownOpenChange: (open: boolean) => {
      open && setTimeout(() => searchInput.current?.select(), 100);
    },
    render: (text: string | null, record) => {
      const columnsSearchValue = search?.[dataIndex as string];
      if (
        !!columnsSearchValue &&
        text?.toLowerCase().includes(columnsSearchValue.toLowerCase() || '')
      ) {
        return <SearchHighLight text={text} keyword={search[dataIndex as string]} />;
      } else {
        return (
          text ||
          (typeof fallback === 'function'
            ? (fallback as (record: T) => ReactNode)?.(record)
            : fallback)
        );
      }
    },
  });

  // 定义表格的列配置
  const columns: ColumnsType<T> = [
    {
      title: t('components:appSetting.interface'),
      dataIndex: 'operationName',
      ...getColumnSearchProps(
        'operationName',
        <Typography.Text italic type='secondary'>
          Global
        </Typography.Text>,
      ),
      ...props.builtInColumns?.operationName,
    },
    {
      title: t('components:appSetting.dependency'),
      dataIndex: 'dependencyName',
      ...getColumnSearchProps('dependencyName', (record) => (
        <Typography.Text italic type='secondary'>
          {record.operationName ? 'Entry' : 'Global'}
        </Typography.Text>
      )),
      ...props.builtInColumns?.dependencyName,
    },
    ...(configColumns || []),
    {
      title: t('components:appSetting.expireOn'),
      dataIndex: 'expirationDate',
      render: (date: number, record) =>
        record.expirationType === ExpirationType.PINNED_NEVER_EXPIRED ? (
          <Typography.Text italic type='secondary' style={{ wordBreak: 'keep-all' }}>
            {t('common:neverExpired')}
          </Typography.Text>
        ) : (
          dayjs(date).format('YYYY/MM/HH:mm')
        ),
      ...props.builtInColumns?.expirationDate,
    },
  ];

  return (
    <Card>
      <Table<T> pagination={false} {...tableProps} columns={columns} />
    </Card>
  );
}
