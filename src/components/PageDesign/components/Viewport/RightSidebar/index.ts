import React from 'react'

const App = React.lazy(() => import('./App'))
const Node = React.lazy(() => import('./Node'))

export {
  App,
  Node
}
