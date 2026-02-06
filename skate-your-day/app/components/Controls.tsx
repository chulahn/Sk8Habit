"use client";

import React from "react";

interface Props {
  handlePlay: () => void;
  handleReplay: () => void;
  canPlay: boolean;
  canReplay: boolean;
  handleReset: () => void;
  // Parent supplies the JSON text for export and a toggle to show/hide it
  exportJson: string;
  showExportJson: boolean;
  toggleExportJson: () => void;
  // Import handler accepts a parsed JSON object
  handleImportObject: (obj: any) => void;
}

export default function Controls({ handlePlay, handleReplay, canPlay, canReplay, handleReset, exportJson, showExportJson, toggleExportJson, handleImportObject }: Props) {
  const [text, setText] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // When parent toggles showing export JSON, populate textarea
  React.useEffect(() => {
    if (showExportJson) {
      setText(exportJson || "");
    }
  }, [showExportJson, exportJson]);

  const onImportClick = () => {
    try {
      const parsed = JSON.parse(text);
      handleImportObject(parsed);
    } catch (e) {
      alert("Invalid JSON in textbox.");
    }
  };

  const onSelectAll = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
    }
  };

  return (
    <>
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      <button
        onClick={handlePlay}
        disabled={!canPlay}
        className={`px-4 py-2 rounded-full font-semibold text-sm ${
          !canPlay
            ? "bg-slate-600/60 text-slate-900 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-900"
        }`}
      >
        ▶ Play Day
      </button>

      <button
        onClick={handleReplay}
        disabled={!canReplay}
        className={`px-4 py-2 rounded-full font-semibold text-sm ${
          !canReplay
            ? "bg-slate-700/60 text-slate-400 cursor-not-allowed"
            : "bg-gradient-to-r from-fuchsia-500 to-pink-400 text-slate-900"
        }`}
      >
        ↺ Replay
      </button>

      <button
        onClick={handleReset}
        className="px-4 py-2 rounded-full font-semibold text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
      >
        🔄 Reset
      </button>

      <button
        onClick={toggleExportJson}
        className="px-4 py-2 rounded-full font-semibold text-sm bg-green-700 hover:bg-green-600 text-slate-100 transition-colors"
      >
        {showExportJson ? "🔽 Hide JSON" : "📤 Show JSON"}
      </button>

      {showExportJson ? (
        <>
          <button
            onClick={onImportClick}
            className="px-4 py-2 rounded-full font-semibold text-sm bg-amber-700 hover:bg-amber-600 text-slate-100 transition-colors"
          >
            📥 Import From Textbox
          </button>
          <button
            onClick={onSelectAll}
            className="px-3 py-2 rounded-full font-semibold text-sm bg-slate-700 hover:bg-slate-600 text-slate-100 transition-colors"
          >
            Select All
          </button>
        </>
      ) : null}

      <span className="text-xs text-slate-400">Each tab is a separate day with its own skate line.</span>
    </div>
    {showExportJson ? (
      <div className="mt-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full min-h-[160px] p-2 bg-slate-900 text-slate-100 rounded-md text-xs font-mono"
        />
      </div>
    ) : null}
    </>
  );
}
