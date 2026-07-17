import { useState, useRef, useEffect } from 'react';
import { useMyResume, useSaveResume, useUploadResume, ResumeAnalysis } from '../api/useResumes';
import { Loader2, Save, Upload, User, Code } from 'lucide-react';
import toast from 'react-hot-toast';

export function ResumeBuilder() {
  const { data: resume, isLoading } = useMyResume();
  const saveResumeMutation = useSaveResume();
  const uploadResumeMutation = useUploadResume();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [analysis, setAnalysis] = useState<ResumeAnalysis>({
    summary: '',
    extractedSkills: [],
    education: [],
    experience: [],
    projects: []
  });

  useEffect(() => {
    if (resume?.analysis) {
      setAnalysis(resume.analysis);
    }
  }, [resume]);

  const handleSave = async () => {
    try {
      await saveResumeMutation.mutateAsync({ analysis });
      toast.success('Profile saved successfully');
    } catch (error) {
      toast.error('Failed to save profile');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    try {
      await uploadResumeMutation.mutateAsync(file);
      toast.success('Resume uploaded and analyzed successfully!');
    } catch (error) {
      toast.error('Failed to upload resume');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      if (!analysis.extractedSkills?.includes(val)) {
        setAnalysis(prev => ({
          ...prev,
          extractedSkills: [...(prev.extractedSkills || []), val]
        }));
      }
      e.currentTarget.value = '';
    }
  };

  const removeSkill = (skill: string) => {
    setAnalysis(prev => ({
      ...prev,
      extractedSkills: prev.extractedSkills?.filter(s => s !== skill)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center bg-base-surface p-6 rounded-xl border border-base-border">
        <div>
          <h2 className="text-2xl font-bold text-ink">Resume & Profile</h2>
          <p className="text-ink-muted text-sm mt-1">Keep your profile updated to get matched with the best roles.</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            accept=".pdf" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadResumeMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 border border-base-border rounded-lg text-ink font-medium hover:bg-base-background transition-colors disabled:opacity-50"
          >
            {uploadResumeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploadResumeMutation.isPending ? 'Analyzing...' : 'Upload PDF'}
          </button>
          <button 
            onClick={handleSave}
            disabled={saveResumeMutation.isPending}
            className="flex items-center gap-2 bg-primary shadow-neon text-white px-4 py-2 rounded-lg font-medium hover:bg-primary shadow-neon-hover transition-colors disabled:opacity-50"
          >
            {saveResumeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Summary */}
          <div className="bg-base-surface p-6 rounded-xl border border-base-border space-y-4">
            <div className="flex items-center gap-2 text-lg font-bold text-ink">
              <User className="w-5 h-5 text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]" />
              Professional Summary
            </div>
            <textarea
              className="w-full bg-base-background border border-base-border rounded-lg px-4 py-3 text-ink focus:outline-none focus:border-primary min-h-[120px]"
              placeholder="Write a short summary about your professional background and goals..."
              value={analysis.summary || ''}
              onChange={e => setAnalysis(prev => ({ ...prev, summary: e.target.value }))}
            />
          </div>

          {/* Skills */}
          <div className="bg-base-surface p-6 rounded-xl border border-base-border space-y-4">
            <div className="flex items-center gap-2 text-lg font-bold text-ink">
              <Code className="w-5 h-5 text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]" />
              Technical Skills
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {analysis.extractedSkills?.map(skill => (
                <span key={skill} className="px-3 py-1 bg-primary/10 text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)] rounded-full text-sm font-medium flex items-center gap-2">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-red-500">×</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Type a skill and press Enter..."
              className="w-full bg-base-background border border-base-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-primary"
              onKeyDown={handleSkillAdd}
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-base-surface p-6 rounded-xl border border-base-border space-y-4">
            <h3 className="font-bold text-ink mb-2">Profile Strength</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink-muted">ATS Score</span>
                  <span className="font-bold text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]">{resume?.analysis?.atsScore || 0}/100</span>
                </div>
                <div className="h-2 bg-base-background rounded-full overflow-hidden">
                  <div className="h-full bg-primary shadow-neon" style={{ width: `${resume?.analysis?.atsScore || 0}%` }}></div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-ink mb-2">Missing Recommended Skills</p>
                <div className="flex flex-wrap gap-2">
                  {resume?.analysis?.missingSkills?.map(skill => (
                    <span key={skill} className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-md">
                      {skill}
                    </span>
                  )) || <span className="text-sm text-ink-muted">Upload a resume to get AI insights.</span>}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-base-surface p-6 rounded-xl border border-base-border">
            <p className="text-sm text-ink-muted italic">
              Note: Full Education and Experience sections are currently mocked for this MVP profile builder. Add a real PDF to extract actual timeline data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
