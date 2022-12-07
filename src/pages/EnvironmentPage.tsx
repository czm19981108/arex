import {
  AimOutlined,
  CopyOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Button, Divider, message, Popconfirm, Space } from 'antd';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useImmer } from 'use-immer';

import { TooltipButton } from '../components';
import EditableKeyValueTable, { useColumns } from '../components/EditableKeyValueTable';
import PanesTitle, { PanesTitleProps } from '../components/styledComponents/PanesTitle';
import EnvironmentService from '../services/Environment.service';
import { Environment } from '../services/Environment.type';
import { useStore } from '../store';
import { PageFC } from './index';

const EnvironmentPage: PageFC<Environment> = (props) => {
  const { page } = props;

  const { workspaceId } = useParams();
  const {
    removePage,
    activeEnvironment,
    setActiveEnvironment,
    setEnvironmentLastManualUpdateTimestamp,
  } = useStore();

  const [keyValues, setKeyValues] = useImmer(page.data?.keyValues || []);

  const { run: saveEnv } = useRequest(EnvironmentService.saveEnvironment, {
    manual: true,
    onSuccess(res) {
      message.success('保存成功');
      setEnvironmentLastManualUpdateTimestamp(new Date().getTime());
    },
  });

  const { run: duplicateEnvironment } = useRequest(
    () =>
      EnvironmentService.duplicateEnvironment({
        id: page.data.id,
        workspaceId: workspaceId as string,
      }),
    {
      manual: true,
      ready: !!workspaceId,
      onSuccess(res) {
        if (res.body.success == true) {
          setEnvironmentLastManualUpdateTimestamp(new Date().getTime());
        }
      },
    },
  );

  const { run: deleteEnvironment } = useRequest(
    () =>
      EnvironmentService.deleteEnvironment({
        id: page.data.id,
        workspaceId: workspaceId as string,
      }),
    {
      manual: true,
      onSuccess(res) {
        if (res.body.success == true) {
          setEnvironmentLastManualUpdateTimestamp(new Date().getTime());
          removePage(page.paneId);
        }
      },
    },
  );

  const handleTitleSave: PanesTitleProps['onSave'] = (envName) =>
    saveEnv({ env: { ...page.data, keyValues, envName } });

  return (
    <>
      <PanesTitle
        editable
        title={page.title}
        extra={
          <Space>
            <TooltipButton
              disabled={activeEnvironment?.id === page.data.id}
              icon={<AimOutlined />}
              placement='left'
              title='Set as current environment'
              onClick={() => setActiveEnvironment(page.data as Environment)}
            />
            <TooltipButton
              icon={<CopyOutlined />}
              title='Duplicate current environment'
              onClick={duplicateEnvironment}
            />

            <Divider type='vertical' />

            <TooltipButton
              icon={<PlusOutlined />}
              title='Create environment keyValue'
              onClick={() =>
                setKeyValues((state) => {
                  state.push({ key: '', value: '', active: true });
                })
              }
            />

            <Popconfirm
              title={
                <span style={{ display: 'block', maxWidth: '256px' }}>
                  Deleting this environment might cause any monitors or mock servers using it to
                  stop functioning properly. Are you sure you want to continue?
                </span>
              }
              onConfirm={deleteEnvironment}
              okText='Yes'
              cancelText='No'
            >
              <Button size='small' type='text' icon={<DeleteOutlined />} />
            </Popconfirm>

            <TooltipButton
              icon={<SaveOutlined />}
              title='Save'
              onClick={() => saveEnv({ env: { ...page.data, keyValues } })}
            />
          </Space>
        }
        onSave={handleTitleSave}
      />

      <EditableKeyValueTable
        bordered
        showHeader
        size='small'
        rowKey={'id'}
        pagination={false}
        dataSource={keyValues}
        // @ts-ignore
        columns={useColumns(setKeyValues, true)}
        style={{ marginTop: '16px' }}
      />
    </>
  );
};

export default EnvironmentPage;
