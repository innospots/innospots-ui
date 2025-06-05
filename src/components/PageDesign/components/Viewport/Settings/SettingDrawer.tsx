import React from 'react';
import { Drawer, DrawerProps } from 'antd';

export type SettingDrawerProps = DrawerProps;

export const SettingDrawer: React.FC<SettingDrawerProps> = ({ children, ...props }) => {
  return (
    (<Drawer
      width={318}
      mask={false}
      bodyStyle={{padding: '24px 0 0'}}
      rootClassName="widget-setting-drawer"
      getContainer={() => document.getElementById('WidgetSettingContainer')}
      {...props}
    >
      {children}
    </Drawer>)
  );
};
