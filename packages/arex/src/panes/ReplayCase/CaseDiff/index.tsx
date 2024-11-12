import { css, EllipsisTooltip, EmptyWrapper, SceneCode, useTranslation } from '@arextest/arex-core';
import { Collapse, CollapseProps, Flex, Tooltip, Typography } from 'antd';
import React, { FC, useMemo, useState } from 'react';

import { InfoItem } from '@/services/ReportService';

import CaseDiffTooltip, { DiffPathTooltipProps } from './CaseDiffTooltip';
import { DiffPathViewerProps } from './CaseDiffViewer';
import CaseDiffViewer from './CaseDiffViewer';

export interface DiffPathProps extends Omit<DiffPathViewerProps, 'data' | 'id'> {
  appId: string;
  operationId: string;
  mode?: DiffPathTooltipProps['mode'];
  loading?: boolean;
  extra?: React.ReactNode;
  itemsExtraRender?: (data: InfoItem) => React.ReactNode;
  defaultOnlyFailed?: boolean;
  data: InfoItem[];
}

const CaseDiff: FC<DiffPathProps> = (props) => {
  const {
    data,
    loading,
    mode = 'multiple',
    defaultOnlyFailed = true,
    extra,
    itemsExtraRender,
    ...restProps
  } = props;

  const { t } = useTranslation('components');

  const [onlyFailed, setOnlyFailed] = useState(defaultOnlyFailed);

  const [searchOperationName, setSearchOperationName] = useState<string>();

  const diffListFiltered = useMemo<InfoItem[]>(() => {
    return data.filter((data) => {
      if (onlyFailed && !data.code) {
        return false;
      }
      if (searchOperationName) {
        return data.operationName.includes(searchOperationName);
      }
      return true;
    });
  }, [data, onlyFailed, searchOperationName]);

  const items = useMemo<CollapseProps['items']>(
    () =>
      diffListFiltered.map((data) => ({
        key: data.id,
        label: (
          <Flex>
            <SceneCode code={data.code} />
            <Typography.Text strong>
              <EllipsisTooltip title={data.operationName} />{' '}
            </Typography.Text>

            <div style={{ marginLeft: '8px' }}>
              {data.isEntry || data.ignore ? (
                <Tooltip title={data.ignore ? t('replayCase.ignored') : undefined}>
                  <Typography.Text strong delete={!!data.ignore} type='secondary'>
                    {`[${data.categoryName}]`}
                  </Typography.Text>
                </Tooltip>
              ) : (
                <Typography.Text strong type='secondary'>
                  {`[${data.categoryName}]`}
                </Typography.Text>
              )}
            </div>
          </Flex>
        ),
        extra: itemsExtraRender?.(data),
        children: <CaseDiffViewer {...restProps} defaultActiveFirst data={data} height='400px' />,
      })),
    [diffListFiltered, itemsExtraRender, restProps],
  );

  return (
    <>
      <CaseDiffTooltip
        mode={mode}
        extra={extra}
        count={diffListFiltered.length}
        onFilterChange={setOnlyFailed}
        onSearch={setSearchOperationName}
      />

      <EmptyWrapper loading={loading} empty={!diffListFiltered.length}>
        <Collapse
          accordion
          destroyInactivePanel
          size='small'
          // defaultActiveKey={diffListFiltered[0]?.id}
          items={items}
          css={css`
            .ant-collapse-content-box {
              padding: 0 !important;
            }
          `}
        />
      </EmptyWrapper>
    </>
  );
};

export default CaseDiff;
