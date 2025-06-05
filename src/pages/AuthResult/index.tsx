import React, { useMemo, useEffect } from 'react';
import { useSearchParams } from 'umi';
import { Button, Result } from 'antd';

import PageHelmet from '@/components/PageHelmet';

const AuthResult:React.FC = () => {

  const [searchParams] = useSearchParams();
  // @ts-ignore
  const result = searchParams.get('success') === 'true';

  useEffect(() => {
    try {
      // @ts-ignore
      window.opener.__authCallback(result)
    } catch (e) {}
  }, [ result ])

  const resultInfo = useMemo<{
    title: string
    status: 'success' | 'error'
    subTitle: string
  }>(() => {
    return result ? {
      title: '授权成功',
      status: 'success',
      subTitle: '您可以关闭当前窗口，再次点击测试按钮继续流程',
    } : {
      title: '授权失败',
      status: 'error',
      subTitle: '请检查您的账号密码再次尝试',
    }
  }, [ result ]);

  return (
    <div>
      <PageHelmet title="授权结果" />
      <Result
        title={resultInfo.title}
        status={resultInfo.status}
        subTitle={resultInfo.subTitle}
        extra={[
          <Button size="small" key="close" onClick={window.close}>关闭窗口</Button>,
        ]}
      />
    </div>
  )
}

export default AuthResult