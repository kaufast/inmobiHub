import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('en-GB')}>
          <span className="mr-2">🇬🇧</span> English (UK)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('es-MX')}>
          <span className="mr-2">🇲🇽</span> Español (México)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}