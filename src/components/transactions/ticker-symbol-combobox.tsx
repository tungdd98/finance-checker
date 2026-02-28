'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { MarketPrice } from '@/types/database'

interface TickerSymbolComboboxProps {
  value: string
  onChange: (value: string) => void
  assetType: 'gold' | 'stock' | 'etf' | null
  suggestions: MarketPrice[]
  placeholder?: string
}

export function TickerSymbolCombobox({
  value,
  onChange,
  assetType,
  suggestions,
  placeholder = 'Chọn mã...',
}: TickerSymbolComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')

  // Clear search input when popup closes
  React.useEffect(() => {
    if (!open) setSearchValue('')
  }, [open])

  // Filter suggestions by asset type
  const options = React.useMemo(() => {
    if (!assetType) return []
    return suggestions
      .filter((p) => p.asset_type === assetType && p.ticker_symbol)
      .map((p) => p.ticker_symbol!)
      .filter((ticker, index, self) => self.indexOf(ticker) === index)
  }, [suggestions, assetType])

  const handleSelect = (ticker: string) => {
    onChange(ticker === value ? '' : ticker)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-11 w-full justify-between font-normal"
        >
          {value || <span className="text-muted-foreground">{placeholder}</span>}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Tìm mã..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {options.length === 0 ? (
              <CommandEmpty>Chưa có mã nào trong danh sách.</CommandEmpty>
            ) : (
              <CommandGroup>
                {options.map((ticker) => (
                  <CommandItem key={ticker} value={ticker} onSelect={() => handleSelect(ticker)}>
                    <Check
                      className={cn('mr-2 h-4 w-4', value === ticker ? 'opacity-100' : 'opacity-0')}
                    />
                    {ticker}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
