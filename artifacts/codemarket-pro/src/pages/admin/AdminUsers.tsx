import { useState, useEffect } from "react";
import { Users, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layout/AdminLayout";
import { getAllUsers, setUserRole } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfile } from "@/types";

function formatDate(v: unknown) {
  if (typeof v === "string") return v;
  if (v instanceof Date) return v.toLocaleDateString();
  return "";
}

export default function AdminUsers() {
  const { toast } = useToast();
  const { user: currentUser, userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAllUsers()
      .then(setUsers)
      .catch((err) => console.error("getAllUsers error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (userProfile) load();
  }, [userProfile?.uid]);

  const toggleRole = async (u: UserProfile) => {
    if (u.uid === currentUser?.uid) {
      toast({ title: "Cannot change your own role", variant: "destructive" });
      return;
    }
    const newRole = u.role === "admin" ? "user" : "admin";
    await setUserRole(u.uid, newRole);
    toast({ title: `User ${newRole === "admin" ? "promoted to admin" : "demoted to user"}` });
    load();
  };

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold mb-6">Users ({users.length})</h1>

      {loading ? (
        <div className="space-y-2">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-14 rounded-lg"/>)}</div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No users yet</p>
        </div>
      ) : (
        <>
          {/* ── Desktop table ── */}
          <div className="hidden sm:block rounded-lg border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">UID</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Joined</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Role</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-muted/30 transition-colors" data-testid={`user-row-${u.uid}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold shrink-0">
                          {u.displayName?.[0] || "U"}
                        </div>
                        <div>
                          <div className="font-medium text-xs">{u.displayName}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.uid.slice(0,8)}…</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      {u.role === "admin"
                        ? <Badge className="text-xs bg-primary/10 text-primary border-primary/20"><Shield className="w-3 h-3 mr-1"/>Admin</Badge>
                        : <Badge variant="outline" className="text-xs">User</Badge>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm" variant="outline" className="h-7 text-xs"
                        onClick={() => toggleRole(u)}
                        disabled={u.uid === currentUser?.uid}
                        data-testid={`button-toggle-role-${u.uid}`}
                      >
                        {u.role === "admin" ? "Demote" : "Make Admin"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile card list ── */}
          <div className="sm:hidden space-y-3">
            {users.map((u) => (
              <div key={u.uid} className="rounded-lg border border-border bg-card p-3" data-testid={`user-row-${u.uid}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold shrink-0">
                    {u.displayName?.[0] || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{u.displayName}</div>
                    <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                    <div className="text-xs text-muted-foreground">Joined: {formatDate(u.createdAt)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {u.role === "admin"
                      ? <Badge className="text-xs bg-primary/10 text-primary border-primary/20"><Shield className="w-3 h-3 mr-1"/>Admin</Badge>
                      : <Badge variant="outline" className="text-xs">User</Badge>
                    }
                    <Button
                      size="sm" variant="outline" className="h-7 text-xs"
                      onClick={() => toggleRole(u)}
                      disabled={u.uid === currentUser?.uid}
                      data-testid={`button-toggle-role-${u.uid}`}
                    >
                      {u.role === "admin" ? "Demote" : "Make Admin"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
