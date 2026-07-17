import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient as api } from '@/services/apiClient';
import { ArrowLeft, User, FileText, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export function JobApplications() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, appsRes] = await Promise.all([
          api.get(`/jobs/${id}`),
          api.get(`/applications/job/${id}`)
        ]);
        setJob(jobRes.data.data);
        setApplications(appsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch applications', error);
        toast.error('Could not load applications');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    setUpdating(applicationId);
    try {
      await api.put(`/applications/${applicationId}/status`, { status: newStatus });
      setApplications(apps => 
        apps.map(app => app._id === applicationId ? { ...app, status: newStatus } : app)
      );
      toast.success('Status updated');
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-neutral-500">Loading applications...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <button onClick={() => navigate('/recruiter')} className="flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-700 mb-6">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Applications for {job?.title}</h1>
        <p className="text-neutral-600 mt-1">{applications.length} total applicants</p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-neutral-200">
        <ul className="divide-y divide-neutral-200">
          {applications.length === 0 ? (
            <li className="px-6 py-12 text-center text-neutral-500">
              No applications yet.
            </li>
          ) : (
            applications.map((app) => (
              <li key={app._id} className="p-6 hover:bg-neutral-50 transition-colors duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {app.candidate?.avatarUrl ? (
                        <img className="h-12 w-12 rounded-full" src={app.candidate.avatarUrl} alt="" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-neutral-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-neutral-500" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-neutral-900">{app.candidate?.name || 'Unknown Candidate'}</h3>
                      <div className="mt-1 flex items-center text-sm text-neutral-500">
                        <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-neutral-400" />
                        <p>Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                      </div>
                      
                      {app.resume && (
                        <div className="mt-2 text-sm text-neutral-600 flex items-center gap-4">
                          <a 
                            href={app.resume.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-red-600 hover:text-red-800"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Resume
                          </a>
                          
                          {app.resume.analysis?.atsScore !== undefined && (
                            <span className="font-medium text-neutral-700">
                              ATS Score: <span className={app.resume.analysis.atsScore >= 75 ? 'text-green-600' : 'text-yellow-600'}>{app.resume.analysis.atsScore}%</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0 flex flex-col items-end gap-2">
                    <label className="text-xs text-neutral-500 font-medium uppercase">Status</label>
                    <select
                      value={app.status}
                      disabled={updating === app._id}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      className={`block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md 
                        ${app.status === 'applied' ? 'bg-red-50 text-red-700' : 
                          app.status === 'reviewing' ? 'bg-yellow-50 text-yellow-700' : 
                          app.status === 'rejected' ? 'bg-red-50 text-red-700' : 
                          'bg-green-50 text-green-700'}`}
                    >
                      <option value="applied">Applied</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offered">Offered</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
