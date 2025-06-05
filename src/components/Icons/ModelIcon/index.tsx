import React, { useMemo } from 'react';
import { Avatar } from 'antd';

import { ICONS } from '@/common/constants/icons';

const ModelIcon: React.FC<{
  size?: number;
  model: string;
}> = ({ size = 24, model }) => {

  const icon = useMemo(() => {
    if (model) {
      let Icon = ICONS[`model/${model}`];
      if (!Icon) {
        Icon = ICONS[`model/${model.split('/')[0].toLowerCase()}`];
      }
      return Icon;
    }
    return null;
  }, [ model ]);

  return <Avatar src={icon} style={{ width: size, height: size, backgroundColor: 'transparent' }} />;
};

export default ModelIcon;
