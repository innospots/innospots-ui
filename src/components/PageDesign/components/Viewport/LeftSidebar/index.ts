import React from 'react'

const App = React.lazy(() => import('./App'))
const Node = React.lazy(() => import('./Node'))
const InputData = React.lazy(() => import('./InputData'))

export {
  App,
  Node,
  InputData
}
