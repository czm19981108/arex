import { DownOutlined } from '@ant-design/icons';
import { styled, TooltipButton, tryParseJsonString, useTranslation } from '@arextest/arex-core';
import { useRequest } from 'ahooks';
import { Button, Collapse, Form, Input, InputProps, Space, theme, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

import { ReportService } from '@/services';
import { DependencyParams } from '@/services/ComparisonService';

import IgnoreTree from './IgnoreTree';

const IgnoreTreeWrapper = styled.div<{ lineThrough?: boolean }>`
  .ant-tree-node-selected {
    text-decoration: ${(props) => (props.lineThrough ? 'line-through' : 'none')};
  }
`;

export type ExclusionPathInputProps = Omit<InputProps, 'onChange'> & {
  appId: string;
  operationId?: string;
  dependency?: DependencyParams;
  onChange?: (value: string) => void;
};

const IgnorePathInput = (props: ExclusionPathInputProps) => {
  const { appId, operationId, dependency, ...inputProps } = props;

  const { t } = useTranslation();

  const [expand, setExpand] = useState(false);

  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>();

  const {
    data: contract,
    mutate: setContract,
    loading: loadingContract,
  } = useRequest(
    () =>
      ReportService.queryContract({
        appId,
        operationId,
        ...dependency,
      }),
    {
      ready: !!appId, // TODO && collapseExpand
      refreshDeps: [appId, operationId, dependency],
      onBefore() {
        setContract();
      },
    },
  );

  const contractParsed = useMemo<{ [key: string]: any }>(() => {
    const res = contract?.contract;
    if (res) return tryParseJsonString(res) || {};
    else return {};
  }, [contract]);

  return (
    <IgnoreTreeWrapper lineThrough>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          {...inputProps}
          onChange={(e) => {
            props.onChange?.(e.target.value);
          }}
        />
        <TooltipButton
          type='default'
          size='middle'
          title={<Typography.Text>{'select from tree'}</Typography.Text>}
          icon={<DownOutlined />}
          textProps={{ style: { height: '10px' } }}
          onClick={() => setExpand(!expand)}
        />
      </Space.Compact>

      <Collapse
        ghost
        activeKey={expand ? 'nodeTree' : undefined}
        items={[
          {
            key: 'nodeTree',
            showArrow: false,
            // TODO styles no padding
            children: (
              <IgnoreTree
                multiple={false}
                loading={loadingContract}
                selectedKeys={selectedKeys}
                onSelect={(keys) => {
                  setSelectedKeys(keys);
                  props.onChange?.(keys.join('/'));
                }}
                treeData={contractParsed}
              />
            ),
          },
        ]}
      />
    </IgnoreTreeWrapper>
  );
};

export default IgnorePathInput;
