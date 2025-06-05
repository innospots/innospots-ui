import React, {useEffect, useRef} from 'react'
import cls from 'classnames'
import { useModel } from 'umi'

import useI18n from '@/common/hooks/useI18n';

import { DEFAULT_JS_CODE } from '../../constants'

import VariableList from './VariableList'

import styles from '../../style.less'

const AceCodeEditor = React.lazy(() => import('@/components/AceCodeEditor'))

const JavascriptPanel:React.FC = () => {
  const { t } = useI18n(['common']);
  const { setEditorIns } = useModel('Action', model => ({
    setEditorIns: model.setEditorIns
  }))

  const editor = useRef(null);

  const handleCodeChange = (event) => {
    // console.info(event)
  }

  const handleEditorKeyup = () => {
    // editor.current?.showHint?.();
  }

  const handleSelectVariable = (value: string) => {
    // editor.current.doc.replaceSelection(value)
  }

  const renderVariableList = () => {
    return (
      <VariableList onSelectVariable={handleSelectVariable} />
    )
  }

  const createCodeEditor = (value?: string) => {
    setEditorIns(editor.current)
  };

  const renderCodeEditor = () => {
    return (
      <div className={styles.codeEditor}>
        <AceCodeEditor
          mode="javascript"
          name="JSPanelEditor"
          defaultValue={DEFAULT_JS_CODE}
          placeholder={t('common.input.placeholder')}
          onChange={handleCodeChange}
        />
      </div>
    )
  }

  return (
    <div className={cls(styles.panels, styles.javascriptPanel)}>
      { renderVariableList() }
      { renderCodeEditor() }
    </div>
  )
}

export default JavascriptPanel