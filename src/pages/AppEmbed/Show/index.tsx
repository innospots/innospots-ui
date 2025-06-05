import { useModel, useParams } from 'umi';
import { Empty } from 'antd'
import { useEffect } from 'react';

import AppPage from '@/components/PageDesign/AppPage';
import PageLoading from '@/components/PageLoading';

import styles from './style.less';

const AppEmbedShow = () => {
  const { appKey } = useParams();
  const { fetchAppInfo, appInfoRequest, currentAppInfo } = useModel('App', (model) => ({
    fetchAppInfo: model.fetchAppInfo,
    appInfoRequest: model.appInfoRequest,
    currentAppInfo: model.currentAppInfo,
  }));

  useEffect(() => {
    if (appKey) {
      fetchAppInfo(appKey);
    }
  }, [appKey]);

  const renderAppPage = () => {
    if (appInfoRequest.loading) {
      return (
        <PageLoading />
      )
    }

    return (
      currentAppInfo ? (
        <AppPage isPreview appInfo={currentAppInfo} />
      ) : (
        <div style={{paddingTop: '40px', textAlign: 'center'}}>
          <Empty />
        </div>
      )
    )
  }

  return (
    <div className={styles.embedPage}>
      {/* <PageHelmet title="App Page" /> */}
      {renderAppPage()}
    </div>
  )
};

export default AppEmbedShow;
