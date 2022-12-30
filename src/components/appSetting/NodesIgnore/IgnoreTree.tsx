import styled from '@emotion/styled';
import { Button, Card, Spin, Tree, Typography } from 'antd';
import { TreeProps } from 'antd/es';
import { DataNode } from 'antd/lib/tree';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { SpaceBetweenWrapper } from '../../styledComponents';
import EmptyResponse from './EmptyResponse';

type IgnoreTreeProps = Omit<TreeProps, 'treeData'> & {
  loading?: boolean;
  treeData: object;
  title?: string;
  onSave?: () => void;
  onEditResponse?: () => void;
};
// const IgnoreTreeWrapper = styled.div`
//   .ant-tree-node-selected {
//     text-decoration: line-through;
//   }
// `;

const IgnoreTree: FC<IgnoreTreeProps> = (props) => {
  const { t } = useTranslation('common');

  // 过滤出 object 类型的节点
  function getNodes(object: object, basePath = ''): DataNode[] {
    const entries = Object.entries(object);
    return entries.map(([key, value]) => {
      const path = basePath + key + '/';
      return value && typeof value === 'object'
        ? {
            title: key,
            key: path,
            children: getNodes(Array.isArray(value) ? value[0] || {} : value, path),
          }
        : { title: key, key: path, value };
    });
  }

  return (
    // <IgnoreTreeWrapper>
    <>
      <SpaceBetweenWrapper style={{ paddingBottom: '8px' }}>
        <Typography.Title level={5}>Data Structure</Typography.Title>
        <Button size='small' type='primary' onClick={() => props.onSave && props.onSave()}>
          {t('save')}
        </Button>
      </SpaceBetweenWrapper>

      <Card size='small' title={`${props.title} (click node to ignore)`}>
        <Spin spinning={props.loading}>
          {Object.keys(props.treeData).length ? (
            <Tree multiple defaultExpandAll {...props} treeData={getNodes(props.treeData, '')} />
          ) : (
            <EmptyResponse onClick={props.onEditResponse} />
          )}
        </Spin>
      </Card>
    </>
    // </IgnoreTreeWrapper>
  );
};

export default IgnoreTree;
