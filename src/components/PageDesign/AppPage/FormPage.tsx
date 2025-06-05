import _ from 'lodash'
import {useModel} from 'umi';
import cls from 'classnames'
import React, {useMemo} from 'react';
import { FormInstance } from 'antd/es/form';

import WidgetsRender from '@/components/PageDesign/components/WidgetsRender';

import { AppPageInfo } from './Types'

import styles from './style.less';

const FormPage: React.FC<AppPageInfo & {widgetType?: string, getFormInstance?: (form: FormInstance) => void}> = ({appInfo = {}, isEmbed, widgetType, getFormInstance}) => {
  const {appState, formatedLayout, updateAppState} = useModel('AppEditor', (model) => ({
    appState: model.appState,
    updateAppState: model.updateAppState,
    formatedLayout: model.formatedLayout
  }));

  const appSettings = useMemo(() => (appInfo.settings || {}), [appInfo.settings])
  const tabPosition = useMemo(() => _.lowerCase(appSettings.naviLocation || 'top'), [appSettings.naviLocation])

  const renderAppWidgets = () => {
    const {widgets, layouts} = formatedLayout
    return (
      <WidgetsRender
        appType="app"
        pageType="preview"
        layouts={layouts}
        widgets={widgets}
        widgetType={widgetType}
        getFormInstance={getFormInstance}
      />
    );
  };

  const renderNavBar = () => {
    return (
      <div className={styles.navs}>
        <div className={styles.appName}>{appInfo && appInfo.name}</div>
        <ul className={cls(styles.navbar, 'custom-scrollbar')}>
          {
            _.map(appState.pages, page => (
              <li key={page.pageKey} className={cls({
                [styles.active]: page.pageKey === appState.currentPageKey
              })} onClick={() => {
                appState.currentPageKey = page.pageKey
                updateAppState()
              }}>
                {page.pageName}
              </li>
            ))
          }
        </ul>
      </div>
    )
  }

  const renderPageContent = () => {
    return (
      <div className={cls(styles.pageContent, styles.formPage, 'custom-scrollbar')}>
        <div className={styles.widgetsWrapper}>
          {renderAppWidgets()}
        </div>
      </div>
    )
  }

  const renderAppPage = () => {
    return (
      <div className={cls(styles.pageWrapper, styles[tabPosition], {
        [styles.hideNav]: (!appSettings.showNavigation || (isEmbed && !appSettings.embedShowNavigation))
      })}>
        {renderNavBar()}
        {renderPageContent()}
      </div>
    );
  };

  return renderAppPage();
};

export default FormPage;
