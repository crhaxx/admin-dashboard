import StoreSettingsSection from "./Settings/StoreSettingsSection";
import EmailTemplatesSection from "./Settings/EmailTemplatesSection";
import BackupRestoreSection from "./Settings/BackupRestoreSection";
import MaintenanceModeSection from "./Settings/MaintenanceModeSection";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-10">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">
            Manage your store, billing, data and system preferences.
          </p>
        </div>

        <StoreSettingsSection />
        <EmailTemplatesSection />
        <BackupRestoreSection />
        <MaintenanceModeSection />

        <section className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
          <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
          <p className="text-gray-500 text-sm mb-6">
            Irreversible actions. Proceed with caution.
          </p>

          <button className="w-full px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Delete account
          </button>
        </section>

      </div>
    </div>
  );
}