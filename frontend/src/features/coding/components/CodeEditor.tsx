import Editor, { useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
  height?: string;
  readOnly?: boolean;
}

export function CodeEditor({ language, value, onChange, height = '400px', readOnly = false }: CodeEditorProps) {
  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('hireai-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#1e1e24',
        },
      });
      monaco.editor.setTheme('hireai-dark');
    }
  }, [monaco]);

  const mapLanguage = (lang: string) => {
    if (lang === 'node' || lang === 'javascript') return 'javascript';
    if (lang === 'python') return 'python';
    if (lang === 'cpp') return 'cpp';
    if (lang === 'java') return 'java';
    return lang;
  };

  return (
    <div className="border border-base-border rounded-lg overflow-hidden">
      <Editor
        height={height}
        language={mapLanguage(language)}
        theme="hireai-dark"
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'Consolas, monospace',
          readOnly,
          padding: { top: 16 },
          scrollBeyondLastLine: false,
        }}
        loading={<div className="flex justify-center items-center h-full text-ink-muted">Loading editor...</div>}
      />
    </div>
  );
}
