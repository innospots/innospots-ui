import { DownOutlined } from '@ant-design/icons';
import { Button, Col, Popover, Row } from 'antd';
import clsx from 'classnames';
import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';

import { ModelType } from '@/common/types/Types';

import styles from './style.less';

interface AiModelSelectProps {
  modelType: ModelType;
  value?: string | string[];
  onChange?: (value: string) => void;
}

interface ModelOption {
  id: string;
  name: string;
  children?: ModelOption[];
}

const AiModelSelect: React.FC<AiModelSelectProps> = ({
  modelType,
  value,
  onChange,
}) => {
  const { aiModelList, getAiModelListByType, aiModelListRequest } = useModel(
    'Knowledge',
    (model) => ({
      aiModelList: model.aiModelList,
      aiModelListRequest: model.aiModelListRequest,
      getAiModelListByType: model.getAiModelListByType,
    }),
  );

  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | string[]>(
    value || '',
  );
  const [selectedChildrenModel, setSelectedChildrenModel] = useState<
    string | string[]
  >();

  const modelOptions = useMemo<ModelOption[]>(() => {
    return _.map(getAiModelListByType(modelType), (item) => ({
      id: item.displayName,
      name: item.displayName,
    }));
  }, [modelType]);

  const childrenOptions = useMemo<ModelOption[]>(() => {
    const optionItem = modelOptions.find((item) => item.id === selectedModel);
    return optionItem?.children || [];
  }, [modelOptions, selectedModel]);

  // useEffect(() => {
  //   if (!modelOptions.length) {
  //     aiModelListRequest.run();
  //   }
  // }, [modelOptions]);

  useEffect(() => {
    // if (modelOptions.length && !value) {
    //   const firstModel = modelOptions[0].id;
    //   setSelectedModel(firstModel);
    //   onChange?.(firstModel);
    // }
  }, [modelOptions, value]);

  const changeMainModel = (model: string) => {
    let selectValue = model;
    const optionItem = modelOptions.find((item) => item.id === model);
    setSelectedModel(model);
    if (optionItem?.children?.length) {
      selectValue = optionItem.children[0].id;
      setSelectedChildrenModel(selectValue);
    }
    onChange?.(selectValue);
    setIsOpen(false);
  };

  const renderContent = () => {
    if (!modelOptions.length) {
      return null;
    }

    return (
      <div className={styles.content}>
        <ul className={clsx(styles.modelList, 'custom-scrollbar')}>
          {modelOptions.map((model) => (
            <li
              key={model.id}
              className={clsx(styles.modelItem, {
                [styles.selected]: selectedModel === model.id,
              })}
              onClick={() => changeMainModel(model.id)}
            >
              {/* <ModelIcon model={model.id} /> */}
              <span className={styles.name}>{model.name}</span>
            </li>
          ))}
        </ul>
        {!!childrenOptions?.length && (
          <ul className={clsx(styles.modelList, 'custom-scrollbar')}>
            {childrenOptions.map((model) => (
              <li
                key={model.id}
                className={clsx(styles.modelItem, {
                  [styles.selected]: selectedChildrenModel === model.id,
                })}
                onClick={() => setSelectedChildrenModel(model.id)}
              >
                <span className={styles.name}>{model.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <Popover
      title={null}
      open={isOpen}
      trigger="click"
      placement="bottomLeft"
      content={renderContent()}
      overlayClassName={styles.overlay}
      onOpenChange={setIsOpen}
    >
      <Button block className="nospace-in-button">
        <Row justify="space-between" style={{ width: '100%' }}>
          <Col>
            {value ? (
              <span>{value}</span>
            ) : (
              <span className={styles.placeholder}>请选择</span>
            )}
          </Col>
          <Col>
            <DownOutlined style={{ fontSize: 12, color: '#999' }} />
          </Col>
        </Row>
      </Button>
    </Popover>
  );
};

export default AiModelSelect;
