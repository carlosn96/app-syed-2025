
import ProfileSettings from "@/components/profile-settings";

export default function ProfilePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Perfil</h2>
      <ProfileSettings />
    </div>
  );
}
