import React, { useState } from "react";
import { FilePlus, Loader2, Link2, Paperclip } from "lucide-react";

interface AddContentFormProps {
  onAdd: (urlOrFile: string | File) => Promise<void>;
  isGenerating: boolean;
}

const AddContentForm: React.FC<AddContentFormProps> = ({ onAdd, isGenerating }) => {
  const [mode, setMode] = useState<"url" | "pdf">("url");
  const [urlInput, setUrlInput] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleFileChange called");
    const selected = e.target.files?.[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("handleSubmit called");
    e.preventDefault();
    if (isGenerating) return;

    if (mode === "pdf" && file) {
      await onAdd(file);
      setFile(null);
      setUrlInput("");
    } else if (mode === "url" && urlInput.trim()) {
      await onAdd(urlInput.trim());
      setUrlInput("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 p-4 rounded-lg flex flex-wrap sm:flex-nowrap items-center gap-3 shadow-sm"
    >
      {/* Radio Buttons */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-1 text-sm">
          <input
            type="radio"
            name="mode"
            value="url"
            checked={mode === "url"}
            onChange={() => {
              setMode("url");
              setFile(null);
              setUrlInput("");
            }}
          />
          <Link2 className="w-4 h-4" />
          URL
        </label>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="radio"
            name="mode"
            value="pdf"
            checked={mode === "pdf"}
            onChange={() => {
              setMode("pdf");
              setUrlInput("");
            }}
          />
          <Paperclip className="w-4 h-4" />
          PDF
        </label>
      </div>

      {/* Input + Upload */}
      <div className="relative flex-1 min-w-[180px]">
        <input
          type="text"
          placeholder={mode === "pdf" ? "Choose a PDF file to skim..." : "Paste URL here to skim..."}
          value={mode === "pdf" && file ? file.name : urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          disabled={mode === "pdf" || isGenerating}
          readOnly={mode === "pdf" && !!file}
          className="w-full px-4 py-2 border rounded-md text-sm pr-12 bg-white cursor-text"
        />
        {mode === "pdf" && (
          <label className="absolute inset-y-0 right-2 flex items-center cursor-pointer">
            <Paperclip className="w-4 h-4 text-gray-500 hover:text-gray-700" />
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isGenerating}
        className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm text-white ${
          isGenerating ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Preparing your data to make Skim Ready....
          </>
        ) : (
          <>
            <FilePlus className="w-4 h-4" />
            Make Skim Ready
          </>
        )}
      </button>
    </form>
  );
};

export default AddContentForm;
