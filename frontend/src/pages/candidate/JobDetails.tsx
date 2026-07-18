import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient as api } from '@/services/apiClient';
import { MapPin, Briefcase, DollarSign, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false); // To track if candidate already applied

  useEffect(() => {
    const fetchJobAndApplicationStatus = async () => {
      try {
        const jobResponse = await api.get(`/jobs/${id}`);
        setJob(jobResponse.data.data);
        
        // Check if user has already applied
        try {
          const appResponse = await api.get('/applications/my-applications');
          const applications = appResponse.data.data;
          const alreadyApplied = applications.some((app: any) => app.job._id === id);
          setHasApplied(alreadyApplied);
        } catch (e) {
          console.error('Could not fetch applications', e);
        }
      } catch (error) {
        console.error('Failed to fetch job details', error);
        toast.error('Could not load job details');
        navigate('/candidate/jobs');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchJobAndApplicationStatus();
    }
  }, [id, navigate]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post('/applications/apply', { jobId: id });
      toast.success('Successfully applied to job!');
      setHasApplied(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply to job. Make sure you have an active resume.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-neutral-500">Loading job details...</div>;
  }

  if (!job) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <button onClick={() => navigate('/candidate/jobs')} className="flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-700 mb-6">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Jobs
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {job.company?.logoUrl && (
                <img src={job.company.logoUrl} alt={job.company.name} className="h-16 w-16 rounded border border-neutral-100 object-cover" />
              )}
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">{job.title}</h1>
                <p className="text-lg font-medium text-red-600 mt-1">{job.companyName || 'Company Name'}</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              {hasApplied ? (
                <div className="flex items-center text-green-600 font-medium py-2 px-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Applied
                </div>
              ) : (
                <button 
                  className="bg-red-600 shadow-neon hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70"
                  onClick={handleApply} 
                  disabled={applying}
                >
                  {applying ? 'Applying...' : 'Apply Now'}
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-sm text-neutral-700 pb-8 border-b border-neutral-100">
            <div className="flex items-center bg-neutral-50 px-3 py-1.5 rounded-full border border-neutral-200">
              <MapPin className="h-4 w-4 text-neutral-500 mr-2"/>
              {job.isRemote ? 'Remote' : job.location}
            </div>
            <div className="flex items-center bg-neutral-50 px-3 py-1.5 rounded-full border border-neutral-200">
              <Briefcase className="h-4 w-4 text-neutral-500 mr-2"/>
              {job.employmentType}
            </div>
            {(job.salaryMin || job.salaryMax) && (
              <div className="flex items-center bg-neutral-50 px-3 py-1.5 rounded-full border border-neutral-200">
                <DollarSign className="h-4 w-4 text-neutral-500 mr-2"/>
                {job.salaryMin ? `$${job.salaryMin / 1000}k` : ''} - {job.salaryMax ? `$${job.salaryMax / 1000}k` : ''}
              </div>
            )}
          </div>

          <div className="mt-8 prose prose-blue max-w-none">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">About the Role</h2>
            <div className="text-neutral-700 whitespace-pre-wrap">{job.description}</div>
            
            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-neutral-900 mt-8 mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill: string) => (
                    <span key={skill} className="px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}

            {job.niceToHaveSkills && job.niceToHaveSkills.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-neutral-900 mt-8 mb-4">Nice to Have</h3>
                <div className="flex flex-wrap gap-2">
                  {job.niceToHaveSkills.map((skill: string) => (
                    <span key={skill} className="px-3 py-1 rounded-full text-sm font-medium bg-neutral-50 text-neutral-700 border border-neutral-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}
            
            <div className="mt-8 pt-6 border-t border-neutral-100 text-sm text-neutral-500 flex justify-between">
              <span>Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
              <span>{job.applicantsCount} applicants</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
