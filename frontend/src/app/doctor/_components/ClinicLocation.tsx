"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  MapPin, Navigation, Pencil, X, Check, AlertCircle,
  CheckCircle2, Loader2, Building2, RefreshCw, Search,
} from "lucide-react";

const API = "http://localhost:5000";
const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// ── Types ────────────────────────────────────────────────────────────────────
interface LocationData {
  _id: string;
  hospitalName: string;
  address: string;
  lat: number;
  lng: number;
  updatedByDoctorId: string;
  synced: boolean;
  updatedAt: string;
}

interface Toast {
  type: "success" | "error";
  message: string;
}

interface Suggestion {
  place_id: string;
  description: string;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ClinicLocation({ doctorId }: { doctorId: string }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [saving, setSaving] = useState(false);

  // Modal form state
  const [formAddress, setFormAddress] = useState("");
  const [formLat, setFormLat] = useState<number | null>(null);
  const [formLng, setFormLng] = useState<number | null>(null);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Current location detection state
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 4000);
  };

  // ── Click outside to close suggestions ────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setHighlightedIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Fetch location on mount ───────────────────────────────────────────────
  const fetchLocation = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/doctor/location/${doctorId}`);
      const data = await res.json();
      if (data.success) setLocation(data.location || null);
    } catch {
      showToast("error", "Failed to load clinic location.");
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => { fetchLocation(); }, [fetchLocation]);

  // ── Autocomplete via BACKEND PROXY (bypasses all CORS/key issues) ─────────
  const handleAddressInput = (value: string) => {
    setFormAddress(value);
    setFormLat(null);
    setFormLng(null);
    setHighlightedIdx(-1);
    setSearchError("");

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim() || value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `${API}/api/places/autocomplete?input=${encodeURIComponent(value.trim())}`
        );
        const data = await res.json();

        console.log("[ClinicLocation] Autocomplete response:", data.status, data.predictions?.length, data.error_message);

        if (data.status === "OK" && data.predictions?.length > 0) {
          setSuggestions(data.predictions);
          setShowSuggestions(true);
          setSearchError("");
        } else if (data.status === "ZERO_RESULTS") {
          setSuggestions([]);
          setShowSuggestions(true);
          setSearchError("No matching locations found");
        } else if (data.status === "REQUEST_DENIED") {
          setSuggestions([]);
          setShowSuggestions(true);
          setSearchError(`API error: ${data.error_message || "Places API not enabled or key restricted"}`);
          console.error("[ClinicLocation] REQUEST_DENIED:", data.error_message);
        } else {
          setSuggestions([]);
          setShowSuggestions(true);
          setSearchError(data.error_message || `API returned: ${data.status}`);
          console.error("[ClinicLocation] API status:", data.status, data.error_message);
        }
      } catch (err: any) {
        console.error("[ClinicLocation] Network error:", err);
        setSuggestions([]);
        setShowSuggestions(true);
        setSearchError("Network error. Check if backend is running.");
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  // ── Select a suggestion → get lat/lng via backend proxy ───────────────────
  const handleSelectSuggestion = async (placeId: string, description: string) => {
    setFormAddress(description);
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightedIdx(-1);
    setSearchError("");

    try {
      const res = await fetch(
        `${API}/api/places/details?place_id=${encodeURIComponent(placeId)}`
      );
      const data = await res.json();

      if (data.status === "OK" && data.lat != null && data.lng != null) {
        setFormLat(data.lat);
        setFormLng(data.lng);
        if (data.formatted_address) {
          setFormAddress(data.formatted_address);
        }
        console.log("[ClinicLocation] Place selected:", description, data.lat, data.lng);
      } else {
        console.error("[ClinicLocation] Details error:", data.status, data.error_message);
        showToast("error", "Could not get coordinates for this address. Try another.");
      }
    } catch (err) {
      console.error("[ClinicLocation] Details fetch error:", err);
      showToast("error", "Failed to fetch address details.");
    }
  };

  // ── Keyboard navigation ───────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIdx((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIdx((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && highlightedIdx >= 0) {
      e.preventDefault();
      const s = suggestions[highlightedIdx];
      handleSelectSuggestion(s.place_id, s.description);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIdx(-1);
    }
  };

  // ── Open modal ────────────────────────────────────────────────────────────
  const openModal = () => {
    setFormAddress(location?.address || "");
    setFormLat(location?.lat || null);
    setFormLng(location?.lng || null);
    setLocationError("");
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightedIdx(-1);
    setSearchError("");
    setShowModal(true);
  };

  // ── Current location ──────────────────────────────────────────────────────
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${MAPS_KEY}`
          );
          const data = await res.json();
          const fullAddress = data.results?.[0]?.formatted_address || `${lat}, ${lng}`;
          setFormAddress(fullAddress);
          setFormLat(lat);
          setFormLng(lng);
        } catch {
          setLocationError("Unable to reverse geocode. Please enter the address manually.");
          setFormLat(lat);
          setFormLng(lng);
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        setDetectingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location permission denied. Please allow access in your browser settings.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError("Location unavailable. Please try again or enter address manually.");
        } else {
          setLocationError("Could not detect location. Please try again.");
        }
      },
      { timeout: 10000 }
    );
  };

  // ── Save location ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formAddress.trim()) { showToast("error", "Please enter or select an address."); return; }
    if (formLat === null || formLng === null) {
      showToast("error", "Please select an address from suggestions or use current location.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/doctor/location/${doctorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: formAddress.trim(), lat: formLat, lng: formLng }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setLocation(data.location);
      showToast("success", "Hospital location saved. All doctors at this hospital will see this location.");
      setShowModal(false);
    } catch (err: any) {
      showToast("error", err.message || "Failed to save location.");
    } finally {
      setSaving(false);
    }
  };

  // ── Static map preview URL ────────────────────────────────────────────────
  const staticMapUrl = (lat: number, lng: number) =>
    `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x200&scale=2&markers=color:red%7C${lat},${lng}&key=${MAPS_KEY}`;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <MapPin size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-700 uppercase tracking-wider">Clinic Location</h3>
            <p className="text-xs text-slate-400 font-medium">Hospital / Clinic address for consultations</p>
          </div>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors shadow-sm"
        >
          {location ? <><Pencil size={14} /> Update</> : <><MapPin size={14} /> Add Location</>}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-4 text-sm font-semibold ${
          toast.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={24} className="text-blue-400 animate-spin" />
        </div>
      ) : !location ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
            <Building2 size={24} className="text-slate-300" />
          </div>
          <p className="font-bold text-slate-600">No location set</p>
          <p className="text-slate-400 text-sm max-w-xs">Add your hospital or clinic location so patients can find you easily.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Synced badge */}
          {location.synced && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
              <RefreshCw size={14} className="text-blue-500" />
              <span className="text-xs font-bold text-blue-600">Synced from hospital location</span>
            </div>
          )}

          {/* Location card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
            {MAPS_KEY && (
              <img
                src={staticMapUrl(location.lat, location.lng)}
                alt="Map preview"
                className="w-full h-40 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={15} className="text-blue-500 shrink-0" />
                <p className="font-bold text-slate-800 text-sm">{location.hospitalName}</p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <p className="text-slate-500 text-sm leading-relaxed">{location.address}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 p-2 rounded-full text-slate-500 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <MapPin size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                {location ? "Update Clinic Location" : "Set Clinic Location"}
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Hospital / Clinic Address</label>
                <button
                  type="button"
                  onClick={handleCurrentLocation}
                  disabled={detectingLocation}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-blue-300 text-blue-600 bg-blue-50 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors mb-3 disabled:opacity-60"
                >
                  {detectingLocation ? (
                    <><Loader2 size={15} className="animate-spin" /> Detecting your location...</>
                  ) : (
                    <><Navigation size={15} /> Use Current Location</>
                  )}
                </button>

                {locationError && (
                  <div className="flex items-start gap-2 text-red-500 text-xs font-semibold bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3">
                    <AlertCircle size={13} className="shrink-0 mt-0.5" />
                    {locationError}
                  </div>
                )}

                <p className="text-xs text-slate-400 font-medium text-center mb-2">— or type manually —</p>

                {/* Autocomplete input */}
                <div className="relative" ref={autocompleteRef}>
                  <div className="relative">
                    <input
                      value={formAddress}
                      onChange={(e) => handleAddressInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                      placeholder="Start typing hospital address..."
                      className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 font-medium text-slate-700 bg-slate-50 transition-all text-sm"
                      autoComplete="off"
                    />
                    {searchLoading && (
                      <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" />
                    )}
                  </div>

                  {/* Suggestions dropdown */}
                  {showSuggestions && (
                    <ul className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
                      {suggestions.length > 0 ? (
                        suggestions.map((s, idx) => (
                          <li
                            key={s.place_id}
                            onClick={() => handleSelectSuggestion(s.place_id, s.description)}
                            className={`flex items-start gap-2 px-4 py-3 cursor-pointer border-b border-slate-50 last:border-0 text-sm text-slate-700 font-medium transition-colors ${
                              idx === highlightedIdx ? "bg-blue-50 text-blue-700" : "hover:bg-blue-50"
                            }`}
                          >
                            <MapPin size={14} className="text-blue-500 shrink-0 mt-0.5" />
                            {s.description}
                          </li>
                        ))
                      ) : searchError ? (
                        <li className="px-4 py-3 text-sm text-slate-400 font-medium text-center">
                          {searchError}
                        </li>
                      ) : null}
                    </ul>
                  )}
                </div>

                {/* Lat/Lng confirmed indicator */}
                {formLat !== null && formLng !== null && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-green-600 font-semibold">
                    <CheckCircle2 size={12} />
                    Location coordinates captured
                  </div>
                )}

                {/* Map preview */}
                {formLat !== null && formLng !== null && MAPS_KEY && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 h-40 mt-3">
                    <img
                      src={staticMapUrl(formLat, formLng)}
                      alt="Map preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
              </div>

              {/* Info note */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-blue-600">
                  📍 This location will be shared with all doctors registered at the same hospital.
                </p>
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-500 disabled:bg-blue-300 text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Check size={16} /> Save Location</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
