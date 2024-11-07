import { useTranslation } from '@arextest/arex-core';
import { useRequest } from 'ahooks';
import { Form, FormInstance, Input, Modal, Select, SelectProps } from 'antd';
import { Rule } from 'antd/es/form';
import React, {
  ForwardedRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';

import { Connector } from '@/constant';
import { ApplicationService } from '@/services';
import { DependencyData, OperationInterface } from '@/services/ApplicationService';
import { IgnoreNodeBase } from '@/services/ComparisonService';

type DependencyParams = Pick<IgnoreNodeBase, 'operationType' | 'operationName'>;

type CompareConfigParams = {
  appId: string;
  operationId?: string;
  dependency?: string;
};

type CompareConfigForm<T> = CompareConfigParams & T;

export type AddConfigModalProps<T> = {
  appId: string;
  title?: ReactNode;
  field?: (appId: string, operationId?: string, dependency?: DependencyParams) => ReactNode;
  rules?: {
    operationId?: Rule[];
    dependency?: Rule[];
  };
  operationList?: OperationInterface<'Interface'>[];
  onOk?: (form: FormInstance<CompareConfigForm<T>>) => Promise<any>;
  onClose?: () => void;
};

export type AddConfigModalRef = {
  open: () => void;
  close: () => void;
  getForm: () => FormInstance;
  validate: () => Promise<any>;
  submit: () => void;
};

type FixedForwardRef = <T, P = object>(
  render: (props: P, ref: React.Ref<T>) => React.ReactElement | null,
) => (props: P & React.RefAttributes<T>) => React.ReactElement | null;

const forwardRef = React.forwardRef as FixedForwardRef;

const AddConfigModal = forwardRef(
  <T,>(props: AddConfigModalProps<T>, ref: ForwardedRef<AddConfigModalRef>) => {
    const { t } = useTranslation();

    const [form] = Form.useForm<CompareConfigForm<T>>();
    const operationId = Form.useWatch('operationId', form);

    // reset dependency when operationId changed
    useEffect(() => {
      // @ts-ignore
      form.setFieldValue('dependency', undefined);
    }, [operationId]);

    const [openAddConfigModal, setOpenAddConfigModal] = useState(false);

    useImperativeHandle(
      ref,
      () => ({
        open: () => setOpenAddConfigModal(true),
        close: () => handleCloseModal(),
        getForm: () => form,
        validate: () => form.validateFields(),
        submit: () => form.submit(),
      }),
      [form],
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
     * // TODO 从 props.operationList 获取对应的 dependencyOptions
     */
    const { loading: loadingDependency } = useRequest(
      () => ApplicationService.getDependencyList({ operationId: operationId! }),
      {
        ready: !!operationId,
        refreshDeps: [operationId],
        onSuccess(res) {
          const dependencyList = res.dependencyList;
          setDependencyOptions(
            dependencyList.map((dependency) => ({
              label: dependency.operationType + '-' + dependency.operationName,
              value: stringifyDependency(dependency),
            })),
          );
        },
      },
    );

    const [dependencyOptions, setDependencyOptions] = useState<SelectProps['options']>();

    const handleOk = () =>
      props.onOk?.(form).then(() => {
        setOpenAddConfigModal(false);
        form.resetFields();
      });

    const handleCloseModal = () => {
      setOpenAddConfigModal(false);
      form.resetFields();
      props.onClose?.();
    };

    return (
      <Modal
        destroyOnClose
        title={props.title}
        open={openAddConfigModal}
        onOk={handleOk}
        onCancel={handleCloseModal}
      >
        <Form<CompareConfigForm<T>>
          form={form}
          requiredMark='optional'
          initialValues={{
            appId: props.appId,
          }}
          style={{ padding: '8px 0' }}
        >
          <Form.Item name='appId' hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name='operationId'
            label={t('components:appSetting.interface')}
            rules={props.rules?.operationId}
          >
            <Select
              allowClear
              optionFilterProp='label'
              placeholder='choose interface'
              popupMatchSelectWidth={false}
              options={interfaceOptions}
            />
          </Form.Item>

          <Form.Item
            name='dependency'
            label={t('components:appSetting.dependency')}
            rules={props.rules?.dependency}
          >
            <Select
              allowClear
              optionFilterProp='label'
              placeholder='choose external dependency'
              popupMatchSelectWidth={false}
              loading={loadingDependency}
              options={dependencyOptions}
            />
          </Form.Item>

          {(() =>
            props.field?.(
              props.appId,
              // @ts-ignore
              form.getFieldValue('operationId'),
              // @ts-ignore
              form.getFieldValue('dependency'),
            ))()}
        </Form>
      </Modal>
    );
  },
);

export default AddConfigModal;
export function stringifyDependency(dependency: DependencyData) {
  return dependency.operationType + Connector + dependency.operationName;
}
export function parseDependency(dependencyString?: string | null) {
  const [operationType, operationName] = dependencyString?.split(Connector) || [];
  return { operationType, operationName };
}
