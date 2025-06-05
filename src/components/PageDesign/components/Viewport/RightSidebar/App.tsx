import React, { useMemo } from 'react';

import cls from 'classnames'
import { useModel } from 'umi'
import {DoubleRightOutlined, DoubleLeftOutlined} from '@ant-design/icons';

import useI18n from '@/common/hooks/useI18n';

import { PageSetting, AppDataSetting, ApproveDataSetting } from '../Settings'
import { WIDGET_SETTINGS } from '../../selectors'

import CustomSuspense from '../../CustomSuspense'

import styles from './style.less'

const RightSidebar = () => {
  const {
    commonState,
    selectedWidget
  } = useModel('AppEditor', model => ({
    commonState: model.commonState,
    selectedWidget: model.selectedWidget
  }))

  const { t } = useI18n(['app'])

  const { currentAppType } = useModel('App', (model) => ({
    currentAppType: model.currentAppType,
  }));

  const WidgetSettings = useMemo(() => {
    if (selectedWidget) {
      return WIDGET_SETTINGS[selectedWidget.type]
    } else {
      return null
    }
  }, [ selectedWidget ])

  const isActive = useMemo(() => !!WidgetSettings, [ WidgetSettings ])

  const toggleRightSidebar = () => {
    commonState.rightSidebarCollapsed = !commonState.rightSidebarCollapsed
  }

  const renderSettings = () => {
    let title = t('app.page.setting.title')
    let Setting = PageSetting

    if (isActive) {
      title = t('app.widget.setting.title')
    }

    if (currentAppType === 'CHAT') {
      title = t('app.data.setting.title')
      Setting = AppDataSetting
    } else if (currentAppType === 'APPROVAL') {
      title = t('app.data.setting.title')
      Setting = ApproveDataSetting
    }

    return (
      <div className="right-sidebar-inner">
        <div className="editor-top-bar">
          <p className="top-bar-title">
            { title }
          </p>
          <span className="g-button" onClick={toggleRightSidebar}><DoubleRightOutlined /></span>
        </div>

        <div className={cls(styles.settingContainer, 'custom-scrollbar')}>
          {WidgetSettings ? <CustomSuspense><WidgetSettings /></CustomSuspense> : <Setting />}
        </div>
      </div>
    )
  }

  return (
    <div id="WidgetSettingContainer" className={styles.wrapper}>
      { renderSettings() }
      <div className="right-sidebar-collapsed" onClick={toggleRightSidebar}>
        <DoubleLeftOutlined style={{fontSize: 16, color: '#666'}} />
      </div>
    </div>
  )
}

export default RightSidebar