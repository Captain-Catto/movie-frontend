import Image from "next/image";
import type { SyntheticEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAdminUiMessages } from "@/lib/ui-messages";
import type { User } from "./types";
import UserSignupAccess from "./UserSignupAccess";
import { countryCodeToFlag, countryCodeToName, countryFlagUrl } from "./utils";

interface AdminUsersTableProps {
  users: User[];
  loading: boolean;
  onEditUser: (user: User) => void;
  onViewDetails: (userId: number) => void;
  onOpenBan: (user: User) => void;
  onUnban: (userId: number) => void;
}

export default function AdminUsersTable({
  users,
  loading,
  onEditUser,
  onViewDetails,
  onOpenBan,
  onUnban,
}: AdminUsersTableProps) {
  const { language } = useLanguage();
  const labels = getAdminUiMessages(language);

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {labels.tableHeaderUser}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {labels.tableHeaderRole}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {labels.tableHeaderStatus}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {labels.tableHeaderSignupAccess}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {labels.tableHeaderCountry}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {labels.tableHeaderDeviceIp}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                {labels.tableHeaderActions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  {labels.loading}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  {labels.noUsersFound}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="size-10 rounded-full bg-red-600 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onEditUser(user)}
                        className="cursor-pointer ml-3 text-left"
                        title={labels.seoTableActionEdit}
                      >
                        <div className="flex items-center gap-x-2">
                          <div className="text-sm font-medium text-white hover:text-red-300 transition-colors">
                            {user.name || "No name"}
                          </div>
                          {user.provider && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-700 text-gray-200 capitalize">
                              {user.provider}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-600 text-white capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white">
                        {labels.statusActive}
                      </span>
                    ) : (
                      <div className="flex flex-col">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-600 text-white mb-1 w-fit">
                          {labels.statusBanned}
                        </span>
                        {user.bannedReason && (
                          <span className="text-xs text-gray-400">
                            {user.bannedReason}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <UserSignupAccess user={user} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {user.lastLoginCountry ? (
                      <>
                        {countryFlagUrl(user.lastLoginCountry) ? (
                          <Image
                             src={countryFlagUrl(user.lastLoginCountry) as string}
                             alt={countryCodeToName(user.lastLoginCountry)}
                             title={countryCodeToName(user.lastLoginCountry)}
                             width={24}
                             height={16}
                             className="rounded border border-gray-600"
                             unoptimized
                             onError={(e: SyntheticEvent<HTMLImageElement>) => {
                               (e.currentTarget as HTMLImageElement).style.display =
                                 "none";
                             }}
                          />
                        ) : (
                          <span
                             className="text-xl"
                             title={countryCodeToName(user.lastLoginCountry)}
                          >
                             {countryCodeToFlag(user.lastLoginCountry)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <div className="flex flex-col gap-y-1">
                      <span className="capitalize">
                        {user.lastLoginDevice || "N/A"}
                      </span>
                      {user.lastLoginIp && (
                        <span className="text-xs text-gray-400">
                          IP: {user.lastLoginIp}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onViewDetails(user.id)}
                        className="cursor-pointer px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                      >
                        {labels.actionDetails}
                      </button>
                      {user.isActive ? (
                        <button
                          type="button"
                          onClick={() => onOpenBan(user)}
                          className="cursor-pointer px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                        >
                          {labels.actionBan}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onUnban(user.id)}
                          className="cursor-pointer px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                        >
                          {labels.actionUnban}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
