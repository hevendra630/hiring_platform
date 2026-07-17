import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/apiClient';
import { useLogProctoringEvent } from '../api/useInterviews';
import { Send, Bot, User, ArrowLeft, Loader2, Mic, MicOff, Volume2, VolumeX, Timer, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function InterviewChat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your AI interviewer today. Whenever you are ready, please say hello.' }
  ]);
  const [input, setInput] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const logProctoring = useLogProctoringEvent();

  // Voice State
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Timer State
  const [timeLeft, setTimeLeft] = useState(60);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, interimTranscript]);

  // Proctoring: Detect Tab Switch
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setShowWarning(true);
        if (id) {
          logProctoring.mutate({
            id,
            type: 'tab_switch',
            details: 'Candidate left the interview tab'
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [id, logProctoring]);

  // Init Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // keep listening until stopped manually
      recognition.interimResults = true; // show partial results immediately
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        let final = '';
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (final) {
          setInput((prev) => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + final);
        }
        setInterimTranscript(interim);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
        setInterimTranscript('');
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        setInterimTranscript('');
        if (event.error !== 'no-speech') {
           toast.error('Microphone error: ' + event.error);
        }
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      setInterimTranscript('');
    } else {
      if (!recognitionRef.current) {
        toast.error('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
        return;
      }
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const speak = (text: string) => {
    if (!isVoiceMode) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
    if (englishVoice) utterance.voice = englishVoice;
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!id) return;
    
    setInput('');
    setInterimTranscript('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await apiClient.post(`/interviews/${id}/chat`, { message: userMessage });
      const reply = response.data.data.reply;
      
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      speak(reply);
      
    } catch (error) {
      toast.error('Failed to send message. Make sure the interview is in progress.');
      setMessages(prev => [...prev, { role: 'system', content: 'Error: Could not connect to AI service.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [id, isVoiceMode]);

  const handleSend = () => {
    const textToSend = input.trim() || interimTranscript.trim();
    if (!textToSend || !id) return;
    
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
    
    sendMessage(textToSend);
  };

  const handleTimeOut = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
    const userMessage = input.trim() || interimTranscript.trim() || "(Time expired, no answer provided)";
    sendMessage(userMessage);
  }, [input, interimTranscript, isRecording, sendMessage]);

  // Timer Effect
  useEffect(() => {
    if (isLoading) return; // Freeze timer while waiting for AI reply

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, handleTimeOut]);

  // Reset timer when messages change (specifically when AI sends a new message)
  useEffect(() => {
    setTimeLeft(60);
  }, [messages.length]);

  const handleComplete = async () => {
    if (!id) return;
    try {
      window.speechSynthesis.cancel();
      if (isRecording) recognitionRef.current?.stop();
      await apiClient.put(`/interviews/${id}/status`, { status: 'completed' });
      toast.success('Interview completed!');
      navigate('/candidate/interviews');
    } catch (error) {
      toast.error('Failed to complete interview');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-50 relative">
      {showWarning && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 shadow-neon text-white p-3 text-center z-50 flex items-center justify-center gap-2 font-medium shadow-md">
          <AlertTriangle className="w-5 h-5" />
          Warning: We detected that you left the interview tab. This action has been recorded.
          <button 
            onClick={() => setShowWarning(false)}
            className="ml-4 bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/candidate/interviews')} className="text-neutral-500 hover:text-neutral-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-neutral-900 hidden sm:block">AI Interview</h1>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={`flex items-center gap-2 font-mono font-bold px-3 py-1.5 rounded-lg border ${
            timeLeft <= 10 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-neutral-50 border-neutral-200 text-neutral-700'
          }`}>
            <Timer className="w-4 h-4" />
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </div>
          <button
            onClick={() => setIsVoiceMode(!isVoiceMode)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              isVoiceMode ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
            title="Toggle AI Voice"
          >
            {isVoiceMode ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="hidden sm:inline">{isVoiceMode ? 'Voice On' : 'Voice Off'}</span>
          </button>
          <button 
            onClick={handleComplete}
            className="bg-red-50 border border-red-100 text-red-600 px-4 py-1.5 rounded-lg font-medium hover:bg-red-100 transition-colors"
          >
            End
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'assistant' ? 'bg-red-100 text-red-600' : 
              msg.role === 'user' ? 'bg-neutral-200 text-neutral-600' : 'bg-red-100 text-red-600'
            }`}>
              {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : 
               msg.role === 'user' ? <User className="w-5 h-5" /> : null}
            </div>
            
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
              msg.role === 'user' ? 'bg-red-600 shadow-neon text-white' : 
              msg.role === 'assistant' ? 'bg-white border border-neutral-200 text-neutral-800 shadow-sm' :
              'bg-red-50 text-red-800 text-sm italic'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div className="bg-white border border-neutral-200 rounded-2xl px-5 py-3 flex items-center gap-2 text-neutral-500 shadow-sm">
              <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t p-4 relative">
        {interimTranscript && (
          <div className="absolute -top-10 left-0 right-0 text-center pointer-events-none">
            <span className="bg-black/70 text-white px-4 py-1.5 rounded-full text-sm inline-flex items-center gap-2 shadow-lg backdrop-blur-sm animate-pulse">
              <Mic className="w-3 h-3 text-red-400" />
              {interimTranscript}
            </span>
          </div>
        )}
        <div className="max-w-4xl mx-auto flex gap-4">
          <button
            onClick={toggleRecording}
            className={`p-3 rounded-xl transition-colors flex items-center justify-center h-[50px] w-[50px] flex-shrink-0 ${
              isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isRecording ? "Listening..." : "Type your response or click the microphone to speak... (Press Enter to send)"}
            className="flex-1 resize-none bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[50px] max-h-[150px]"
            rows={1}
          />
          <button 
            onClick={handleSend}
            disabled={(!input.trim() && !interimTranscript.trim()) || isLoading}
            className="bg-red-600 shadow-neon text-white p-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center self-end h-[50px] w-[50px] flex-shrink-0 shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
