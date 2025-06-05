import React, { Suspense } from 'react';

const SuspenseRender = ({
  fallback,
  children,
}: {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return <Suspense fallback={fallback || <span />}>{children}</Suspense>;
};

export default SuspenseRender;
