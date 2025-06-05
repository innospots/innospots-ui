import {useModel} from 'umi';
import React, {useMemo, useEffect, Suspense} from 'react';

import PageHelmet from '@/components/PageHelmet';

import { AppPageInfo } from './Types'

const FormPage = React.lazy(() => import('./FormPage'))
const ChatPage = React.lazy(() => import('./ChatPage'))
const DataPage = React.lazy(() => import('./DataPage'))
const ApprovalPage = React.lazy(() => import('./ApprovalPage'))

const AppPage: React.FC<AppPageInfo & { pageType?: string }> = ({appInfo = {}, ...rest}) => {
  const {resources = {}, appType} = appInfo;
  const {appState, updateAppState, initAppResources} = useModel('AppEditor', (model) => ({
    appState: model.appState,
    updateAppState: model.updateAppState,
    initAppResources: model.initAppResources
  }));

  const appSettings = useMemo(() => (appInfo.settings || {}), [appInfo.settings])

  useEffect(() => {
    initAppResources(resources)
  }, [resources])

  useEffect(() => {
    if (appState.pages?.length && (!appSettings.showNavigation || !appState.currentPageKey)) {
      appState.currentPageKey = appState.pages[0].pageKey
      updateAppState()
    }
  }, [appSettings.showNavigation, appState.currentPageKey])

  const renderAppPage = () => {
    let PageComp = FormPage
    if (appType === 'CHAT') {
      PageComp = ChatPage
    } else if (appType === 'APP_PAGE') {
      PageComp = DataPage
    } else if (appType === 'APPROVAL') {
      PageComp = ApprovalPage
    }
    return (
      <Suspense fallback={(<span />)}>
        <PageComp appInfo={appInfo} { ...rest } />
      </Suspense>
    )
  };

  return (
    <>
      { renderAppPage() }
      <PageHelmet title="App Page" />
    </>
  )
};

export default AppPage;
