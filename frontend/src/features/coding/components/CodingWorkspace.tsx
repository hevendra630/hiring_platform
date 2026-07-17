import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CodeEditor } from './CodeEditor';
import { useGetProblem, useSubmitCode, Submission } from '../api/useCoding';
import { Play, Send, ChevronLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { io } from 'socket.io-client';
export function CodingWorkspace() {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();
  const { data: problem, isLoading } = useGetProblem(problemId || '');
  const submitCodeMutation = useSubmitCode();

  const [language, setLanguage] = useState<string>('javascript');
  const [sourceCode, setSourceCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'testResults'>('description');
  const [lastSubmission, setLastSubmission] = useState<Submission | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (problem && problem.starterCode) {
      const code = (problem.starterCode as any)[language];
      if (code && !sourceCode) {
        setSourceCode(code);
      }
    }
  }, [problem, language]);

  const [searchParams] = useSearchParams();
  const interviewId = searchParams.get('interviewId');

  // Socket.io for Collaborative Sandbox
  useEffect(() => {
    if (!user || user.role !== 'candidate') return;
    // Socket instance created with imported io
    const socket = io('http://localhost:3000'); // Assuming backend is on 3000
    
    // Use interviewId if available, otherwise problemId + userId
    const roomId = interviewId ? `room_interview_${interviewId}` : `room_coding_${problemId}_${user._id}`;
    socket.emit('join_interview', roomId);

    socket.emit('code_change', { interviewId: roomId, code: sourceCode });

    return () => {
      socket.disconnect();
    };
  }, [sourceCode, problemId, user, interviewId]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (problem && problem.starterCode) {
      const code = (problem.starterCode as any)[newLang];
      if (code) {
        setSourceCode(code);
      }
    }
  };

  const handleRun = async () => {
    if (!problemId) return;
    try {
      const result = await submitCodeMutation.mutateAsync({
        problemId,
        language,
        sourceCode,
        isFinal: false,
      });
      setLastSubmission(result);
      setActiveTab('testResults');
      toast.success('Code executed');
    } catch (error) {
      toast.error('Failed to run code');
    }
  };

  const handleSubmit = async () => {
    if (!problemId) return;
    try {
      const result = await submitCodeMutation.mutateAsync({
        problemId,
        language,
        sourceCode,
        isFinal: true,
      });
      setLastSubmission(result);
      setActiveTab('testResults');
      
      if (result.status === 'accepted') {
        toast.success('All test cases passed!');
      } else {
        toast.error(`Submission failed: ${result.status.replace(/_/g, ' ')}`);
      }
    } catch (error) {
      toast.error('Failed to submit code');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading workspace...</div>;
  }

  if (!problem) {
    return <div className="p-8 text-center text-red-500">Problem not found</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-neutral-200">
      {/* Header */}
      <div className="h-14 border-b border-neutral-800 flex items-center justify-between px-4 bg-[#1a1a1a]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="hover:text-white flex items-center">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>
          <div className="h-6 w-px bg-neutral-700"></div>
          <h1 className="font-semibold">{problem.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={language}
            onChange={handleLanguageChange}
            className="bg-[#2d2d2d] border-none text-sm rounded px-3 py-1.5 focus:ring-1 focus:ring-red-500"
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
          <button 
            onClick={handleRun}
            disabled={submitCodeMutation.isPending}
            className="flex items-center gap-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-neutral-200 px-4 py-1.5 rounded transition-colors disabled:opacity-50 text-sm"
          >
            <Play className="w-4 h-4" /> Run
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitCodeMutation.isPending}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded transition-colors disabled:opacity-50 text-sm"
          >
            <Send className="w-4 h-4" /> Submit
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="w-1/3 min-w-[300px] border-r border-neutral-800 flex flex-col bg-[#1a1a1a]">
          <div className="flex border-b border-neutral-800 text-sm">
            <button 
              className={`px-4 py-3 border-b-2 ${activeTab === 'description' ? 'border-red-500 text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`px-4 py-3 border-b-2 ${activeTab === 'testResults' ? 'border-red-500 text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'}`}
              onClick={() => setActiveTab('testResults')}
            >
              Test Results
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'description' ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      problem.difficulty === 'easy' ? 'bg-green-900/50 text-green-400' :
                      problem.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-red-900/50 text-red-400'
                    }`}>
                      {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                    </span>
                  </div>
                  <div className="prose prose-invert max-w-none text-sm text-neutral-300 whitespace-pre-wrap">
                    {problem.description}
                  </div>
                </div>
                
                {problem.sampleTestCases?.length > 0 && (
                  <div>
                    <h3 className="text-white font-medium mb-3">Examples</h3>
                    <div className="space-y-4">
                      {problem.sampleTestCases.map((tc, idx) => (
                        <div key={idx} className="bg-[#2a2a2a] p-4 rounded text-sm font-mono space-y-2">
                          <div><span className="text-neutral-400">Input:</span> {tc.input}</div>
                          <div><span className="text-neutral-400">Output:</span> {tc.expectedOutput}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {problem.constraints?.length > 0 && (
                  <div>
                    <h3 className="text-white font-medium mb-3">Constraints</h3>
                    <ul className="list-disc pl-5 text-sm text-neutral-300 space-y-1">
                      {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {!lastSubmission ? (
                  <div className="text-center text-neutral-500 mt-10">Run or Submit your code to see results here.</div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <span className={`px-3 py-1 rounded text-sm font-medium ${
                        lastSubmission.status === 'accepted' ? 'bg-green-900/50 text-green-400' :
                        'bg-red-900/50 text-red-400'
                      }`}>
                        {lastSubmission.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      {lastSubmission.executionTimeMs && (
                        <span className="text-neutral-400 text-sm flex items-center">
                          <Clock className="w-4 h-4 mr-1" /> {lastSubmission.executionTimeMs}ms
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {lastSubmission.testCaseResults.map((tc, idx) => (
                        <div key={idx} className={`border rounded p-4 ${tc.passed ? 'border-green-900 bg-green-900/10' : 'border-red-900 bg-red-900/10'}`}>
                          <div className="flex items-center gap-2 mb-3">
                            {tc.passed ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                            <span className="font-medium text-neutral-200">
                              {tc.isHidden ? `Hidden Test Case ${idx + 1}` : `Test Case ${idx + 1}`}
                            </span>
                          </div>
                          
                          {tc.errorMessage ? (
                            <div className="text-sm text-red-400 font-mono whitespace-pre-wrap bg-red-950/30 p-2 rounded">
                              {tc.errorMessage}
                            </div>
                          ) : !tc.isHidden ? (
                            <div className="space-y-2 text-sm font-mono">
                              <div className="flex flex-col">
                                <span className="text-neutral-400">Output:</span>
                                <span className="text-neutral-200 break-all">{tc.output || 'null'}</span>
                              </div>
                              {!tc.passed && (
                                <div className="flex flex-col">
                                  <span className="text-neutral-400">Expected:</span>
                                  <span className="text-green-400 break-all">{tc.expectedOutput}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            !tc.passed && <div className="text-sm text-red-400">Hidden test case failed.</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Editor */}
        <div className="flex-1 flex flex-col bg-[#1e1e24] p-2">
          <CodeEditor 
            language={language}
            value={sourceCode}
            onChange={(val) => setSourceCode(val || '')}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
