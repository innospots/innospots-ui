import { lazy } from 'react';
import SuspenseRender from '@/components/SuspenseRender';
import type { IconSelectProps } from './IconSelect';

const IconSelect = lazy(() => import('./IconSelect'));

export default function (props: IconSelectProps) {
  return (
    <SuspenseRender>
      <IconSelect {...props} />
    </SuspenseRender>
  );
}
