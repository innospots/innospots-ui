import { useModel } from 'umi';
import { Spin, Empty } from 'antd'
import { useState, useEffect } from 'react';

import AppPage from '@/components/PageDesign/AppPage';

const Page = ({ match: { params } }) => {
  const [isEmbed, setIsEmbed] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const { fetchAppInfo, appInfoRequest, currentAppInfo } = useModel('App', (model) => ({
    fetchAppInfo: model.fetchAppInfo,
    appInfoRequest: model.appInfoRequest,
    currentAppInfo: model.currentAppInfo,
  }));

  useEffect(() => {
    if (params) {
      const appKey = params.appKey || params.pageType

      if (params.appKey && params.pageType) {
        if (params.pageType === 'preview') {
          setIsPreview(true)
        } else {
          setIsEmbed(true)
        }
      }

      if (appKey) {
        fetchAppInfo(appKey);
      }
    }
  }, [params]);

  const renderAppPage = () => {
    if (appInfoRequest.loading) {
      return (
        <div style={{padding: 40}}>
          <Spin />
        </div>
      )
    }

    return (
      currentAppInfo ? (
        <AppPage isEmbed={isEmbed} isPreview={isPreview} appInfo={currentAppInfo} />
      ) : (
        <div style={{paddingTop: '40px', textAlign: 'center'}}>
          <Empty />
        </div>
      )
    )
  }

  return (
    <>
      {/* <PageHelmet title="App Page" /> */}
      {renderAppPage()}
    </>
  )
};

export default Page;
