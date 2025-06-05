import _ from 'lodash';

export const isPercentage = (val: string) => typeof val === 'string' && val.indexOf('%') > -1;

export const percentToPx = (value: any, comparativeValue: number) => {
  if (value.indexOf('px') > -1 || value === 'auto' || !comparativeValue) return value;
  const percent = parseInt(value);
  return (percent / 100) * comparativeValue + 'px';
};
export const pxToPercent = (value: any, comparativeValue: number) => {
  const val = (Math.abs(value) / comparativeValue) * 100;
  if (value < 0) return -1 * val;
  else return Math.round(val);
};
export const getElementDimensions = (element: HTMLElement) => {
  const computedStyle = getComputedStyle(element);

  let height = element.clientHeight,
    width = element.clientWidth; // width with padding

  height -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
  width -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);

  return {
    width,
    height,
  };
};

export const getElementProps = (elProps: any, args?: any) => {
  if (_.isFunction(elProps)) {
    return elProps(args);
  }

  return elProps;
};

export const getFormatOptions = (options, fieldNames = { value: 'value', label: 'label' }) => {
  const ops: any[] = [];
  _.each(options, (item) => {
    if (item) {
      const value = item[fieldNames.value || 'value']
      const label = item[fieldNames.label || 'label']
      if (value || label) {
        ops.push({
          value: value || label,
          label: label || value,
        });
      }
    }
  });
  return ops;
};

export const getInputFields = (outputFields: any[]): {
  files: any[]
  fields: any[]
} => {
  let fields: any[] = [], files: any[] = [];
  if (outputFields) {
    _.each(outputFields, (item) => {
      const fds: any[] = []
      _.each(item.fields, (field) => {
        if (field.type === 'FILE') {
          files.push({
            value: field.value,
            label: field.label,
            children: field.subFields,
          });
        } else {
          fds.push(field)
        }
      });

      if (fds.length) {
        fields.push({
          ...item,
          fields: fds,
        });
      }
    });
  }

  return {
    files,
    fields
  }
}
