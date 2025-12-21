'use client'

import { Languages } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import {
  SUPPORTED_LANGUAGES,
  languageLabels,
  type Language,
} from '@/i18n/config'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const flags: Record<Language, string> = {
  en: '🇺🇸',
  de: '🇩🇪',
  // добавь остальные, если нужны
}

interface LanguagePickerProps {
  inline?: boolean
  className?: string
}

export function LanguagePicker({ inline = false, className }: LanguagePickerProps = {}) {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div
      className={cn(
        inline ? 'inline-flex justify-end items-center' : 'fixed top-4 right-4 z-50',
        className
      )}
    >
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs px-2 py-1"
          >
            <Languages className="h-4 w-4" />
            <span className="flex items-center gap-1">
              <span className="text-lg">{flags[language]}</span>
              <span>{languageLabels[language]}</span>
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-40 text-xs border border-white/10 bg-black/40 backdrop-blur-md overflow-visible" avoidCollisions={true}>
          <DropdownMenuLabel className="text-xs">
            {t('languagePickerLabel')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={language}
            onValueChange={value => setLanguage(value as Language)}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <DropdownMenuRadioItem
                key={lang}
                value={lang}
                className="text-xs"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{flags[lang as Language]}</span>
                  <span>{languageLabels[lang as Language]}</span>
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
