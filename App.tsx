import React, { useState, useEffect, useCallback } from 'react';
import { 
  Layout, 
  Save, 
  Code, 
  Plus, 
  Trash2, 
  Sidebar as SidebarIcon,
  Maximize2,
  Minimize2,
  Edit2,
  Eye,
  EyeOff,
  PlaySquare,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import CodeEditor from './components/CodeEditor';
import Compiler from './components/Compiler';
import { SavedFile } from './types';
import { DEFAULT_CODE } from './constants';

const App: React.FC = () => {
  // State
  const [files, setFiles] = useState<SavedFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [currentCode, setCurrentCode] = useState<string>("");
  const [compiledCode, setCompiledCode] = useState<string>(""); 
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // New UI States
  const [isCodeVisible, setIsCodeVisible] = useState(true);
  const [isPreviewFullScreen, setIsPreviewFullScreen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  
  // Presentation Mode State
  const [isPresenting, setIsPresenting] = useState(false);

  // Initialize
  useEffect(() => {
    const storedFiles = localStorage.getItem('react-visualizer-files');
    if (storedFiles) {
      const parsed = JSON.parse(storedFiles);
      setFiles(parsed);
      if (parsed.length > 0) {
        setActiveFileId(parsed[0].id);
        setCurrentCode(parsed[0].code);
        setCompiledCode(parsed[0].code);
      }
    } else {
      const newFile: SavedFile = {
        id: crypto.randomUUID(),
        name: 'Demo Radar Chart',
        code: DEFAULT_CODE,
        lastModified: Date.now(),
      };
      setFiles([newFile]);
      setActiveFileId(newFile.id);
      setCurrentCode(newFile.code);
      setCompiledCode(newFile.code);
      localStorage.setItem('react-visualizer-files', JSON.stringify([newFile]));
    }
  }, []);

  // Save functionality
  const handleSave = () => {
    if (!activeFileId) return;

    const updatedFiles = files.map(f => {
      if (f.id === activeFileId) {
        return { ...f, code: currentCode, lastModified: Date.now() };
      }
      return f;
    });

    setFiles(updatedFiles);
    localStorage.setItem('react-visualizer-files', JSON.stringify(updatedFiles));
    
    // Trigger compilation on save
    setCompiledCode(currentCode);
  };

  const handleCreateNew = () => {
    const newFile: SavedFile = {
      id: crypto.randomUUID(),
      name: `Untitled ${files.length + 1}`,
      code: `import React from 'react';\n\nconst NewComponent = () => {\n  return (\n    <div className="p-4">\n      <h1 className="text-xl font-bold">Hello World</h1>\n      <p>Start editing to see changes.</p>\n    </div>\n  );\n};\n\nexport default NewComponent;`,
      lastModified: Date.now(),
    };
    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    setActiveFileId(newFile.id);
    setCurrentCode(newFile.code);
    setCompiledCode(newFile.code);
    localStorage.setItem('react-visualizer-files', JSON.stringify(updatedFiles));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Ensure click doesn't bubble or trigger defaults
    
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    localStorage.setItem('react-visualizer-files', JSON.stringify(updatedFiles));

    // If we deleted the active file, switch to another
    if (activeFileId === id) {
      if (updatedFiles.length > 0) {
        setActiveFileId(updatedFiles[0].id);
        setCurrentCode(updatedFiles[0].code);
        setCompiledCode(updatedFiles[0].code);
      } else {
        setActiveFileId(null);
        setCurrentCode("");
        setCompiledCode("");
      }
    }
  };

  const handleSelectFile = (file: SavedFile) => {
    // If we are renaming, don't switch files (optional UX choice)
    if (renamingId) return;
    
    setActiveFileId(file.id);
    setCurrentCode(file.code);
    setCompiledCode(file.code);
  };

  // Renaming Logic
  const handleStartRename = (file: SavedFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(file.id);
    setRenameValue(file.name);
  };

  const handleSaveRename = () => {
    if (!renamingId) return;
    const updatedFiles = files.map(f => 
      f.id === renamingId ? { ...f, name: renameValue } : f
    );
    setFiles(updatedFiles);
    localStorage.setItem('react-visualizer-files', JSON.stringify(updatedFiles));
    setRenamingId(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveRename();
    if (e.key === 'Escape') setRenamingId(null);
  };

  // Presentation Logic
  const getCurrentSlideIndex = useCallback(() => {
    return files.findIndex(f => f.id === activeFileId);
  }, [files, activeFileId]);

  const goToSlide = (index: number) => {
    if (index >= 0 && index < files.length) {
      const file = files[index];
      setActiveFileId(file.id);
      setCurrentCode(file.code);
      setCompiledCode(file.code);
    }
  };

  const handleNextSlide = useCallback(() => {
    const idx = getCurrentSlideIndex();
    if (idx < files.length - 1) {
      goToSlide(idx + 1);
    }
  }, [getCurrentSlideIndex, files]);

  const handlePrevSlide = useCallback(() => {
    const idx = getCurrentSlideIndex();
    if (idx > 0) {
      goToSlide(idx - 1);
    }
  }, [getCurrentSlideIndex, files]);

  // Keyboard Shortcuts for Presentation
  useEffect(() => {
    if (!isPresenting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.key === 'Escape') {
        setIsPresenting(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, handleNextSlide, handlePrevSlide]);

  return (
    <div className="h-screen w-full bg-gray-900 text-white flex flex-col overflow-hidden font-sans">
      
      {/* Presentation Overlay */}
      {isPresenting && (
        <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col">
          {/* Main Stage */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden relative">
            {/* Background Hint (optional) */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black pointer-events-none"></div>

             <div className="w-full h-full max-w-[1920px] flex items-center justify-center relative z-10">
                {activeFileId && compiledCode ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Compiler code={compiledCode} />
                  </div>
                ) : (
                  <div className="text-gray-500">No Content</div>
                )}
             </div>
          </div>
          
          {/* Controls Overlay (appears on hover or fixed at bottom) */}
          <div className="h-16 bg-gray-900/80 backdrop-blur border-t border-gray-800 flex items-center justify-between px-6 shrink-0 z-20 transition-opacity duration-300">
             <div className="flex items-center gap-4">
                <span className="font-bold text-lg text-gray-200 truncate max-w-[300px]">
                  {files[getCurrentSlideIndex()]?.name}
                </span>
                <span className="text-gray-500 text-sm">
                  {getCurrentSlideIndex() + 1} / {files.length}
                </span>
             </div>

             <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrevSlide}
                  disabled={getCurrentSlideIndex() === 0}
                  className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={handleNextSlide}
                  disabled={getCurrentSlideIndex() === files.length - 1}
                  className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
             </div>

             <button 
               onClick={() => setIsPresenting(false)}
               className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-100 rounded transition-colors text-sm font-medium"
             >
               <X size={16} /> Exit
             </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-14 border-b border-gray-800 bg-gray-950 flex items-center px-4 justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-md">
            <Layout size={20} className="text-white" />
          </div>
          <h1 className="font-semibold text-lg tracking-tight hidden sm:block">React Visualizer</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
             onClick={() => setIsCodeVisible(!isCodeVisible)}
             className={`p-2 rounded hover:bg-gray-800 transition-colors ${!isCodeVisible ? 'text-blue-400 bg-gray-800' : 'text-gray-400'}`}
             title={isCodeVisible ? "Hide Code Editor" : "Show Code Editor"}
          >
            {isCodeVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Sidebar */}
        {!isPreviewFullScreen && (
          <aside 
            className={`
              ${sidebarOpen ? 'w-64' : 'w-0'} 
              bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 ease-in-out shrink-0
            `}
          >
            <div className="p-3 flex items-center justify-between border-b border-gray-800/50">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Files</span>
              <div className="flex items-center gap-1">
                 <button 
                   onClick={() => setIsPresenting(true)}
                   className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors"
                   title="Present (Slideshow Mode)"
                 >
                   <PlaySquare size={18} />
                 </button>
                 <button 
                   onClick={handleCreateNew} 
                   className="text-gray-400 hover:text-white p-1 rounded transition-colors" 
                   title="New File"
                 >
                   <Plus size={18} />
                 </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {files.map(file => (
                <div 
                  key={file.id}
                  onClick={() => handleSelectFile(file)}
                  className={`
                    group flex items-center justify-between px-3 py-2.5 rounded cursor-pointer text-sm
                    ${activeFileId === file.id ? 'bg-gray-800 text-blue-400' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}
                  `}
                >
                  {renamingId === file.id ? (
                    <input 
                      className="bg-gray-950 text-white px-1 py-0.5 rounded border border-blue-500 outline-none w-full text-sm"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={handleSaveRename}
                      onKeyDown={handleRenameKeyDown}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Code size={14} className="shrink-0" />
                        <span className="truncate select-none">{file.name}</span>
                      </div>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={(e) => handleStartRename(file, e)}
                          className="text-gray-500 hover:text-blue-400 p-1.5 hover:bg-gray-700 rounded mr-1"
                          title="Rename"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(file.id, e)}
                          className="text-gray-500 hover:text-red-400 p-1.5 hover:bg-gray-700 rounded"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {files.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-600">
                  No files yet. Click + to create one.
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Workspace */}
        <main className="flex-1 flex flex-col md:flex-row min-w-0 bg-[#1e1e1e] relative">
          
          {/* Sidebar Toggle (Desktop) */}
          {!isPreviewFullScreen && (
            <div className="hidden md:flex flex-col justify-end border-r border-gray-800 bg-gray-900 w-10 shrink-0 items-center pb-4 z-10">
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-gray-500 hover:text-gray-300 p-2 rounded transition-colors"
                  title={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                >
                  <SidebarIcon size={20} />
                </button>
            </div>
          )}

          {/* Sidebar Toggle (Mobile) */}
          {!isPreviewFullScreen && (
            <div className="absolute left-0 bottom-4 z-50 md:hidden">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="bg-gray-800 p-2 rounded-r shadow-lg text-gray-400"
              >
                <SidebarIcon size={16} />
              </button>
            </div>
          )}

          {/* Editor Pane */}
          {isCodeVisible && !isPreviewFullScreen && (
            <div className="flex-1 h-[50vh] md:h-auto md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-gray-700">
              <div className="h-9 bg-[#252526] flex items-center px-4 justify-between border-b border-[#1e1e1e] shrink-0">
                <span className="text-xs text-gray-400 font-mono flex items-center gap-2">
                  <Code size={12} /> CODE EDITOR
                </span>
                <div className="flex items-center gap-1">
                   <button 
                     onClick={handleSave}
                     className="flex items-center gap-1 text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-blue-600/50 transition-colors text-xs font-medium"
                     title="Run & Save"
                   >
                     <Save size={14} />
                     <span>Run & Save</span>
                   </button>
                   <div className="w-px h-4 bg-gray-700 mx-1"></div>
                   <button 
                     onClick={() => setIsCodeVisible(false)}
                     className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors"
                     title="Hide Editor"
                   >
                     <EyeOff size={14} />
                   </button>
                </div>
              </div>
              <div className="flex-1 relative overflow-hidden">
                {activeFileId ? (
                  <CodeEditor value={currentCode} onChange={setCurrentCode} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    Select or create a file to edit
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preview Pane */}
          <div 
            className={`
              flex flex-col bg-gray-50 transition-all duration-300
              ${isPreviewFullScreen ? 'fixed inset-0 z-50' : 'flex-1 h-[50vh] md:h-auto'}
              ${!isCodeVisible && !isPreviewFullScreen ? 'w-full' : ''}
              ${isCodeVisible && !isPreviewFullScreen ? 'md:w-1/2' : ''}
            `}
          >
             {!isPreviewFullScreen && (
               <div className="h-9 bg-white border-b border-gray-200 flex items-center px-4 justify-between shrink-0 shadow-sm z-10">
                 <span className="text-xs text-gray-500 font-bold tracking-wider flex items-center gap-2">
                   <Layout size={12} /> PREVIEW
                 </span>
                 <div className="flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-teal-400 mr-2" title="System Ready"></span>
                   
                   <button 
                     onClick={() => setIsPreviewFullScreen(!isPreviewFullScreen)}
                     className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
                     title="Fullscreen"
                   >
                     <Maximize2 size={16} />
                   </button>
                 </div>
              </div>
             )}
            
            <div className={`flex-1 overflow-auto custom-scrollbar relative ${isPreviewFullScreen ? 'p-0' : 'p-4'}`}>
               {!isPreviewFullScreen && (
                 <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                      style={{ 
                        backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
                        backgroundSize: '20px 20px' 
                      }}
                 ></div>
               )}
               
               <div className={`relative z-10 min-h-full flex flex-col ${isPreviewFullScreen ? 'bg-white p-8' : ''}`}>
                 {activeFileId && compiledCode ? (
                   <div className={`${isPreviewFullScreen ? 'flex-1 flex items-center justify-center' : ''}`}>
                      <div className={`${isPreviewFullScreen ? 'w-full h-full' : 'w-full'}`}>
                         <Compiler code={compiledCode} />
                      </div>
                   </div>
                 ) : (
                   <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                     Nothing to render
                   </div>
                 )}
               </div>

               {/* Fullscreen Exit Button (if in manual fullscreen, not presentation mode) */}
               {isPreviewFullScreen && (
                 <button 
                   onClick={() => setIsPreviewFullScreen(false)}
                   className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 p-2 rounded-full shadow-md z-50 text-gray-700 transition-colors"
                 >
                   <Minimize2 size={20} />
                 </button>
               )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default App;