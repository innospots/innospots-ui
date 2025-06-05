// 运行时配置

import { IS_DEV } from '@/common/constants';
import getQiankunMasterState from '@/common/utils/QiankunMasterState';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{ name: string }> {
  return { name: '@umijs/max' };
}

export const qiankun = new Promise((resolve) => {
  resolve(1);
}).then((props) => {
  return {
    sandbox: false,
    apps: [
      {
        name: 'workflow', // 唯一 id
        entry: IS_DEV ? 'http://localhost:8882' : '/apps/workflow', // html entry
        props: {
          ...getQiankunMasterState(),
        },
      },
      {
        name: 'visualization', // 唯一 id
        entry: IS_DEV ? 'http://localhost:8881' : '/apps/visualization', // html entry
        props: {
          ...getQiankunMasterState(),
        },
      },
    ],
    routes: [
      {
        path: '/apps/workflow',
        microApp: 'workflow',
        microAppProps: {
          autoSetLoading: true,
          wrapperClassName: 'app-wrapper',
        }
      },
      {
        path: '/apps/visualization',
        microApp: 'visualization',
        microAppProps: {
          autoSetLoading: true,
          wrapperClassName: 'app-wrapper',
        }
      },
    ],
    externals: {
      react: 'var window.React',
      'react-dom': 'var window.ReactDOM',
    },
  };
});
