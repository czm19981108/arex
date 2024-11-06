import { styled, tryParseJsonString } from '@arextest/arex-core';
import { useRequest } from 'ahooks';
import { Collapse, Input, InputProps, theme, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

import IgnoreTree from '@/panes/AppSetting/CompareConfig/NodesIgnore/IgnoreTree';
import { ReportService } from '@/services';
import { DependencyParams } from '@/services/ComparisonService';

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

const ExclusionPathInput = (props: ExclusionPathInputProps) => {
  const { appId, operationId, dependency, ...inputProps } = props;

  const { token } = theme.useToken();

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
      ready: !!appId,
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
      <Input
        {...inputProps}
        onChange={(e) => {
          props.onChange?.(e.target.value);
        }}
      />

      <Collapse
        ghost
        items={[
          {
            key: 'nodeTree',
            label: (
              <Typography.Text style={{ color: token.colorPrimaryText }}>
                select from tree
              </Typography.Text>
            ),
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

export default ExclusionPathInput;
