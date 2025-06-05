import _ from 'lodash';
import cls from 'classnames'
import React, { useMemo, useContext, forwardRef } from 'react';
import { useControllableValue } from 'ahooks';

const AceCodeEditor = React.lazy(() => import('@/components/AceCodeEditor'))

import type { WidgetItemType } from '@/models/AppEditor'
import { WidgetContext } from '../../WidgetProvider';

import styles from './index.less';

const JsonEditor:React.FC<WidgetItemType> = forwardRef(({ settings = {}, widgetType, ...rest }, ref) => {
  const { size } = useContext(WidgetContext);
  const readOnly = widgetType === 'view'
  const curProps = useMemo(() => {
    const props = { ...rest };
    if (props.value === undefined) {
      props.value = settings.initialValue || '{}'
    }
    return props
  }, [rest, settings.initialValue]);
  const [jsonValue, setJsonValue] = useControllableValue(curProps);

  const contentHeight = useMemo(() => (size?.height ? size?.height - 40 : '100%'), [ size ])

  return (
    <div className={cls(styles.node, styles.input, 'editor-node-widget')}>
      <div className={styles.inner}>
        <div className={styles.formItem} style={{height: contentHeight}}>
          <AceCodeEditor
            mode="json"
            name="WidgetJsonEditor"
            value={jsonValue}
            readOnly={readOnly}
            onChange={setJsonValue}
            placeholder={settings.placeholder}
          />
        </div>
      </div>
    </div>
  )
})

export default JsonEditor
