'use client'

import * as React from 'react'
import { format, parse, isValid } from 'date-fns'
import { vi } from 'react-day-picker/locale'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerProps {
  value: string                    // yyyy-MM-dd string (form field format)
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Chọn ngày...',
  disabled,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const valid = selectedDate ? isValid(selectedDate) : false

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'))
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-12 w-full justify-start text-left font-normal',
            !valid && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
          {valid
            ? format(selectedDate!, 'dd/MM/yyyy')
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={valid ? selectedDate : undefined}
          onSelect={handleSelect}
          locale={vi}
          captionLayout="dropdown"
          startMonth={new Date(new Date().getFullYear() - 10, 0)}
          endMonth={new Date()}
          disabled={(date) => date > new Date()}
          defaultMonth={valid ? selectedDate : new Date()}
        />
      </PopoverContent>
    </Popover>
  )
}
