import { useSafeState, useDeepCompareEffect } from 'ahooks';
import i18n, { getI18nByModule } from '@/common/utils/i18n';

export default (module: string | string[]) => {
  const [loading, setLoading] = useSafeState<boolean>(true);

  useDeepCompareEffect(() => {
    getI18nByModule(module)
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, [module]);

  const render = (s: string, options?: any) => {
    return i18n.t(s, options) as string;
  };

  return { i18n, t: render, loading };
};
