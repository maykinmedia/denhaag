import React, { InputHTMLAttributes, KeyboardEvent, RefObject } from 'react';
import clsx from 'clsx';
import {
  format,
  Locale,
  getWeeksInMonth,
  formatISO,
  setDay,
  addWeeks,
  subMonths,
  addMonths,
  isSameMonth,
  setDate,
  isEqual,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  subYears,
  addYears,
  subWeeks,
  getWeekOfMonth,
  getDay,
  getDate,
  setMonth,
  getMonth,
  setYear,
  getYear,
} from 'date-fns';
import { nl } from './locale';

import { CalendarIcon, AlertTriangleIcon, ChevronRightIcon, ChevronLeftIcon } from '@gemeente-denhaag/icons';

import './datepicker.css';

export interface DatepickerProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * The ref for the outer HTML div.
   */
  ref?: RefObject<HTMLDivElement>;
  /**
   * The ref for the actual input HTML element.
   */
  inputRef?: RefObject<HTMLInputElement>;
  /**
   * Whether the input field is in a error state.
   */
  error?: boolean;
  /**
   * Locale (from @gemeente-denhaag/datepicker/locale or date-fns/locale) (default: nl)
   */
  locale?: Locale;
  /**
   * Starting date for calendar (default: today)
   */
  startDate?: Date;
  /**
   * aria-label for the button to open the calendar.
   */
  openCalendarLabel?: string;
  /**
   * aria-label for previous month button in the calendar.
   */
  previousMonthLabel?: string;
  /**
   * aria-label for previous month button in the calendar.
   */
  nextMonthLabel?: string;
}

interface DatepickerState {
  current: Date;
  selected?: Date;
  opened: boolean;
}

/**
 * The DatePicker component allows the user to select a date.
 */
export const Datepicker: React.FC<DatepickerProps> = ({
  ref = React.useRef<HTMLDivElement>(null),
  inputRef = React.useRef<HTMLInputElement>(null),
  startDate = new Date(),
  locale = nl,
  openCalendarLabel = 'Kies een datum',
  previousMonthLabel = 'Vorige maand',
  nextMonthLabel = 'Volgende maand',
  ...props
}: DatepickerProps) => {
  const rootStyles = clsx(
    'denhaag-datepicker',
    {
      'denhaag-datepicker--error': props.error,
      'denhaag-datepicker--disabled': props.disabled,
    },
    props.className,
  );

  const [state, setState] = React.useState<DatepickerState>({
    current: startDate,
    selected: undefined,
    opened: false,
  });

  const currentDate = new Date();
  const today = setYear(
    setMonth(setDate(state.current, getDate(currentDate)), getMonth(currentDate)),
    getYear(currentDate),
  );

  const openButtonRef = React.useRef<HTMLButtonElement>(null);
  const backButtonRef = React.useRef<HTMLButtonElement>(null);
  const currentButtonRef = React.useRef<HTMLButtonElement>(null);

  const outsideClickListener = (e: Event) => {
    if (!ref?.current?.contains(e.target as Node) && state.opened) {
      setState({
        ...state,
        opened: false,
      });
    }
  };

  const outsideClickListenerCleanup = () => {
    document.removeEventListener('click', outsideClickListener);
  };

  React.useEffect(() => {
    if (state.opened) {
      document.addEventListener('click', outsideClickListener);
      return outsideClickListenerCleanup;
    }
    return null;
  }, [ref, state.opened]);

  React.useEffect(() => {
    if (state.opened) {
      currentButtonRef.current?.focus();
    }
  }, [state.opened && state.current]);

  const onKeyDownInput = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setState({ ...state, opened: true });
    }
  };

  const onKeyDownBack = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        openButtonRef.current?.focus();
        setState({ ...state, opened: false });
        break;
      case 'Tab':
        if (e.shiftKey) {
          e.preventDefault();
          currentButtonRef.current?.focus();
          break;
        }
    }
  };

  const onKeyDownNext = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      openButtonRef.current?.focus();
      setState({ ...state, opened: false });
    }
  };

  const onKeyDownDay = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        setState({ ...state, current: subDays(state.current, 1) });
        break;
      case 'ArrowRight':
        setState({ ...state, current: addDays(state.current, 1) });
        break;
      case 'ArrowUp':
        setState({ ...state, current: subDays(state.current, 7) });
        break;
      case 'ArrowDown':
        setState({ ...state, current: addDays(state.current, 7) });
        break;
      case 'Home':
        e.preventDefault();
        setState({ ...state, current: startOfWeek(state.current, { locale: locale }) });
        break;
      case 'End':
        e.preventDefault();
        setState({ ...state, current: endOfWeek(state.current, { locale: locale }) });
        break;
      case 'PageUp':
        e.preventDefault();

        if (e.shiftKey) {
          let newDate = setDay(
            addWeeks(setDate(subYears(state.current, 1), 1), getWeekOfMonth(state.current, { locale: locale }) - 1),
            getDay(state.current),
            { locale: locale },
          );
          if (!isSameMonth(newDate, subYears(state.current, 1))) {
            newDate = subWeeks(newDate, 1);
          }
          setState({ ...state, current: newDate });
        } else {
          let newDate = setDay(
            addWeeks(setDate(subMonths(state.current, 1), 1), getWeekOfMonth(state.current, { locale: locale }) - 1),
            getDay(state.current),
            { locale: locale },
          );
          if (!isSameMonth(newDate, subMonths(state.current, 1))) {
            newDate = subWeeks(newDate, 1);
          }
          setState({ ...state, current: newDate });
        }
        break;
      case 'PageDown':
        e.preventDefault();
        if (e.shiftKey) {
          let newDate = setDay(
            addWeeks(setDate(addYears(state.current, 1), 1), getWeekOfMonth(state.current, { locale: locale }) - 1),
            getDay(state.current),
            { locale: locale },
          );
          if (!isSameMonth(newDate, addYears(state.current, 1))) {
            newDate = subWeeks(newDate, 1);
          }
          setState({ ...state, current: newDate });
        } else {
          let newDate = setDay(
            addWeeks(setDate(addMonths(state.current, 1), 1), getWeekOfMonth(state.current, { locale: locale }) - 1),
            getDay(state.current),
            { locale: locale },
          );
          if (!isSameMonth(newDate, addMonths(state.current, 1))) {
            newDate = subWeeks(newDate, 1);
          }
          setState({ ...state, current: newDate });
        }
        break;
      case 'Escape':
        setState({ ...state, opened: false });
        break;
      case 'Tab':
        if (!e.shiftKey) {
          e.preventDefault();
          backButtonRef.current?.focus();
          break;
        }
    }
  };

  const renderDay = (i: number, j: number) => {
    const date = setDay(addWeeks(setDate(state.current, 1), i), (j + (locale.options?.weekStartsOn || 0)) % 7, {
      locale: locale,
    });
    if (isSameMonth(date, state.current)) {
      return (
        // eslint-disable-next-line jsx-a11y/role-supports-aria-props
        <button
          type="button"
          className={clsx('denhaag-datepicker__calendar-day', {
            'denhaag-datepicker__calendar-day--current': isEqual(today, date),
            'denhaag-datepicker__calendar-day--selected': state.selected && isEqual(state.selected, date),
          })}
          tabIndex={isEqual(state.current, date) ? 0 : -1}
          ref={isEqual(state.current, date) ? currentButtonRef : null}
          onClick={() => {
            setState({ ...state, selected: date, opened: false });
          }}
          onKeyDown={onKeyDownDay}
          aria-selected={state.selected && isEqual(state.selected, date) ? 'true' : undefined}
        >
          {date.getDate()}
        </button>
      );
    }
    return '';
  };

  return (
    <div className={rootStyles} ref={ref}>
      <button
        type="button"
        className="denhaag-datepicker__button"
        aria-label={openCalendarLabel}
        onClick={() => {
          setState({ ...state, opened: !state.opened });
        }}
        tabIndex={props.disabled ? -1 : 0}
        ref={openButtonRef}
      >
        <CalendarIcon />
      </button>
      <input
        disabled={props.disabled}
        type="date"
        className={clsx('denhaag-datepicker__input', {
          'denhaag-datepicker__input--has-value': state.selected,
        })}
        ref={inputRef}
        value={state.selected ? formatISO(state.selected, { representation: 'date' }) : ''}
        onChange={(event) => {
          setState({
            ...state,
            current:
              event.target.value && new Date(event.target.value).getDate()
                ? new Date(event.target.value)
                : state.current,
            selected:
              event.target.value !== undefined
                ? new Date(event.target.value).getDate()
                  ? new Date(event.target.value)
                  : state.selected
                : undefined,
          });
        }}
        onClick={(event) => {
          event.preventDefault();
          setState({ ...state, opened: true });
        }}
        onKeyDown={onKeyDownInput}
        tabIndex={props.disabled ? -1 : 0}
      />
      {props.error && <AlertTriangleIcon className="denhaag-datepicker__error-icon" />}
      <div
        className={clsx('denhaag-datepicker__calendar', { 'denhaag-datepicker__calendar--hidden': !state.opened })}
        role="dialog"
        aria-modal="true"
        aria-labelledby="denhaag-datepicker-calendar-month"
        aria-live="polite"
      >
        <div className="denhaag-datepicker__calendar-header">
          <button
            type="button"
            className="denhaag-datepicker__calendar-navigation"
            onClick={() => {
              setState({ ...state, current: subMonths(state.current, 1) });
            }}
            ref={backButtonRef}
            onKeyDown={onKeyDownBack}
            aria-label={previousMonthLabel}
          >
            <ChevronLeftIcon />
          </button>
          <span
            id="denhaag-datepicker-calendar-month"
            className="denhaag-datepicker__calendar-month"
            aria-live="polite"
          >
            <time dateTime={format(state.current, 'yyyy-MM')}>
              {format(state.current, 'MMMM yyyy', { locale: locale })}
            </time>
          </span>
          <button
            type="button"
            className="denhaag-datepicker__calendar-navigation"
            onClick={() => {
              setState({ ...state, current: addMonths(state.current, 1) });
            }}
            onKeyDown={onKeyDownNext}
            aria-label={nextMonthLabel}
          >
            <ChevronRightIcon />
          </button>
        </div>
        <table
          className="denhaag-datepicker__calendar-table"
          role="grid"
          aria-labelledby="denhaag-datepicker-calendar-month"
        >
          <tbody>
            <tr>
              {Array.from(Array(7)).map((_, i) => (
                <th
                  key={`datepicker-day-${i}`}
                  className="denhaag-datepicker__calendar-heading"
                  abbr={locale.localize?.day((i + (locale.options?.weekStartsOn || 0)) % 7)}
                  scope="col"
                >
                  {locale.localize?.day((i + (locale.options?.weekStartsOn || 0)) % 7, { width: 'short' })}
                </th>
              ))}
            </tr>
            {Array.from(Array(getWeeksInMonth(state.current, { locale: locale }))).map((_, i) => (
              <tr key={`datepicker-row-${i}`}>
                {Array.from(Array(7)).map((_, j) => (
                  <td key={`datepicker-column-${i}-${j}`}>{renderDay(i, j)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Datepicker;