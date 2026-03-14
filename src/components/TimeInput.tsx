import { useTimePicker, type TimePickerOptions } from '../hooks';

export interface TimeInputProps extends TimePickerOptions {
  className?: string;
}

export function TimeInput({ className = '', ...options }: TimeInputProps) {
  const {
    activeTime,
    format12,
    getHourProps,
    getMinuteProps,
    getPeriodProps,
    periodDisplay,
  } = useTimePicker(options);

  return (
    <div
      className={`dp-time-input ${className}`}
      role="group"
      aria-label="Time entry"
    >
      <div
        {...getHourProps()}
        className="dp-time-input-segment"
      >
        {String(getHourProps()['aria-valuenow']).padStart(2, '0')}
      </div>

      <span className="dp-time-input-sep">:</span>

      <div
        {...getMinuteProps()}
        className="dp-time-input-segment"
      >
         {String(getMinuteProps()['aria-valuenow']).padStart(2, '0')}
      </div>

      {format12 && (
        <>
          <span className="dp-time-input-divider" />
          <div
            {...getPeriodProps()}
            className="dp-time-input-period"
          >
             {periodDisplay}
          </div>
        </>
      )}

      {/* Hidden inputs to capture values in native forms */}
      {options.id && (
        <input
          type="hidden"
          name={options.id}
          value={activeTime.toTimeString().split(' ')[0]}
        />
      )}
    </div>
  );
}
