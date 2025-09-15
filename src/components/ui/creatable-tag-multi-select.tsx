"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import { cn } from "~/lib/utils"
import { TagPill } from "~/components/ui/tag-pill"
import { Button } from "~/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"

export interface TagOption {
  id: string
  name: string
  color?: string
  description?: string | null
}

interface CreatableTagMultiSelectProps {
  options: TagOption[]
  values: string[]
  onValuesChange?: (values: string[]) => void
  onCreateTag?: (name: string, color?: string) => void
  placeholder?: string
  emptyText?: string
  searchPlaceholder?: string
  createText?: string // Use {search} placeholder
  disabled?: boolean
  className?: string
  isLoading?: boolean
}

export function CreatableTagMultiSelect({
  options,
  values,
  onValuesChange,
  onCreateTag,
  placeholder = "Select tags...",
  emptyText = "No tags found.",
  searchPlaceholder = "Search tags...",
  createText = "Create \"{search}\"",
  disabled = false,
  className,
  isLoading = false,
}: CreatableTagMultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const [createColor, setCreateColor] = React.useState<string>("#4F46E5")

  const filtered = React.useMemo(() => {
    if (!searchValue) return options
    const s = searchValue.toLowerCase()
    return options.filter((opt) => opt.name.toLowerCase().includes(s))
  }, [options, searchValue])

  const shouldShowCreate = !!searchValue &&
    !options.some((o) => o.name.toLowerCase() === searchValue.toLowerCase()) &&
    !!onCreateTag

  const toggleValue = (id: string) => {
    const set = new Set(values)
    if (set.has(id)) {
      set.delete(id)
    } else {
      set.add(id)
    }
    onValuesChange?.(Array.from(set))
  }

  const handleCreate = () => {
    if (searchValue && onCreateTag) {
      onCreateTag(searchValue, createColor)
      setSearchValue("")
    }
  }

  const selectedCount = values.length
  const selectedLabels = options.filter(o => values.includes(o.id)).slice(0, 3)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled || isLoading}
          onClick={() => setOpen((p) => !p)}
        >
          {selectedCount > 0 ? (
            <div className="flex items-center gap-2 flex-wrap">
              {selectedLabels.map((opt) => (
                <TagPill key={opt.id} name={opt.name} color={opt.color ?? "#999999"} size="sm" />
              ))}
              {selectedCount > selectedLabels.length && (
                <span className="text-xs text-muted-foreground">+{selectedCount - selectedLabels.length}</span>
              )}
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                if (shouldShowCreate) {
                  handleCreate()
                }
              }
            }}
          />
          <CommandList>
            {filtered.length === 0 && !shouldShowCreate && (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}
            <CommandGroup>
              {filtered.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={opt.id}
                  onSelect={() => toggleValue(opt.id)}
                  className="flex items-center gap-2"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      values.includes(opt.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <TagPill name={opt.name} color={opt.color ?? "#999999"} size="sm" />
                    {opt.description && (
                      <span className="text-xs text-muted-foreground">{opt.description}</span>
                    )}
                  </div>
                </CommandItem>
              ))}

              {shouldShowCreate && (
                <CommandItem
                  value={`create-${searchValue}`}
                  onSelect={handleCreate}
                  className="flex items-center justify-between gap-2 border-t"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="mr-2 h-4 w-4" />
                    {createText.replace("{search}", searchValue)}
                  </div>
                  <input
                    type="color"
                    aria-label="Choose tag color"
                    value={createColor}
                    onChange={(e) => setCreateColor(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="h-6 w-8 cursor-pointer rounded border"
                  />
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
