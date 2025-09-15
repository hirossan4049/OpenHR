"use client";

import * as React from "react";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import "react-day-picker/dist/style.css";

export type CalendarProps = DayPickerProps;

export function Calendar(props: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays
      {...props}
    />
  );
}

export default Calendar;
