import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/lib/types";
import { Badge } from "../ui/badge";

export function UserNav({ user }: { user: User }) {
  return (
    <div className="flex items-center space-x-4">
      <Avatar>
        <AvatarImage src={user.avatarUrl} alt={user.name} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{user.name}</span>
        <Badge variant="outline" className="w-fit">{user.role}</Badge>
      </div>
    </div>
  );
}
