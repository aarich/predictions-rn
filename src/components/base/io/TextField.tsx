import { Input, InputProps, Text } from '@ui-kitten/components';
import { forwardRef } from 'react';

type Props = {
  title?: string;
  error?: string;
} & InputProps;

export default forwardRef<Input, Props>(({ title, error, ...props }, ref) => {
  const label = title || props.label;
  return (
    <>
      <Input {...props} label={label} ref={ref} />
      {error ? <Text status="danger">{error}</Text> : null}
    </>
  );
});
