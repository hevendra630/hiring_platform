import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Eye } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { io } from 'socket.io-client';

export function RecruiterShadow() {
  const { problemId, candidateId } = useParams<{ problemId: string, candidateId: string }>();
  const [searchParams] = useSearchParams();
  const interviewId = searchParams.get('interviewId');
  const navigate = useNavigate();
  const [sourceCode, setSourceCode] = useState<string>('// Waiting for candidate to start typing...');

  useEffect(() => {
    // socket.io initialized via static import
    const socket = io('http://localhost:3000');
    
    const roomId = interviewId ? `room_interview_${interviewId}` : `room_coding_${problemId}_${candidateId}`;
    socket.emit('join_interview', roomId);

    socket.on('code_update', (code: string) => {
      setSourceCode(code);
    });

    return () => {
      socket.disconnect();
    };
  }, [problemId, candidateId, interviewId]);

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-neutral-200">
      <div className="h-14 border-b border-neutral-800 flex items-center justify-between px-4 bg-[#1a1a1a]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="hover:text-white flex items-center">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>
          <div className="h-6 w-px bg-neutral-700"></div>
          <div className="flex items-center gap-2 text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]">
            <Eye className="w-5 h-5" />
            <h1 className="font-semibold">Live Shadow Mode</h1>
          </div>
        </div>
        <div className="text-sm text-neutral-400">
          Spectating Candidate ID: {candidateId}
        </div>
      </div>
      <div className="flex-1 p-4 flex flex-col">
        <div className="mb-4 text-sm text-neutral-400">
          This is a read-only view of the candidate's coding workspace in real-time.
        </div>
        <div className="flex-1 border border-neutral-800 rounded-xl overflow-hidden pointer-events-none">
          <CodeEditor 
            language="javascript"
            value={sourceCode}
            onChange={() => {}}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
