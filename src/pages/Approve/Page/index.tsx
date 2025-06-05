import { useModel, history, useParams, useSearchParams } from 'umi'
import { useState, useEffect, useMemo } from 'react';
import { Spin, Empty, Result, Button } from 'antd'

import * as Service from '@/services/App';
import useI18n from '@/common/hooks/useI18n';

import AppPage from '@/components/PageDesign/AppPage';

import { getBackPageUrl } from '../utils';

const ApprovePage = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();

  const { t } = useI18n('approve');

  const [loading, setLoading] = useState(false);
  const [appInfo, setAppInfo] = useState<any | null>(null);

  const query = useMemo(() => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);

  const { setCurrentAppInfo } = useModel('App', (model) => ({
    setCurrentAppInfo: model.setCurrentAppInfo
  }));

  const [permission, setPermission] = useState<any | null>(null);

  const checkPermission = async (aik: string, appKey: string) => {
    try {
      setLoading(true);
      const ps: any = {}

      if (params.pageType === 'list-detail') {
        ps.from = 'approve-list'
      }
      
      const result = await Service.checkPermission(aik, ps);
      setPermission(result);
      if (result !== 'NONE') {
        fetchAppInfo(appKey, result);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  const fetchAppInfo = async (appKey: string, per: any) => {
    setLoading(true);
    try {
      const result = await Service.fetchAppInfo<any>(appKey);
      const info = {
        ...result,
        permission: per,
      }
      setAppInfo(info);
      setCurrentAppInfo(info);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (params.pageType === 'create') {
      fetchAppInfo(params.appKey, 'PASS');
    } else if (query.aik && params.appKey) {
      const aik = query.aik
      checkPermission(aik, params.appKey);
    }
  }, [query.aik, params.appKey]);

  const pageBack = () => {
    const backUrl = getBackPageUrl(params.pageType);
    if (backUrl) {
      history.replace(backUrl);
    } else {
      history.back();
    }
  }

  const renderAppPage = () => {
    if (loading) {
      return (
        <div style={{padding: 40}}>
          <Spin />
        </div>
      )
    }

    if (permission === 'NONE') {
      return (
        <div style={{padding: 40}}>
          <Result
            status="403"
            title={t('approve.audit.page.no_permission.title')}
            subTitle={t('approve.audit.page.no_permission.sub_title')}
            extra={<Button type="primary" onClick={pageBack}>{t('common.button.back')}</Button>}
          />
        </div>
      )
    }

    return (
      appInfo ? (
        <AppPage appInfo={appInfo} pageType={params.pageType} />
      ) : (
        <div style={{paddingTop: '40px', textAlign: 'center'}}>
          <Empty />
        </div>
      )
    )
  }

  return renderAppPage()
};

export default ApprovePage;