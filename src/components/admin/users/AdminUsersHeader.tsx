import { useLanguage } from "@/contexts/LanguageContext";
import { getAdminUiMessages } from "@/lib/ui-messages";

export default function AdminUsersHeader() {
  const { language } = useLanguage();
  const labels = getAdminUiMessages(language);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold text-white">{labels.userHeaderTitle}</h1>
      <p className="text-gray-400">{labels.userHeaderDesc}</p>
    </div>
  );
}

