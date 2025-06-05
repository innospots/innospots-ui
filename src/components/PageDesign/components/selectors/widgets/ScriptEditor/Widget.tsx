import _ from 'lodash';
import cls from 'classnames';
import { useModel } from 'umi';
import { Row, Col } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';
import { useControllableValue, useReactive, useDeepCompareEffect } from 'ahooks';
import React, { useMemo, useContext, forwardRef, useEffect, useState } from 'react';

import useI18n from '@/common/hooks/useI18n';
import CodeEditorModal from '../../../CodeEditorModal';

import { matchQueryFields } from '../QueryParams';
import { WidgetContext } from '../../WidgetProvider';
import InputFieldCascader from '../InputFieldCascader';
import { CODE_MODES } from './index';

import styles from './index.less';

type MappingField = {
  nodeKey: string;
  name: string;
  code: string;
  valueType: string;
  value: string;
  nodeName: string;
};
type CodeValue =
  | {
      script: string;
      params: MappingField[];
    }
  | string;

const AceCodeEditor = React.lazy(() => import('@/components/AceCodeEditor'));

const ScriptEditor: React.FC<any> = forwardRef(({ settings = {}, widgetType, ...props }, ref) => {
  const { t } = useI18n(['workflow', 'common']);
  const { inputData } = useModel('AppData', (model) => ({
    inputData: model.inputData,
  }));

  const readOnly = widgetType === 'view';

  const { size } = useContext(WidgetContext);
  const [codeValue, setCodeValue] = useControllableValue<CodeValue>(props);

  const enableMappingFields = settings.enableMappingFields;

  const script = useMemo(() => {
    if (typeof codeValue === 'string') {
      return codeValue;
    }
    return codeValue?.script || '';
  }, [codeValue]);
  const [mappingFields, setMappingFields] = useState<
    { nodeKey: string; name: string; code: string; valueType: string; value: string }[]
  >([]);

  useDeepCompareEffect(() => {
    if (typeof codeValue === 'string') {
      let params: MappingField[] = [];
      if (!_.isEmpty(inputData)) {
        params = matchMappingFields(codeValue);
        setCodeValue({
          params,
          script: codeValue,
        });
      }
    }
  }, [codeValue, inputData]);

  const codeMode = useMemo(() => CODE_MODES[settings.scriptType] || 'java', [settings.scriptType]);

  const completions = useMemo(() => {
    const prefix = settings.completerPrefix || '$';
    if (settings.enableCompleter) {
      const list: any[] = [];
      _.forEach(inputData, (item) => {
        _.forEach(item.fields, (field) => {
          list.push({
            caption: `${prefix} ${item.nodeName}-${field.value}`,
            value: prefix + '{' + field.value + '} ',
            meta: '', //item.nodeKey,
            score: 1,
          });
        });
      });
      return list;
    }
    return [];
  }, [settings.enableCompleter, inputData, settings.completerPrefix]);

  const codeModalState = useReactive({
    code: '',
    visible: false,
    codeType: '',
    isViewInfo: false,
    editorProps: {},
  });

  const contentHeight = useMemo(() => (size?.height ? size?.height - 40 : '100%'), [size]);
  const editorStyle = useMemo(() => {
    if (enableMappingFields && mappingFields.length > 0) {
      const height = contentHeight === '100%' ? '50%' : `${contentHeight / 2 - 20}px`;
      return { height: `calc(100% - ${height})` };
    }
    return {};
  }, [enableMappingFields, mappingFields, contentHeight]);

  const getFieldItem = (value: string) => {
    let findItem: any = null;
    _.find(inputData, (item) => {
      return _.find(item.fields, (field) => {
        if (field.value === value) {
          findItem = {
            nodeKey: item.nodeKey,
            code: field.value,
            name: field.label,
            valueType: field.type,
            value: field.value,
            nodeName: item.nodeName,
          };
          return true;
        }
        return false;
      });
    });
    return findItem;
  };

  const matchMappingFields = (value: string) => {
    const ass = matchQueryFields(value || '');
    const params: MappingField[] = [];

    _.map(ass, (v: string) => {
      const vm = v.match(/\$\{(\w+)\}/) || [];
      const code = vm.length ? vm[1] : v;
      const item = getFieldItem(code);
      if (item) {
        params.push(item);
      }
    });
    return params;
  };

  const handleContentChange = (newValue: string) => {
    setCodeValue({
      script: newValue,
      params: matchMappingFields(newValue),
    });
  };

  const toggleEditorModal = () => {
    const visible = !codeModalState.visible;

    if (visible) {
      if (typeof codeValue === 'string') {
        codeModalState.code = codeValue;
      } else {
        codeModalState.code = codeValue.script;
      }
      codeModalState.isViewInfo = readOnly;
      codeModalState.editorProps = {
        completer: settings.enableCompleter,
        completions: completions,
        completerPrefix: settings.completerPrefix,
      };
    }
    codeModalState.visible = visible;
    codeModalState.codeType = codeMode;
  };

  const handleEditorSubmit = (code) => {
    setCodeValue(code);
    codeModalState.visible = false;
  };

  const renderMappingFields = () => {
    if (_.isEmpty(mappingFields)) {
      return null;
    }
    return (
      <div className={cls(styles.mappingFields, 'custom-scrollbar')}>
        {_.map(mappingFields, (item, index) => {
          const curField = item || {};
          const fieldValue =
            curField.nodeKey && curField.code
              ? {
                  code: curField.code,
                  nodeKey: curField.nodeKey,
                }
              : null;

          const nodeName = curField?.nodeName;
          return (
            <div className={styles.paramRow} key={[curField.code, index].join('-')}>
              <Row gutter={[20, 0]} wrap={false} align="middle">
                <Col flex="120px">
                  <span className={styles.field}>{curField.name}</span>
                </Col>
                <Col flex="none">
                  <span style={{ color: '#8c8c8c', fontSize: 10 }}>&gt;&gt;</span>
                </Col>
                <Col flex="auto">
                  {readOnly ? (
                    <span>{([nodeName, (curField?.value || curField?.name || '-')].join(' - '))}</span>
                  ) : (
                    <InputFieldCascader
                      value={fieldValue}
                      disabled={readOnly}
                      style={{ width: '100%' }}
                      placeholder={t('workflow.sql.field.column.mapping_var.placeholder')}
                      onChange={(value, lastData) => {
                        const params = [...mappingFields];
                        if (value) {
                          params[index] = {
                            ...curField,
                            code: lastData.code,
                            nodeKey: lastData.nodeKey,
                            nodeName: lastData.nodeName,
                          };
                        } else {
                          params[index] = {
                            ...curField,
                            code: '',
                            nodeKey: '',
                            nodeName: '',
                          };
                        }
                        setCodeValue({
                          ...codeValue,
                          params,
                        });
                      }}
                    />
                  )}
                </Col>
              </Row>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className={styles.codeContainer} style={{ height: contentHeight }}>
        <div className={styles.expandBtn}>
          <span className="cur-btn" onClick={toggleEditorModal}>
            <FullscreenOutlined /> {t('workflow.script.button.expand')}
          </span>
        </div>
        <div className={styles.editor} style={editorStyle}>
          <AceCodeEditor
            mode={codeMode}
            name="WidgetScriptEditor"
            value={script}
            readOnly={readOnly}
            placeholder={settings.placeholder}
            completions={completions}
            completer={settings.enableCompleter}
            completerPrefix={settings.completerPrefix}
            onChange={handleContentChange}
          />
        </div>
        {enableMappingFields && renderMappingFields()}
      </div>
      <CodeEditorModal
        {...codeModalState}
        onSubmit={handleEditorSubmit}
        onCancel={toggleEditorModal}
      />
    </>
  );
});

export default ScriptEditor;
