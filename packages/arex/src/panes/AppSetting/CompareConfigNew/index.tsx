import { useTranslation } from '@arextest/arex-core';
import { useRequest } from 'ahooks';
import { Tabs, TabsProps } from 'antd';
import React from 'react';

import CategoryIgnore from '@/panes/AppSetting/CompareConfigNew/CategoryIgnore';
import NodesTransform from '@/panes/AppSetting/CompareConfigNew/NodesTransform';
import { ApplicationService } from '@/services';

import ListSort from './ListSort';
import NodeIgnore from './NodeIgnore';

export type CompareConfigNewProps = {
  appId: string;
};

export default function CompareConfigNew(props: CompareConfigNewProps) {
  const { t } = useTranslation('components');

  /**
   * 请求 InterfacesList
   */
  const { data: operationList = [] } = useRequest(
    () => ApplicationService.queryInterfacesList<'Interface'>({ appId: props.appId as string }),
    {
      ready: !!props.appId,
    },
  );

  const compareConfigItems: TabsProps['items'] = [
    {
      key: 'nodeIgnore',
      label: t('appSetting.nodesIgnore'),
      children: <NodeIgnore appId={props.appId} operationList={operationList} />,
    },
    {
      key: 'nodeSort',
      label: t('appSetting.listSort'),
      children: <ListSort appId={props.appId} operationList={operationList} />,
    },
    {
      key: 'categoryIgnore',
      label: t('appSetting.categoryIgnore'),
      children: <CategoryIgnore appId={props.appId} operationList={operationList} />,
    },
    {
      key: 'nodeTransform',
      label: t('appSetting.nodesTransform'),
      children: <NodesTransform appId={props.appId} operationList={operationList} />,
    },
  ];

  return (
    <div>
      <Tabs
        type='card'
        items={compareConfigItems}
        tabBarStyle={{
          margin: '0 12px -1px',
        }}
      />
    </div>
  );
}
