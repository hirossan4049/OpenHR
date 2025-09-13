"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";

type DatePickerProps = {
  date?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function DatePicker({ date, onChange, placeholder = "Pick a date", disabled }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const label = date
    ? new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(date)
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start text-left font-normal"
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onChange(d);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;

