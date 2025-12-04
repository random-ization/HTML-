import React from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange }) => {
  return (
    <div className="w-full h-full flex flex-col relative group">
      <textarea
        className="w-full h-full bg-[#1e1e1e] text-gray-200 font-mono text-sm p-4 resize-none focus:outline-none custom-scrollbar leading-relaxed"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
      />
      <div className="absolute top-2 right-4 text-xs text-gray-500 bg-black/50 px-2 py-1 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        Editor (React + Recharts)
      </div>
    </div>
  );
};

export default CodeEditor;
