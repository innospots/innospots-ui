import React, { useMemo, useEffect } from 'react';
import { useModel, useSearchParams } from 'umi';
import { Spin } from 'antd';

import PageHelmet from '@/components/PageHelmet';
import RootConfigProvider from '@/components/RootConfigProvider';

const Callback:React.FC = () => {

  const [searchParams] = useSearchParams();
  // @ts-ignore
  const queryData = useMemo(() => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);

  const { oauthLoginRequest } = useModel('Account', (model) => ({
    oauthLoginRequest: model.oauthLoginRequest,
  }));

  useEffect(() => {
    console.log("queryData.code----",queryData.code);
    if (queryData.code) {
      oauthLoginRequest({
        loginType: queryData.state,
        securityCode: queryData.code,
      });
    }
  }, [ queryData ])

  return (
    <RootConfigProvider>
      <PageHelmet title="授权登录" />
      <div style={{ padding: 20 }}>
        <Spin />
      </div>
    </RootConfigProvider>
  )
}

export default Callback
