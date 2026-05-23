import type { User } from "./types";
import { formatDateTime } from "./utils";

export default function UserSignupAccess({ user }: { user: User }) {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center gap-x-2">
        <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-blue-600 text-white">
          Register
        </span>
        <span className="text-sm text-gray-200" suppressHydrationWarning>
          {formatDateTime(user.createdAt)}
        </span>
      </div>
      <div className="flex items-center gap-x-2">
        <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-red-600 text-white">
          Login
        </span>
        <span className="text-sm text-gray-200" suppressHydrationWarning>
          {formatDateTime(user.lastLoginAt)}
        </span>
      </div>
    </div>
  );
}
