import { useTranslation } from '@arextest/arex-core';
import { useRequest } from 'ahooks';
import { Tabs, TabsProps } from 'antd';
import React from 'react';

import { ApplicationService } from '@/services';

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
      label: t('appSetting.nodesSort'),
      children: <div>ignore Node</div>,
    },
    {
      key: 'categoryIgnore',
      label: t('appSetting.categoryIgnore'),
      children: <div>Category Node</div>,
    },
    {
      key: 'nodeTransform',
      label: t('appSetting.nodesTransform'),
      children: <div>Node Transform</div>,
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
