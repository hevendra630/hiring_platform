import { useState } from 'react';
import { useMyJobs, useCreateJob, useDeleteJob } from '../api/useJobs';
import { Plus, Loader2, Edit2, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export function JobManagement() {
  const { data: jobs, isLoading } = useMyJobs();
  const deleteJobMutation = useDeleteJob();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJobMutation.mutateAsync(id);
        toast.success('Job deleted successfully');
      } catch (error) {
        toast.error('Failed to delete job');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-ink">Manage Jobs</h2>
          <p className="text-ink-muted text-sm mt-1">Create and manage your job postings</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary shadow-neon text-white px-4 py-2 rounded-lg font-medium hover:bg-primary shadow-neon-hover transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Job
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]" />
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="bg-base-surface rounded-xl border border-base-border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-base-background border-b border-base-border">
              <tr>
                <th className="px-6 py-4 font-medium text-ink-muted text-sm">Role</th>
                <th className="px-6 py-4 font-medium text-ink-muted text-sm">Status</th>
                <th className="px-6 py-4 font-medium text-ink-muted text-sm">Type</th>
                <th className="px-6 py-4 font-medium text-ink-muted text-sm">Applicants</th>
                <th className="px-6 py-4 font-medium text-ink-muted text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-border">
              {jobs.map((job) => (
                <tr key={job._id} className="hover:bg-base-background/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-ink">{job.title}</p>
                    <p className="text-sm text-ink-muted">{job.companyName} • {job.location} {job.isRemote && '(Remote)'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${job.status === 'published' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-ink-muted capitalize">{job.employmentType.replace('-', ' ')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/recruiter/jobs/${job._id}/applications`} className="flex items-center text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)] hover:underline font-semibold">
                      <Users className="w-4 h-4 mr-1" /> {job.applicantsCount}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-3 text-ink-muted">
                      <button className="hover:text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)] transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(job._id)} className="hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-base-surface rounded-xl border border-base-border">
          <h3 className="text-lg font-medium text-ink mb-2">No jobs found</h3>
          <p className="text-ink-muted mb-6">You haven't posted any jobs yet.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)] font-medium hover:underline"
          >
            Create your first job
          </button>
        </div>
      )}

      {isModalOpen && (
        <CreateJobModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

function CreateJobModal({ onClose }: { onClose: () => void }) {
  const createJobMutation = useCreateJob();
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    description: '',
    employmentType: 'full-time',
    location: '',
    isRemote: true,
    status: 'published'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createJobMutation.mutateAsync({
        ...formData,
        aiInterviewConfig: {
          enabled: true,
          technicalQuestionCount: 5,
          behavioralQuestionCount: 2,
          durationMinutes: 30
        }
      });
      toast.success('Job created successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to create job');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-base-surface rounded-2xl w-full max-w-2xl overflow-hidden border border-base-border shadow-2xl">
        <div className="p-6 border-b border-base-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-ink">Create New Job</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-ink">Job Title</label>
              <input
                required
                className="w-full bg-base-background border border-base-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-primary"
                value={formData.title}
                onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-ink">Company Name</label>
              <input
                required
                className="w-full bg-base-background border border-base-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-primary"
                value={formData.companyName}
                onChange={e => setFormData(f => ({ ...f, companyName: e.target.value }))}
                placeholder="e.g. Acme Corp"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">Description</label>
            <textarea
              required
              rows={4}
              className="w-full bg-base-background border border-base-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-primary"
              value={formData.description}
              onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
              placeholder="Job description and requirements..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-ink">Employment Type</label>
              <select
                className="w-full bg-base-background border border-base-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-primary"
                value={formData.employmentType}
                onChange={e => setFormData(f => ({ ...f, employmentType: e.target.value }))}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-ink">Location</label>
              <input
                className="w-full bg-base-background border border-base-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-primary"
                value={formData.location}
                onChange={e => setFormData(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. San Francisco, CA"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isRemote"
              checked={formData.isRemote}
              onChange={e => setFormData(f => ({ ...f, isRemote: e.target.checked }))}
              className="rounded border-base-border text-primary drop-shadow-[0_0_5px_rgba(255,0,0,0.8)] focus:ring-primary"
            />
            <label htmlFor="isRemote" className="text-sm text-ink cursor-pointer">This is a remote position</label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-base-border mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-ink-muted hover:text-ink font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createJobMutation.isPending}
              className="bg-primary shadow-neon text-white px-6 py-2 rounded-lg font-medium hover:bg-primary shadow-neon-hover transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {createJobMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Publish Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
