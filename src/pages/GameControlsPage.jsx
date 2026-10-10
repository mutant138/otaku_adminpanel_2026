import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import { toast } from "../store/useToastStore.js";
import { LoadingSpinner } from "../components/common/LoadingSpinner.jsx";
import {
  Gamepad2,
  Swords,
  KeyRound,
  Eye,
  EyeOff,
  Zap,
  ShieldAlert,
  Save,
  RefreshCw,
  Trophy,
  CheckCircle2,
  XCircle,
  Sparkles,
  Type,
} from "lucide-react";

export default function GameControlsPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingMap, setSavingMap] = useState({});

  const fetchGames = async () => {
    setLoading(true);
    try {
      const res = await api.get("/games");
      if (res.status && res.data) {
        setGames(res.data);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load game settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleFieldChange = (gameId, field, value) => {
    setGames((prev) =>
      prev.map((g) => (g.gameId === gameId ? { ...g, [field]: value } : g))
    );
  };

  const handleSave = async (game) => {
    setSavingMap((prev) => ({ ...prev, [game.gameId]: true }));
    try {
      const payload = {
        title: (game.title || "").trim(),
        description: (game.description || "").trim(),
        isPublic: Boolean(game.isPublic),
        winReward: Math.max(0, Number(game.winReward || 0)),
        defeatPenalty: Math.max(0, Number(game.defeatPenalty || 0)),
        drawReward: Math.max(0, Number(game.drawReward || 0)),
      };

      const res = await api.put(`/games/${game.gameId}`, payload);
      if (res.status && res.data) {
        toast.success(`Settings for "${game.title}" saved successfully!`);
        setGames((prev) =>
          prev.map((g) => (g.gameId === game.gameId ? res.data : g))
        );
      }
    } catch (err) {
      toast.error(err.message || "Failed to update game setting.");
    } finally {
      setSavingMap((prev) => ({ ...prev, [game.gameId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner />
        <span className="text-xs text-slate-400 mt-2 font-mono">
          Loading Arena Game Configurations...
        </span>
      </div>
    );
  }

  const liveCount = games.filter((g) => g.isPublic).length;
  const hiddenCount = games.length - liveCount;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Gamepad2 className="w-7 h-7 text-indigo-400" />
            Arena Game Controls & Rewards
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Control game visibility in the public PvP Arena and calibrate Quantum Synergy rewards & defeat penalties.
          </p>
        </div>
        <button
          onClick={fetchGames}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold tracking-wide border border-slate-700 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#121522] border border-slate-800 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Total PvP Games</div>
            <div className="text-xl font-bold text-slate-100">{games.length}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121522] border border-slate-800 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Live to Public</div>
            <div className="text-xl font-bold text-emerald-400">{liveCount} Games</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121522] border border-slate-800 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Hidden (Maintenance)</div>
            <div className="text-xl font-bold text-amber-400">{hiddenCount} Games</div>
          </div>
        </div>
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {games.map((game) => {
          const isSaving = savingMap[game.gameId] || false;
          const isTrivia = game.gameId === "trivia_duel";

          return (
            <div
              key={game.gameId}
              className={`rounded-2xl border transition-all duration-300 bg-[#121522] flex flex-col justify-between overflow-hidden ${
                game.isPublic
                  ? isTrivia
                    ? "border-amber-500/40 shadow-lg shadow-amber-500/5"
                    : "border-cyan-500/40 shadow-lg shadow-cyan-500/5"
                  : "border-slate-800 opacity-80"
              }`}
            >
              {/* Card Header */}
              <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-slate-900/40">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-3 rounded-xl border shrink-0 ${
                        isTrivia
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                      }`}
                    >
                      {isTrivia ? (
                        <Swords className="w-6 h-6" />
                      ) : (
                        <KeyRound className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {game.gameId}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                          {game.tag}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-100 mt-1">
                        {game.title || <span className="text-slate-500 italic">Untitled Game</span>}
                      </h2>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {game.description || <span className="text-slate-600 italic">No description set.</span>}
                      </p>
                    </div>
                  </div>

                  {/* Public Status Badge */}
                  <div className="shrink-0">
                    {game.isPublic ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Live in Arena
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                        <EyeOff className="w-3.5 h-3.5" />
                        Hidden
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Controls Form */}
              <div className="p-5 sm:p-6 space-y-5 flex-1">
                {/* 0. Editable Game Name & Description */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    <Type className="w-3.5 h-3.5 text-indigo-400" />
                    Game Display Name
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Title <span className="text-[10px] font-mono text-slate-500">(shown in Arena card)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={60}
                      value={game.title || ""}
                      onChange={(e) =>
                        handleFieldChange(game.gameId, "title", e.target.value)
                      }
                      placeholder="Enter game display title..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm font-semibold focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                    />
                    <p className="text-[11px] text-slate-500 font-mono">{(game.title || "").length}/60 chars</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Description <span className="text-[10px] font-mono text-slate-500">(subtitle under the title)</span>
                    </label>
                    <textarea
                      maxLength={180}
                      rows={2}
                      value={game.description || ""}
                      onChange={(e) =>
                        handleFieldChange(game.gameId, "description", e.target.value)
                      }
                      placeholder="Enter game description..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs resize-none focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                    />
                    <p className="text-[11px] text-slate-500 font-mono">{(game.description || "").length}/180 chars</p>
                  </div>
                </div>

                {/* 1. Show Public Checkbox / Toggle */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-slate-300">
                      {game.isPublic ? (
                        <Eye className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor={`public-toggle-${game.gameId}`}
                        className="text-sm font-semibold text-slate-200 cursor-pointer select-none block"
                      >
                        Show Public (Visible in Arena)
                      </label>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {game.isPublic
                          ? "This game is active and displayed to all duelists on the Arena page."
                          : "This game is hidden from duelists. Matchmaking queue will reject attempts."}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      id={`public-toggle-${game.gameId}`}
                      type="checkbox"
                      checked={Boolean(game.isPublic)}
                      onChange={(e) =>
                        handleFieldChange(game.gameId, "isPublic", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                </div>

                {/* 2. Rewards & Penalties Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Quantum Synergy Economics
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Win Reward Input */}
                    <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                      <label className="text-xs font-semibold text-emerald-400 flex items-center justify-between">
                        <span>Win Synergy Reward (+)</span>
                        <span className="text-[10px] font-mono text-slate-400">pts</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={game.winReward ?? 30}
                          onChange={(e) =>
                            handleFieldChange(
                              game.gameId,
                              "winReward",
                              Math.max(0, parseInt(e.target.value) || 0)
                            )
                          }
                          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm font-mono font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Added to the winner&apos;s total Quantum Synergy.
                      </p>
                    </div>

                    {/* Defeat Penalty Input */}
                    <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                      <label className="text-xs font-semibold text-rose-400 flex items-center justify-between">
                        <span>Defeat Penalty (−)</span>
                        <span className="text-[10px] font-mono text-slate-400">pts</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={game.defeatPenalty ?? 0}
                          onChange={(e) =>
                            handleFieldChange(
                              game.gameId,
                              "defeatPenalty",
                              Math.max(0, parseInt(e.target.value) || 0)
                            )
                          }
                          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm font-mono font-bold focus:outline-none focus:border-rose-500"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Deducted from loser&apos;s synergy (floored at 0).
                      </p>
                    </div>
                  </div>

                  {/* Optional Draw Reward for Trivia Duel */}
                  {isTrivia && (
                    <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                      <label className="text-xs font-semibold text-amber-300 flex items-center justify-between">
                        <span>Draw / Tie Reward</span>
                        <span className="text-[10px] font-mono text-slate-400">pts</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={game.drawReward ?? 5}
                        onChange={(e) =>
                          handleFieldChange(
                            game.gameId,
                            "drawReward",
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm font-mono font-bold focus:outline-none focus:border-amber-400"
                      />
                      <p className="text-[11px] text-slate-400">
                        Awarded to both players in the event of an equal score draw.
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Live Configuration Preview Chip */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-2 flex-wrap text-xs font-mono">
                  <span className="text-slate-400">Live Outcome:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">
                      🏆 Victory: +{game.winReward || 0} ⚡
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-rose-400 font-bold">
                      💀 Defeat: -{game.defeatPenalty || 0} ⚡
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer / Save Action */}
              <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-900/30 flex items-center justify-end">
                <button
                  onClick={() => handleSave(game)}
                  disabled={isSaving}
                  type="button"
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95 ${
                    isTrivia
                      ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
                      : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20"
                  } ${isSaving ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save Controls
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

