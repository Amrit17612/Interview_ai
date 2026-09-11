import React, { useState, useEffect } from 'react';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { useAuth } from '../../auth/hooks/useAuth';
import { Calendar, PlayCircle, FileText, ShoppingBag, Shield, Settings, LogOut, ChevronRight, Edit2, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { interviewService } from '../../../services/interview.service';
import { resumeService } from '../../../services/resume.service';
import { userService } from '../../../services/user.service';

export function UserProfile() {
  const { user, refreshUser, logout } = useAuth();
  
  const [stats, setStats] = useState<any>(null);
  const [resume, setResume] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoadingStats(true);
      try {
        const [statsData, resumesData] = await Promise.all([
          interviewService.getInterviewStats().catch(() => null),
          resumeService.getResumes().catch(() => [])
        ]);
        if (statsData) setStats(statsData.summary);
        if (resumesData && resumesData.length > 0) {
          setResume(resumesData[0]);
        }
      } catch (err) {
        console.error("Failed to fetch profile data", err);
      } finally {
        setLoadingStats(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (user && isEditModalOpen) {
      setEditForm({ firstName: user.firstName, lastName: user.lastName });
      setSaveError(null);
      setSaveSuccess(false);
    }
  }, [user, isEditModalOpen]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      await userService.updateProfile(editForm);
      await refreshUser();
      setSaveSuccess(true);
      setTimeout(() => setIsEditModalOpen(false), 1500);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate completion percentage based on real supported fields
  const getCompletionData = () => {
    const fields = [
      { name: 'First Name', completed: !!user?.firstName },
      { name: 'Last Name', completed: !!user?.lastName },
      { name: 'Email Address', completed: !!user?.email },
      { name: 'Onboarding', completed: !!user?.onboardingCompleted }
    ];
    const completedCount = fields.filter(f => f.completed).length;
    const percentage = Math.round((completedCount / fields.length) * 100);
    const missing = fields.find(f => !f.completed);
    
    return { percentage, missing, fields };
  };
  
  const completion = getCompletionData();

  return (
    <Container className="py-8 max-w-5xl">
      <PageHeader 
        title="User Profile" 
        description="Manage your personal information, view account activity, and access settings." 
      />
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-6 lg:col-span-1">
          {/* Profile Header Card */}
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-brand-600 to-indigo-600"></div>
            <CardContent className="pt-0 pb-6 px-6 text-center relative">
              <div className="mx-auto -mt-12 h-24 w-24 rounded-full bg-white p-1 shadow-md border border-gray-100 mb-4">
                <div className="h-full w-full rounded-full bg-brand-100 flex items-center justify-center text-3xl font-bold text-brand-700">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
              <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
              
              <div className="flex justify-center space-x-2 mb-6">
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">Active Account</span>
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100 capitalize">{user?.role || 'User'}</span>
              </div>
              
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              >
                <Edit2 className="h-4 w-4 mr-2 text-gray-400" />
                Edit Profile
              </button>
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Profile Completion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{completion.percentage}% Complete</span>
                <span className="text-gray-500">{completion.fields.filter(f => f.completed).length} of {completion.fields.length}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-brand-600 h-2.5 rounded-full" style={{ width: `${completion.percentage}%` }}></div>
              </div>
              {completion.missing && (
                <p className="text-xs text-amber-600 flex items-start">
                  <AlertCircle className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  Please complete: {completion.missing.name}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                <Link to="/interview/setup" className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <PlayCircle className="h-4 w-4 mr-3 text-brand-500" />
                    Start Interview
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
                <Link to="/resume" className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <FileText className="h-4 w-4 mr-3 text-blue-500" />
                    Resume Intelligence
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
                <Link to="/interview/history" className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <Calendar className="h-4 w-4 mr-3 text-purple-500" />
                    Interview History
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Account Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interview Activity */}
            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center">
                  <PlayCircle className="h-4 w-4 mr-2 text-gray-400" />
                  Interview Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ) : stats ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Total</p>
                        <p className="text-xl font-semibold text-gray-900">{stats.totalInterviews}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs text-green-700 mb-1">Completed</p>
                        <p className="text-xl font-semibold text-green-700">{stats.completedInterviews}</p>
                      </div>
                    </div>
                    {stats.averageScore !== null && (
                      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                        <span className="text-sm text-gray-500">Average Score</span>
                        <span className="text-sm font-medium text-gray-900">{stats.averageScore.toFixed(1)}/100</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No interview history available.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resume Summary */}
            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gray-400" />
                  Resume Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ) : resume ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 truncate">
                        <p className="text-sm font-medium text-gray-900 truncate" title={resume.originalFileName}>{resume.originalFileName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Analyzed {new Date(resume.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-700 mb-1">ATS Score</p>
                        <p className="text-xl font-semibold text-blue-700">{resume.generalAtsScore !== null && resume.generalAtsScore !== undefined ? resume.generalAtsScore : (resume.atsScore !== null && resume.atsScore !== undefined ? resume.atsScore : '-')}</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs text-purple-700 mb-1">Quality</p>
                        <p className="text-xl font-semibold text-purple-700">{resume.qualityScore !== null && resume.qualityScore !== undefined ? resume.qualityScore : '-'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-3">No resume uploaded yet.</p>
                    <Link to="/resume" className="text-sm font-medium text-brand-600 hover:text-brand-700">Upload Resume &rarr;</Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Purchases / Access Summary */}
          {user?.purchasedBundles && user.purchasedBundles.length > 0 && (
            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center">
                  <ShoppingBag className="h-4 w-4 mr-2 text-gray-400" />
                  Purchased Bundles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-gray-100">
                  {user.purchasedBundles.map((bundle, idx) => (
                    <li key={idx} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{bundle.bundleType.toUpperCase()} Bundle</p>
                        <p className="text-xs text-gray-500 mt-0.5">Purchased on {new Date(bundle.purchasedAt).toLocaleDateString()}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {bundle.purchaseStatus.toUpperCase()}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Security & Account */}
          <Card className="border-gray-100 shadow-sm border-red-100">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center">
                <Shield className="h-4 w-4 mr-2 text-gray-400" />
                Security & Account
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                <Link to="/settings" className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account Settings</p>
                    <p className="text-xs text-gray-500 mt-0.5">Manage preferences and security</p>
                  </div>
                  <Settings className="h-4 w-4 text-gray-400" />
                </Link>
                <button onClick={logout} className="w-full flex items-center justify-between px-6 py-4 hover:bg-red-50 transition-colors group">
                  <div>
                    <p className="text-sm font-medium text-red-600">Sign Out</p>
                    <p className="text-xs text-red-400 mt-0.5">Securely end your session</p>
                  </div>
                  <LogOut className="h-4 w-4 text-red-300 group-hover:text-red-500" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-6">
              {saveSuccess && (
                <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-lg text-sm flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Profile updated successfully!
                </div>
              )}
              {saveError && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  {saveError}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.firstName}
                    onChange={e => setEditForm({...editForm, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.lastName}
                    onChange={e => setEditForm({...editForm, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email (Read Only)</label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 sm:text-sm cursor-not-allowed"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || saveSuccess}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center"
                >
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Container>
  );
}

// Ensure AlertCircle is imported if we use it
import { AlertCircle } from 'lucide-react';
