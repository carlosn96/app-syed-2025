
"use client"

import { useState, useMemo } from 'react';
import { Filter, Search, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { Input } from './input';
import { Checkbox } from './checkbox';
import { ScrollArea } from './scroll-area';
import { Separator } from './separator';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterPopoverProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onApply: (selected: string[]) => void;
}

export function FilterPopover({ title, options, selectedValues, onApply }: FilterPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelected, setTempSelected] = useState(selectedValues);

  const filteredOptions = useMemo(() => {
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleApply = () => {
    onApply(tempSelected);
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempSelected([]);
    onApply([]);
  };

  const handleCheckboxChange = (value: string, checked: boolean) => {
    setTempSelected(prev =>
      checked ? [...prev, value] : prev.filter(item => item !== value)
    );
  };
  
  const handleOpenChange = (open: boolean) => {
    if (open) {
        setTempSelected(selectedValues); // Sync with external state when opening
    }
    setIsOpen(open);
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline-filter" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filtrar
          {selectedValues.length > 0 && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs">
              {selectedValues.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <div className="p-4">
            <h4 className="text-sm font-medium leading-none">{title}</h4>
        </div>
        <Separator />
        <div className="p-2">
            <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar..."
                    className="pl-8 h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        <ScrollArea className="h-48">
          <div className="p-4 space-y-2">
            {filteredOptions.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`filter-${option.value}`}
                  checked={tempSelected.includes(option.value)}
                  onCheckedChange={(checked) => handleCheckboxChange(option.value, !!checked)}
                />
                <label
                  htmlFor={`filter-${option.value}`}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
        <Separator />
        <div className="p-2 flex justify-between">
             <Button variant="ghost" size="sm" onClick={handleClear} disabled={tempSelected.length === 0}>
                Limpiar
            </Button>
            <Button size="sm" onClick={handleApply}>
                Aplicar
            </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

    