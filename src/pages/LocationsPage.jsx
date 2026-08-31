import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import { toast } from "../store/useToastStore.js";
import Tabs from "../components/common/Tabs.jsx";
import Modal from "../components/common/Modal.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import { LoadingSpinner, EmptyState } from "../components/common/LoadingSpinner.jsx";
import { MapPin, Globe, Map, Building2, Plus, Trash2 } from "lucide-react";

export default function LocationsPage() {
  const [activeTab, setActiveTab] = useState("countries"); // 'countries' | 'states' | 'cities'
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [addCountryOpen, setAddCountryOpen] = useState(false);
  const [addStateOpen, setAddStateOpen] = useState(false);
  const [addCityOpen, setAddCityOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [countryForm, setCountryForm] = useState({ name: "", flag: "🇮🇳", code: "IN" });
  const [stateForm, setStateForm] = useState({ name: "", country: "" });
  const [cityForm, setCityForm] = useState({ name: "", state: "" });

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/locations/hierarchy");
      if (res.status && res.data) {
        setCountries(res.data.countries || []);
        setStates(res.data.states || []);
        setCities(res.data.cities || []);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCreateCountry = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post("/locations/countries", countryForm);
      if (res.status) {
        toast.success("Country added successfully");
        setAddCountryOpen(false);
        setCountryForm({ name: "", flag: "🇯🇵", code: "JP" });
        fetchLocations();
      }
    } catch (err) {
      toast.error(err.message || "Failed to add country");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateState = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post("/locations/states", stateForm);
      if (res.status) {
        toast.success("State added successfully");
        setAddStateOpen(false);
        setStateForm({ name: "", country: "" });
        fetchLocations();
      }
    } catch (err) {
      toast.error(err.message || "Failed to add state");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateCity = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post("/locations/cities", cityForm);
      if (res.status) {
        toast.success("City added successfully");
        setAddCityOpen(false);
        setCityForm({ name: "", state: "" });
        fetchLocations();
      }
    } catch (err) {
      toast.error(err.message || "Failed to add city");
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteDialog = (item, type) => {
    setSelectedItem({ ...item, type });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      const endpoint = `/locations/${selectedItem.type}/${selectedItem._id}`;
      const res = await api.delete(endpoint);
      if (res.status) {
        toast.success(`${selectedItem.type} deleted successfully`);
        setDeleteModalOpen(false);
        fetchLocations();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete location");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-rose-500" />
            <span>Locations Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Maintain supported Countries, States, and Cities for user geocoding and filtering
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === "countries" && (
            <button
              onClick={() => setAddCountryOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Country</span>
            </button>
          )}
          {activeTab === "states" && (
            <button
              onClick={() => {
                if (countries.length > 0) setStateForm((p) => ({ ...p, country: countries[0]._id }));
                setAddStateOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add State</span>
            </button>
          )}
          {activeTab === "cities" && (
            <button
              onClick={() => {
                if (states.length > 0) setCityForm((p) => ({ ...p, state: states[0]._id }));
                setAddCityOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add City</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { key: "countries", label: "Countries", icon: <Globe className="w-4 h-4" />, count: countries.length },
          { key: "states", label: "States", icon: <Map className="w-4 h-4" />, count: states.length },
          { key: "cities", label: "Cities", icon: <Building2 className="w-4 h-4" />, count: cities.length },
        ]}
        activeTab={activeTab}
        onChange={(k) => setActiveTab(k)}
      />

      {/* Tab Content */}
      {loading ? (
        <LoadingSpinner text="Fetching location database..." />
      ) : (
        <div className="rounded-2xl bg-[#121522] border border-slate-800/80 overflow-hidden">
          {activeTab === "countries" && (
            <div className="divide-y divide-slate-800/60">
              {countries.length === 0 ? (
                <EmptyState title="No countries added" description="Add supported countries first." />
              ) : (
                countries.map((c) => (
                  <div
                    key={c._id}
                    className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-800/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-1.5 rounded-lg bg-[#181d2e] border border-slate-800">
                        {c.flag || "🌐"}
                      </span>
                      <div>
                        <span className="text-sm font-semibold text-slate-100">{c.name}</span>
                        <span className="text-xs text-slate-500 font-mono ml-2">[{c.code}]</span>
                      </div>
                    </div>
                    <button
                      onClick={() => openDeleteDialog(c, "countries")}
                      className="p-1.5 rounded-lg border border-rose-900/50 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors"
                      title="Delete Country"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "states" && (
            <div className="divide-y divide-slate-800/60">
              {states.length === 0 ? (
                <EmptyState title="No states added" description="Add states linked to your countries." />
              ) : (
                states.map((s) => {
                  const countryObj = countries.find((c) => c._id === s.country);
                  return (
                    <div
                      key={s._id}
                      className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-800/20 transition-colors"
                    >
                      <div>
                        <span className="text-sm font-semibold text-slate-100">{s.name}</span>
                        {countryObj && (
                          <span className="text-xs text-slate-400 ml-2">
                            ({countryObj.flag} {countryObj.name})
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => openDeleteDialog(s, "states")}
                        className="p-1.5 rounded-lg border border-rose-900/50 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors"
                        title="Delete State"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "cities" && (
            <div className="divide-y divide-slate-800/60">
              {cities.length === 0 ? (
                <EmptyState title="No cities added" description="Add cities linked to states." />
              ) : (
                cities.map((city) => {
                  const stateObj = states.find((s) => s._id === city.state);
                  return (
                    <div
                      key={city._id}
                      className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-800/20 transition-colors"
                    >
                      <div>
                        <span className="text-sm font-semibold text-slate-100">{city.name}</span>
                        {stateObj && (
                          <span className="text-xs text-slate-400 ml-2">in {stateObj.name}</span>
                        )}
                      </div>
                      <button
                        onClick={() => openDeleteDialog(city, "cities")}
                        className="p-1.5 rounded-lg border border-rose-900/50 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors"
                        title="Delete City"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* ADD COUNTRY MODAL */}
      <Modal isOpen={addCountryOpen} onClose={() => setAddCountryOpen(false)} title="Add Country">
        <form onSubmit={handleCreateCountry} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Country Name *</label>
            <input
              type="text"
              required
              value={countryForm.name}
              onChange={(e) => setCountryForm({ ...countryForm, name: e.target.value })}
              placeholder="e.g. Japan"
              className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Flag Emoji *</label>
              <input
                type="text"
                required
                value={countryForm.flag}
                onChange={(e) => setCountryForm({ ...countryForm, flag: e.target.value })}
                placeholder="🇯🇵"
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100 text-center text-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Code (ISO) *</label>
              <input
                type="text"
                required
                value={countryForm.code}
                onChange={(e) => setCountryForm({ ...countryForm, code: e.target.value.toUpperCase() })}
                placeholder="JP"
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100 uppercase font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setAddCountryOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
            >
              {actionLoading ? "Saving..." : "Save Country"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD STATE MODAL */}
      <Modal isOpen={addStateOpen} onClose={() => setAddStateOpen(false)} title="Add State">
        <form onSubmit={handleCreateState} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">State Name *</label>
            <input
              type="text"
              required
              value={stateForm.name}
              onChange={(e) => setStateForm({ ...stateForm, name: e.target.value })}
              placeholder="e.g. Tokyo, California, Tamil Nadu"
              className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Country *</label>
            <select
              required
              value={stateForm.country}
              onChange={(e) => setStateForm({ ...stateForm, country: e.target.value })}
              className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
            >
              {countries.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.flag} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setAddStateOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
            >
              {actionLoading ? "Saving..." : "Save State"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD CITY MODAL */}
      <Modal isOpen={addCityOpen} onClose={() => setAddCityOpen(false)} title="Add City">
        <form onSubmit={handleCreateCity} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">City Name *</label>
            <input
              type="text"
              required
              value={cityForm.name}
              onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
              placeholder="e.g. Shibuya, San Francisco, Chennai"
              className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">State *</label>
            <select
              required
              value={cityForm.state}
              onChange={(e) => setCityForm({ ...cityForm, state: e.target.value })}
              className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
            >
              {states.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setAddCityOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
            >
              {actionLoading ? "Saving..." : "Save City"}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${selectedItem?.type ? selectedItem.type.slice(0, -1) : "Location"}`}
        message={`Are you sure you want to delete "${selectedItem?.name}"? All child states or cities under it will also be deleted.`}
        confirmText="Delete"
        loading={actionLoading}
      />
    </div>
  );
}
