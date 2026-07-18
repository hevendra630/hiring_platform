import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient as api } from '@/services/apiClient';
import { Search, MapPin, Briefcase, DollarSign } from 'lucide-react';

// For MVP, we define simple type here if not exported from a shared place
interface IJob {
  _id: string;
  title: string;
  company: { _id: string; name: string; logoUrl?: string };
  location: string;
  isRemote: boolean;
  employmentType: string;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  requiredSkills: string[];
}

export function JobsList() {
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs/published');
        setJobs(response.data.data);
      } catch (error) {
        console.error('Failed to fetch jobs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-neutral-500">Loading jobs...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Explore Opportunities</h1>
          <p className="text-neutral-600 mt-1">Find your next technical role</p>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:placeholder-neutral-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Search jobs..."
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-neutral-200">
            <Briefcase className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900">No jobs found</h3>
            <p className="text-neutral-500">Check back later for new opportunities.</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job._id} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-900 truncate">{job.title}</h3>
                    <p className="text-sm font-medium text-red-600 mt-1">{job.companyName || 'Company Name'}</p>
                  </div>
                  {job.company?.logoUrl && (
                    <img src={job.company.logoUrl} alt={job.company.name} className="h-10 w-10 rounded object-cover border border-neutral-100" />
                  )}
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-neutral-500">
                  <span className="flex items-center"><MapPin className="h-4 w-4 mr-1"/> {job.isRemote ? 'Remote' : job.location}</span>
                  <span className="flex items-center"><Briefcase className="h-4 w-4 mr-1"/> {job.employmentType}</span>
                  {(job.salaryMin || job.salaryMax) && (
                    <span className="flex items-center"><DollarSign className="h-4 w-4 mr-1"/> {job.salaryMin ? `$${job.salaryMin / 1000}k` : ''} - {job.salaryMax ? `$${job.salaryMax / 1000}k` : ''}</span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {job.requiredSkills?.slice(0, 3).map(skill => (
                    <span key={skill} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                      {skill}
                    </span>
                  ))}
                  {job.requiredSkills?.length > 3 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                      +{job.requiredSkills.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 mt-auto">
                <button 
                  className="bg-red-600 shadow-neon hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg w-full transition-colors"
                  onClick={() => navigate(`/candidate/jobs/${job._id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
