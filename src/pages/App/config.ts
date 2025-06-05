export const LAYOUT_PROPS = {
  rowHeight: 40,
  // compactType: null,
  compactType: 'vertical',

  margin: [8, 8],
  containerPadding: [20, 20]
};

export const APP_LAYOUT_PROPS = {
  ...LAYOUT_PROPS,
  resizeHandles: ['s', 'w', 'e', 'n'],
  cols: { lg: 12, md: 10, sm: 8, xs: 4, xxs: 2 },
  // breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
}

export const NODE_LAYOUT_PROPS = {
  ...LAYOUT_PROPS,
  cols: 1,
  resizeHandles: ['s', 'n'],
}
