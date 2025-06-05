import _ from 'lodash';
import { useRequest } from 'ahooks';
import { useMemo, useState } from 'react';

export default () => {
  const [robotId, setRobotId] = useState<string>('');
  const [pageType, setPageType] = useState<string>('');
  const [pageTab, setPageTab] = useState<string>('');
  
  return {
    robotId,
    pageType,
    pageTab,
    setRobotId,
    setPageType,
    setPageTab,
  };
};
