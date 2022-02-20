import { InputProps } from '@ui-kitten/components';
import moment from 'moment';
import { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { log, OutcomeType } from '../../utils';
import { ButtonGroupPicker, DatePicker, TextField, View } from '../base';

type Props = {
  value: string;
  outcomeType: OutcomeType;
  final: boolean;
  onChangeValue: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  onNext: VoidFunction;
};

const YES = 'Yes';
const NO = 'No';

const PredictionInput = ({
  value,
  onChangeValue,
  final,
  style,
  outcomeType,
  onNext,
}: Props) => {
  const label = final ? 'Outcome' : 'Prediction';

  useEffect(() => {
    const newValue = outcomeType === OutcomeType.YESNO ? YES : '';
    if (newValue !== value) {
      onChangeValue(newValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcomeType]);

  const inputProps: InputProps = {
    label,
    value,
    onChangeText: onChangeValue,
    returnKeyType: 'next',
    onSubmitEditing: onNext,
  };

  const renderNumber = () => (
    <TextField
      {...inputProps}
      keyboardType="numeric"
      // @ts-ignore
      onChangeText={(t) => !isNaN(t) && inputProps.onChangeText(t)}
    />
  );

  const renderDate = () => {
    let date: Date | undefined;
    try {
      date = moment(value).toDate();
      // @ts-ignore
      if (isNaN(date)) {
        date = undefined;
      }
    } catch {
      log('Couldnt parse date: ' + value);
    }

    return (
      <DatePicker
        label={label}
        date={date}
        onSelect={(d) => onChangeValue(moment(d).toISOString())}
      />
    );
  };

  const renderYesNo = () => (
    <ButtonGroupPicker
      label={label}
      onValueChange={onChangeValue}
      options={[
        { label: 'Yes', value: YES },
        { label: 'No', value: NO },
      ]}
      selectedValue={value}
    />
  );

  const renderAny = () => <TextField {...inputProps} />;

  const renderInput: () => JSX.Element =
    {
      [OutcomeType.NONE]: renderAny,
      [OutcomeType.NUMERIC]: renderNumber,
      [OutcomeType.DATE]: renderDate,
      [OutcomeType.YESNO]: renderYesNo,
    }[outcomeType] || renderAny;

  if (!Object.values(OutcomeType).includes(outcomeType)) {
    log('Got invalid outcome type: ' + outcomeType);
  }

  return <View style={style}>{renderInput()}</View>;
};

export default PredictionInput;
