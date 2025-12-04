import React, { useEffect, useState, useRef } from 'react';
import * as Recharts from 'recharts';
import * as LucideReact from 'lucide-react';
// Note: Framer Motion and Lodash are loaded via importmap/global in this environment if used, 
// but strictly speaking for this Compiler component to inject them, we need them available.
// Since we can't easily dynamic import standard modules in this Babel transform setup without complex logic,
// we focus on React/Recharts/Lucide which are the core request.
// However, the iframe logic below improves general HTML support significantly.

interface CompilerProps {
  code: string;
}

const Compiler: React.FC<CompilerProps> = ({ code }) => {
  const [Component, setComponent] = useState<React.ElementType | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to hold the current code to avoid stale closures in error handling if needed
  const codeRef = useRef(code);
  codeRef.current = code;

  useEffect(() => {
    const compile = () => {
      try {
        setError(null);
        setComponent(null);
        setHtmlContent(null);
        
        const trimmedCode = code.trim();
        
        if (!trimmedCode) {
           return;
        }
        
        // 1. DETECT HTML CONTENT
        // If the code looks like a full HTML document, render it in an iframe
        if (trimmedCode.toLowerCase().startsWith('<!doctype html') || trimmedCode.toLowerCase().startsWith('<html')) {
           // Inject Tailwind if not present to support "all styles" better
           let finalHtml = code;
           if (!finalHtml.includes('cdn.tailwindcss.com')) {
               finalHtml = finalHtml.replace('<head>', '<head><script src="https://cdn.tailwindcss.com"></script>');
           }
           setHtmlContent(finalHtml);
           return;
        }

        // 2. PRE-PROCESSING FOR REACT
        let processedCode = code;
        let injectedDestructuring = '';

        // Helper to extract destructuring
        const extractImports = (sourceLib: string, destVariable: string) => {
           const regex = new RegExp(`import\\s+(?:[\\w*\\s]+\\s*,\\s*)?{([^}]+)}\\s+from\\s+['"]${sourceLib}['"];?`, 'g');
           let match;
           while ((match = regex.exec(code)) !== null) {
             injectedDestructuring += `const { ${match[1]} } = ${destVariable};\n`;
           }
        };

        // Extract Recharts imports
        extractImports('recharts', 'Recharts');
        
        // Extract React imports (hooks, etc.)
        extractImports('react', 'React');
        
        // Extract Lucide imports
        extractImports('lucide-react', 'Lucide');

        // Remove all import statements
        processedCode = processedCode.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');

        // Handle "export default"
        const defaultExportVar = '__react_visualizer_default_export__';
        const hasDefaultExport = /export\s+default\s+/.test(processedCode);
        
        if (hasDefaultExport) {
          processedCode = processedCode.replace(/export\s+default\s+/g, `const ${defaultExportVar} = `);
        }
        
        // Handle named exports
        processedCode = processedCode.replace(/export\s+/g, '');

        // 3. TRANSPILATION
        // @ts-ignore
        if (!window.Babel) {
          throw new Error("Babel is not loaded. Check internet connection.");
        }

        // @ts-ignore
        const result = window.Babel.transform(processedCode, {
          presets: ['react', 'env'],
          filename: 'dynamic.js'
        });

        // 4. EXECUTION
        let finalCode = `${injectedDestructuring}\n${result.code}`;
        if (hasDefaultExport) {
          finalCode += `\nreturn ${defaultExportVar};`;
        }

        const createComponent = new Function(
          'React', 
          'Recharts', 
          'Lucide', 
          finalCode
        );

        const Generated = createComponent(React, Recharts, LucideReact);

        if (!Generated) {
           throw new Error("No component was returned. Ensure you have 'export default YourComponent;' at the end of your code.");
        }
        
        // Handle case where export default is a Component Function vs a React Element (JSX)
        if (typeof Generated === 'function') {
           setComponent(() => Generated);
        } else if (React.isValidElement(Generated)) {
           setComponent(() => () => Generated);
        } else {
           throw new Error("The exported value is not a valid React component or element.");
        }

      } catch (err: any) {
        console.error("Compilation Error:", err);
        setError(err.message || "Unknown error occurred during compilation");
      }
    };

    compile();

  }, [code]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 overflow-auto">
        <h3 className="font-bold mb-2 flex items-center">
          <LucideReact.AlertTriangle className="w-5 h-5 mr-2" />
          Compilation Error
        </h3>
        <pre className="whitespace-pre-wrap font-mono text-sm">{error}</pre>
      </div>
    );
  }

  // Render Raw HTML if detected
  if (htmlContent) {
    return (
      <iframe 
        title="HTML Preview"
        srcDoc={htmlContent}
        className="w-full h-full border-0 bg-white"
        sandbox="allow-scripts allow-modals allow-same-origin"
      />
    );
  }

  if (!Component) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Preparing preview...
      </div>
    );
  }

  return (
    <ErrorBoundary>
       <Component />
    </ErrorBoundary>
  );
};

// Simple Error Boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Runtime Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-900 overflow-auto">
          <h3 className="font-bold mb-2">Runtime Error</h3>
          <p className="mb-2 text-sm">The code compiled, but crashed during rendering.</p>
          <pre className="whitespace-pre-wrap font-mono text-xs p-2 bg-orange-100 rounded">
            {this.state.error?.message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default Compiler;