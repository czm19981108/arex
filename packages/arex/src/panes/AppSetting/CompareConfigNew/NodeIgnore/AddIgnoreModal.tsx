import { useTranslation } from '@arextest/arex-core';
import { useRequest } from 'ahooks';
import { App, Form, Modal, Select, SelectProps } from 'antd';
import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';

import ExclusionPathInput from '@/panes/AppSetting/CompareConfigNew/NodeIgnore/ExclusionPathInput';
import { ApplicationService, ComparisonService } from '@/services';
import { OperationInterface } from '@/services/ApplicationService';
import { DependencyParams } from '@/services/ComparisonService';

export type AddIgnoreModalProps = {
  appId: string;
  operationList?: OperationInterface<'Interface'>[];
  onSuccess?: () => void;
};

export type AddIgnoreModalRef = {
  open: () => void;
};

const AddIgnoreModal = forwardRef<AddIgnoreModalRef, AddIgnoreModalProps>((props, ref) => {
  const { message } = App.useApp();
  const { t } = useTranslation();

  const [openAddExclusionModal, setOpenAddExclusionModal] = useState(false);

  const [activeOperationId, setActiveOperationId] = useState<string | undefined>();
  const [activeDependency, setActiveDependency] = useState<DependencyParams | undefined>();
  const [exclusionPathValue, setExclusionPathValue] = useState('');

  useImperativeHandle(
    ref,
    () => ({
      open: () => setOpenAddExclusionModal(true),
    }),
    [],
  );

  const interfaceOptions = useMemo(
    () =>
      Object.entries(
        (props.operationList || []).reduce<
          Record<string, { label: string; value?: string | null }[]>
        >((options, item) => {
          item.operationTypes?.forEach((operation) => {
            if (options[operation]) {
              options[operation].push({
                label: item.operationName,
                value: item.id,
              });
            } else {
              options[operation] = [
                {
                  label: item.operationName,
                  value: item.id,
                },
              ];
            }
          });
          return options;
        }, {}),
      ).map(([label, options]) => ({
        label,
        options,
      })),
    [props.operationList],
  );

  /**
   * 请求 DependencyList
   */
  const { loading: loadingDependency } = useRequest(
    () => ApplicationService.getDependencyList({ operationId: activeOperationId as string }),
    {
      ready: !!activeOperationId,
      refreshDeps: [activeOperationId],
      onSuccess(res) {
        const dependencyList = res.dependencyList;
        dependencyList.length &&
          setActiveDependency({
            operationType: dependencyList?.[0]?.operationType,
            operationName: dependencyList?.[0]?.operationName,
          });
        setDependencyOptions(
          dependencyList.map((dependency) => ({
            label: dependency.operationType + '-' + dependency.operationName,
            value: dependency.operationType + '-' + dependency.operationName,
          })),
        );
      },
    },
  );

  const [dependencyOptions, setDependencyOptions] = useState<SelectProps['options']>();

  const dependencyValue = useMemo(
    () =>
      activeDependency && (activeDependency.operationType || activeDependency.operationName)
        ? activeDependency.operationType + '-' + activeDependency.operationName //TODO null
        : undefined,
    [activeDependency],
  );

  const { run: insertIgnoreNode } = useRequest(ComparisonService.insertIgnoreNode, {
    manual: true,
    onSuccess(success) {
      if (success) {
        message.success(t('message.updateSuccess', { ns: 'common' }));
        handleCloseModal();
        props.onSuccess?.();
      } else {
        message.error(t('message.updateFailed', { ns: 'common' }));
      }
    },
  });

  const handleCloseModal = () => {
    setOpenAddExclusionModal(false);
    setActiveOperationId(undefined);
    setActiveDependency(undefined);
    setExclusionPathValue('');
  };

  return (
    <Modal
      title='Add Ignore'
      open={openAddExclusionModal}
      onOk={() => {
        insertIgnoreNode({
          appId: props.appId,
          operationId: activeOperationId,
          ...activeDependency,
          exclusions: exclusionPathValue.split('/').filter(Boolean),
        });
      }}
      onCancel={handleCloseModal}
    >
      <Form style={{ padding: '8px 0' }}>
        <Form.Item label={t('components:appSetting.interface')}>
          <Select
            allowClear
            optionFilterProp='label'
            placeholder='choose interface'
            popupMatchSelectWidth={false}
            options={interfaceOptions}
            value={activeOperationId}
            onChange={(value) => {
              setActiveOperationId(value);
              setActiveDependency(undefined);
            }}
          />
        </Form.Item>
        <Form.Item label={t('components:appSetting.dependency')}>
          <Select
            allowClear
            optionFilterProp='label'
            placeholder='choose external dependency'
            popupMatchSelectWidth={false}
            loading={loadingDependency}
            options={dependencyOptions}
            value={dependencyValue}
            onChange={(value) => {
              const [operationType, operationName] = value.split('-');
              setActiveDependency({
                operationType,
                operationName,
              });
            }}
          />
        </Form.Item>
        <Form.Item label={t('components:appSetting.path')}>
          <ExclusionPathInput
            appId={props.appId}
            operationId={activeOperationId}
            dependency={activeDependency}
            value={exclusionPathValue}
            onChange={setExclusionPathValue}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default AddIgnoreModal;
