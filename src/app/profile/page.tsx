"use client";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import SimpleLocationInput from "@/components/SimpleLocationInput";

export default function ProfilePage() {
  const [user, setUser] = useState<{ 
    uid: string; 
    email: string; 
    firstName?: string; 
    lastName?: string; 
    phone?: string; 
    locations?: {
      name: string;
      address: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      placeId: string;
    }[]
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "settings">("info");

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  const [confirmDelete, setConfirmDelete] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();

  async function handleDelete() {
    setDeleteError(undefined);
    setDeleting(true);
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: confirmDelete }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Delete failed");
      window.location.href = "/";
    } catch (e: any) {
      setDeleteError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  if (!user) {
    return <p className="mt-6">You are not logged in.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-neutral-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("info")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "info"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Info
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "settings"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Settings
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "info" && (
        <InfoTab user={user} setUser={setUser} />
      )}
      
      {activeTab === "settings" && (
        <SettingsTab 
          user={user}
          handleLogout={handleLogout}
          confirmDelete={confirmDelete}
          setConfirmDelete={setConfirmDelete}
          handleDelete={handleDelete}
          deleting={deleting}
          deleteError={deleteError}
        />
      )}
    </div>
  );
}

// Info Tab Component
function InfoTab({ user, setUser }: { 
  user: { 
    uid: string; 
    email: string; 
    firstName?: string; 
    lastName?: string; 
    phone?: string; 
    locations?: {
      name: string;
      address: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      placeId: string;
    }[]
  } | null;
  setUser: (user: any) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });
  const [newLocation, setNewLocation] = useState("");
  const [useGoogleMaps, setUseGoogleMaps] = useState(false); // Disabled for now due to API issues

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Update failed");
      
      // Update local state with new data
      setUser({ ...user, ...formData });
      setEditing(false);
      
      // Refresh user data from server
      const meRes = await fetch("/api/me", { cache: "no-store" });
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData?.user || null);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddLocation() {
    if (!newLocation.trim()) return;
    
    try {
      const res = await fetch("/api/profile/add-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: newLocation.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Add location failed");
      
      // Refresh user data from server
      const meRes = await fetch("/api/me", { cache: "no-store" });
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData?.user || null);
      }
      setNewLocation("");
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleLocationSelect(locationData: any) {
    try {
      const res = await fetch("/api/profile/add-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          location: {
            name: locationData.name,
            address: locationData.formatted_address,
            coordinates: locationData.geometry.location,
            placeId: locationData.place_id
          }
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Add location failed");
      
      // Refresh user data from server
      const meRes = await fetch("/api/me", { cache: "no-store" });
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData?.user || null);
      }
      setNewLocation("");
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleRemoveLocation(location: string) {
    try {
      const res = await fetch("/api/profile/remove-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Remove location failed");
      
      // Refresh user data from server
      const meRes = await fetch("/api/me", { cache: "no-store" });
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData?.user || null);
      }
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="rounded-md border p-6 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          {!editing ? (
            <Button onClick={() => setEditing(true)}>Edit</Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => setEditing(false)} variant="outline">Cancel</Button>
              <Button onClick={handleSave} loading={saving}>Save</Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full rounded-md border px-3 py-2 bg-gray-50 text-gray-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={!editing}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-neutral-800 dark:disabled:text-gray-400"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!editing}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-neutral-800 dark:disabled:text-gray-400"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!editing}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-neutral-800 dark:disabled:text-gray-400"
              placeholder="Enter phone number"
            />
          </div>
        </div>
      </div>

      {/* Locations */}
      <div className="rounded-md border p-6 dark:border-neutral-700">
        <h2 className="text-lg font-semibold mb-4">Locations</h2>
        
        <div className="mb-4">
          <SimpleLocationInput
            value={newLocation}
            onChange={setNewLocation}
            onLocationSelect={handleLocationSelect}
            placeholder="Location kiriting..."
            className="w-full"
          />
          <div className="mt-2 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Faqat Toshkent shahri ichidagi joylar ko&apos;rsatiladi.
            </span>
          </div>
        </div>

        {user?.locations && user.locations.length > 0 ? (
          <div className="space-y-2">
            {user.locations.map((location, index) => (
              <div key={location.placeId || index} className="flex items-center justify-between bg-gray-50 dark:bg-neutral-800 rounded-md px-3 py-2">
                <div className="flex-1">
                  <div className="font-medium text-sm">{location.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{location.address}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    📍 {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveLocation(location.placeId)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No locations added yet.</p>
        )}
      </div>
    </div>
  );
}

// Settings Tab Component
function SettingsTab({ 
  user, 
  handleLogout, 
  confirmDelete, 
  setConfirmDelete, 
  handleDelete, 
  deleting, 
  deleteError 
}: {
  user: { 
    uid: string; 
    email: string; 
    firstName?: string; 
    lastName?: string; 
    phone?: string; 
    locations?: {
      name: string;
      address: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      placeId: string;
    }[]
  } | null;
  handleLogout: () => void;
  confirmDelete: string;
  setConfirmDelete: (value: string) => void;
  handleDelete: () => void;
  deleting: boolean;
  deleteError: string | undefined;
}) {
  return (
    <div className="space-y-6">
      {/* Account Actions */}
      <div className="rounded-md border p-6 dark:border-neutral-700">
        <h2 className="text-lg font-semibold mb-4">Account Actions</h2>
        <Button onClick={handleLogout}>Logout</Button>
      </div>

      {/* Remove Account */}
      <div className="rounded-md border p-6 dark:border-neutral-700">
        <h2 className="mb-2 text-lg font-semibold text-red-600">Remove account</h2>
        <p className="mb-3 text-sm text-neutral-600">
          This action is irreversible. Type <span className="font-mono">DELETE</span> to confirm.
        </p>
        <div className="flex items-center gap-3">
          <input
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            placeholder="Type DELETE to confirm"
            value={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.value)}
          />
          <Button onClick={handleDelete} disabled={confirmDelete !== "DELETE"} loading={deleting}>
            Remove
          </Button>
        </div>
        {deleteError ? <p className="mt-2 text-sm text-red-600">{deleteError}</p> : null}
      </div>
    </div>
  );
}


