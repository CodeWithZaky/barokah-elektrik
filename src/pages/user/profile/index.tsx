import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UpdatePasswordModal from "@/components/update-password-modal";
import UpdateProfileModal from "@/components/update-profile-modal";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import UserLayout from "../layout";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isUpdateProfileModalOpen, setIsUpdateProfileModalOpen] =
    useState(false);
  const [isUpdatePasswordModalOpen, setIsUpdatePasswordModalOpen] =
    useState(false);

  const { data: user, isLoading } = api.user.getUserById.useQuery(undefined, {
    enabled: !!session,
  });

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex-1 p-6">
          <div className="mx-auto max-w-2xl">Loading...</div>
        </div>
      </UserLayout>
    );
  }

  const userData = user?.accounts[0]?.user;

  return (
    <div className="min-h-screen">
      <UserLayout>
        <div className="flex-1 p-6">
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle>Profil Saya</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage
                    src={userData?.image || ""}
                    alt={userData?.name || ""}
                  />
                  <AvatarFallback>
                    {userData?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-bold text-2xl">{userData?.name}</h2>
                  <p className="text-gray-500">{userData?.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => setIsUpdateProfileModalOpen(true)}
                  className="w-full"
                >
                  Ubah Profil
                </Button>
                <Button
                  onClick={() => setIsUpdatePasswordModalOpen(true)}
                  variant="outline"
                  className="w-full"
                >
                  Ubah Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </UserLayout>
      {userData && (
        <UpdateProfileModal
          isOpen={isUpdateProfileModalOpen}
          onClose={() => setIsUpdateProfileModalOpen(false)}
          userData={{
            name: userData?.name ?? undefined,
            email: userData?.email ?? undefined,
            image: userData?.image ?? undefined,
          }}
        />
      )}
      <UpdatePasswordModal
        isOpen={isUpdatePasswordModalOpen}
        onClose={() => setIsUpdatePasswordModalOpen(false)}
      />
    </div>
  );
}
