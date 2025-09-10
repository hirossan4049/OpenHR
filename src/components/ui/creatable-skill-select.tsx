"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import Image from "next/image"

import { cn } from "~/lib/utils"
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

export interface SkillOption {
  id: string
  name: string
  slug: string
  logoUrl?: string | null
  aliases?: string[]
  verified?: boolean
  category?: string | null
}

interface CreatableSkillSelectProps {
  skills: SkillOption[]
  value?: string
  onValueChange?: (value: string) => void
  onCreateSkill?: (name: string) => void
  onSearchChange?: (query: string) => void
  placeholder?: string
  emptyText?: string
  searchPlaceholder?: string
  createText?: string
  disabled?: boolean
  className?: string
  isLoading?: boolean
}

export function CreatableSkillSelect({
  skills,
  value,
  onValueChange,
  onCreateSkill,
  onSearchChange,
  placeholder = "Select skill...",
  emptyText = "No skills found.",
  searchPlaceholder = "Search skills...",
  createText = "Create \"{search}\"",
  disabled = false,
  className,
  isLoading = false,
}: CreatableSkillSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const [hiddenLogoIds, setHiddenLogoIds] = React.useState<Set<string>>(new Set())

  const selectedSkill = skills.find((skill) => skill.id === value)

  // Filter skills based on search
  const filteredSkills = React.useMemo(() => {
    if (!searchValue) return skills

    const search = searchValue.toLowerCase()
    return skills.filter((skill) => {
      // Search in name
      if (skill.name.toLowerCase().includes(search)) return true
      
      // Search in slug
      if (skill.slug.toLowerCase().includes(search)) return true
      
      // Search in aliases
      if (skill.aliases?.some(alias => alias.toLowerCase().includes(search))) return true
      
      return false
    })
  }, [skills, searchValue])

  // Check if we should show create option
  const shouldShowCreate = searchValue && 
    !filteredSkills.some(skill => skill.name.toLowerCase() === searchValue.toLowerCase()) &&
    onCreateSkill

  const handleSelect = (skillId: string) => {
    onValueChange?.(skillId === value ? "" : skillId)
    setOpen(false)
    setSearchValue("")
  }

  const handleCreate = () => {
    if (searchValue && onCreateSkill) {
      onCreateSkill(searchValue)
      setOpen(false)
      setSearchValue("")
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled || isLoading}
        >
          {selectedSkill ? (
            <div className="flex items-center gap-2">
              {selectedSkill.logoUrl && !hiddenLogoIds.has(selectedSkill.id) && (
                <Image
                  src={selectedSkill.logoUrl}
                  alt={selectedSkill.name}
                  width={16}
                  height={16}
                  className="rounded-sm"
                  onError={() => setHiddenLogoIds(prev => {
                    const next = new Set(prev)
                    next.add(selectedSkill.id)
                    return next
                  })}
                />
              )}
              <span>{selectedSkill.name}</span>
              {selectedSkill.verified && (
                <Check className="h-3 w-3 text-green-600" />
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
            onChange={(e) => {
              const v = e.target.value
              setSearchValue(v)
              onSearchChange?.(v)
            }}
          />
          <CommandList>
            {filteredSkills.length === 0 && !shouldShowCreate && (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}
            
            <CommandGroup>
              {filteredSkills.map((skill) => (
                <CommandItem
                  key={skill.id}
                  value={skill.id}
                  onSelect={handleSelect}
                  className="flex items-center gap-2"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === skill.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {skill.logoUrl && !hiddenLogoIds.has(skill.id) && (
                    <Image
                      src={skill.logoUrl}
                      alt={skill.name}
                      width={16}
                      height={16}
                      className="rounded-sm"
                      onError={() => setHiddenLogoIds(prev => {
                        const next = new Set(prev)
                        next.add(skill.id)
                        return next
                      })}
                    />
                  )}
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-1">
                      <span>{skill.name}</span>
                      {skill.verified && (
                        <Check className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                    {skill.aliases && skill.aliases.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Also known as: {skill.aliases.join(", ")}
                      </span>
                    )}
                  </div>
                  {skill.category && (
                    <span className="text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded">
                      {skill.category}
                    </span>
                  )}
                </CommandItem>
              ))}
              
              {shouldShowCreate && (
                <CommandItem
                  value={`create-${searchValue}`}
                  onSelect={handleCreate}
                  className="flex items-center gap-2 border-t"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {createText.replace("{search}", searchValue)}
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
