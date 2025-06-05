import { FullscreenOutlined } from '@ant-design/icons'
import React, { useMemo, useContext, forwardRef } from 'react';
import { useControllableValue, useReactive } from 'ahooks';

import useI18n from '@/common/hooks/useI18n';
import CodeEditorModal from '../../../CodeEditorModal';
import { WidgetContext } from '../../WidgetProvider';

import styles from './index.less';

const AceCodeEditor = React.lazy(() => import('@/components/AceCodeEditor'))

const SqlEditor:React.FC<any> = forwardRef(({ settings = {}, widgetType, ...props }, ref) => {
  const { t } = useI18n(['workflow', 'common']);

  const readOnly = widgetType === 'view'

  const { size } = useContext(WidgetContext);
  const [codeValue, setCodeValue] = useControllableValue<string>(props);

  const codeModalState = useReactive({
    code: '',
    visible: false,
    codeType: 'sql',
    isViewInfo: false
  })

  const contentHeight = useMemo(() => (size?.height ? size?.height - 40 : '100%'), [ size ])

  const handleSQLContentChange = newValue => {
    setCodeValue(newValue)
  }

  const toggleEditorModal = () => {
    const visible = !codeModalState.visible

    if (visible) {
      codeModalState.code = codeValue
      codeModalState.isViewInfo = readOnly
    }
    codeModalState.visible = visible
  }

  const handleEditorSubmit = (code) => {
    if (code) {
      setCodeValue(code)
    }
    codeModalState.visible = false
  }

  return (
    <>
      <div className={styles.codeContainer} style={{height: contentHeight}}>
        <div className={styles.expandBtn}>
          <span className="cur-btn" onClick={toggleEditorModal}>
            <FullscreenOutlined/> {t('workflow.script.button.expand')}
          </span>
        </div>
        <div className={styles.editor}>
          <AceCodeEditor
            mode="sql"
            name="WidgetSqlEditor"
            value={codeValue}
            placeholder={settings.placeholder}
            onChange={handleSQLContentChange}
          />
        </div>
      </div>
      <CodeEditorModal { ...codeModalState } onSubmit={handleEditorSubmit} onCancel={toggleEditorModal} />
    </>
  );
})

export default SqlEditor
