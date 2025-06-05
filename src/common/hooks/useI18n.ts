import { useEffect } from 'react';
import { useSafeState, useDeepCompareEffect } from 'ahooks';
import i18n, { getI18nByModule } from '@/common/utils/i18n';

const moduleLoadingMap = new Map<string, boolean>();

const getModuleKey = (module: string | string[]) => {
  if (Array.isArray(module)) {
    return module.join(',');
  }
  return module;
};

export default (module: string | string[]) => {
  const [loading, setLoading] = useSafeState<boolean>(true);

  const updateModuleLoading = (module: string | string[], loading: boolean) => {
    setLoading(loading);
    moduleLoadingMap.set(getModuleKey(module), loading);
  };

  useEffect(() => {
    const isLoading = moduleLoadingMap.get(getModuleKey(module)) ?? true;
    setLoading(isLoading);
  }, [module]);

  useDeepCompareEffect(() => {
    getI18nByModule(module)
      .finally(() => updateModuleLoading(module, false))
  }, [module]);

  const render = (s: string, options?: any) => {
    return i18n.t(s, options) as string;
  };

  return { i18n, t: render, loading };
};
