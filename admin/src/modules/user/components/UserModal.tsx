import React, { useState, useEffect } from 'react';
import { 
  X, UserPlus, User, Calendar, Mail, Phone, MapPin, 
  Lock, UploadCloud, ChevronRight, ChevronLeft, Info,
  BookOpen, Award, FileText, CheckCircle2, Shield
} from 'lucide-react';
import { UserData } from '../services/user.service';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<UserData>) => Promise<void>;
  user?: UserData | null;
}

export function UserModal({ isOpen, onClose, onSubmit, user }: UserModalProps) {
  const [activeTab, setActiveTab] = useState(1);
  const [formData, setFormData] = useState<any>({
    studentId: '', fullName: '', email: '', phone: '', department: '',
    dob: '', gender: '', guardianName: '', guardianPhone: '', emergencyContact: '',
    address: '', bloodGroup: '', classGrade: '', section: '', admissionDate: '',
    status: 'Active', scholarship: 'None', extracurricular: '', notes: ''
  });
  const [loading, setLoading] = useState(false);

  const generateStudentId = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `STU-${year}-${randomNum}`;
  };

  const DEPARTMENTS = [
    'Computer Science', 'Business Studies', 'English', 
    'Mathematics', 'Physics', 'Chemistry', 'Accounting'
  ];

  useEffect(() => {
    if (user) {
      setFormData({ ...formData, ...user });
    } else {
      setFormData({
        studentId: generateStudentId(), fullName: '', email: '', phone: '', department: '',
        dob: '', gender: '', guardianName: '', guardianPhone: '', emergencyContact: '',
        address: '', bloodGroup: '', classGrade: '', section: '', admissionDate: '',
        status: 'Active', scholarship: 'None', extracurricular: '', notes: ''
      });
    }
    setActiveTab(1);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (activeTab < 4) setActiveTab(activeTab + 1);
  };

  const handlePrev = () => {
    if (activeTab > 1) setActiveTab(activeTab - 1);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      alert('An error occurred. Please check the console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-5xl my-8 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/10 text-blue-500 rounded-full flex items-center justify-center">
              <UserPlus size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                {user ? 'Edit Student' : 'Add New Student'}
              </h3>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                Enter student information to add them to the system.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-lg hover:bg-[var(--surface-2)]">
            <X size={20} />
          </button>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--border)] px-6 shrink-0 bg-[var(--surface)]">
          {[
            { step: 1, label: 'Personal Information' },
            { step: 2, label: 'Academic Information' },
            { step: 3, label: 'Additional Information' },
            { step: 4, label: 'Review & Save' }
          ].map((tab) => (
            <div 
              key={tab.step}
              className={`flex-1 py-4 flex justify-center items-center gap-3 cursor-pointer relative transition-colors ${
                activeTab === tab.step ? 'text-[var(--text-primary)]' : 
                activeTab > tab.step ? 'text-green-500 hover:text-green-400' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              onClick={() => setActiveTab(tab.step)}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                activeTab === tab.step ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 
                activeTab > tab.step ? 'bg-green-500 text-white' : 'bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border)]'
              }`}>
                {activeTab > tab.step ? <CheckCircle2 size={12} /> : tab.step}
              </div>
              <span className="text-sm font-medium">{tab.label}</span>
              {activeTab === tab.step && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.5)]"></div>
              )}
            </div>
          ))}
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar bg-[var(--surface-2)]/20">
          
          {/* STEP 1: Personal Information */}
          {activeTab === 1 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center"><User size={16} /></div>
                <h4 className="font-bold text-lg text-[var(--text-primary)]">Personal Details</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Student ID <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"><Shield size={14} /></div>
                    <input type="text" name="studentId" value={formData.studentId} readOnly className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[var(--text-muted)] cursor-not-allowed focus:outline-none shadow-sm" />
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1.5">Auto-generated unique ID</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Full Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"><User size={14} /></div>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="e.g. John Doe" className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Date of Birth <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"><Calendar size={14} /></div>
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Gender <span className="text-red-500">*</span></label>
                  <select name="gender" value={formData.gender} onChange={handleChange as any} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none shadow-sm transition-all">
                    <option value="">-- Select Gender --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Blood Group</label>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange as any} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none shadow-sm transition-all">
                    <option value="">-- Select Blood Group --</option>
                    <option value="A+">A+</option><option value="A-">A-</option>
                    <option value="B+">B+</option><option value="B-">B-</option>
                    <option value="O+">O+</option><option value="O-">O-</option>
                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"><Mail size={14} /></div>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. john@example.com" className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Phone Number</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"><Phone size={14} /></div>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. +880 1XXXXXXXXX" className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all" />
                  </div>
                </div>
              </div>
              
              <hr className="border-[var(--border)] my-8" />
              
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><MapPin size={16} /></div>
                <h4 className="font-bold text-lg text-[var(--text-primary)]">Contact & Address</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Guardian Name</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"><User size={14} /></div>
                    <input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} placeholder="e.g. Michael Doe" className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Guardian Phone</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"><Phone size={14} /></div>
                    <input type="text" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} placeholder="e.g. +880 1XXXXXXXXX" className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Emergency Contact</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"><Phone size={14} /></div>
                    <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="e.g. +880 1XXXXXXXXX" className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Address</label>
                  <div className="relative h-full">
                    <div className="absolute left-3 top-3.5 text-[var(--text-muted)]"><MapPin size={14} /></div>
                    <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Enter present residential address..." className="w-full h-24 bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none shadow-sm transition-all"></textarea>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Profile Photo</label>
                  <div className="border-2 border-dashed border-[var(--border)] bg-[var(--surface)] rounded-lg h-24 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--surface-hover)] hover:border-blue-500/50 transition-all group">
                    <UploadCloud size={24} className="text-[var(--text-muted)] group-hover:text-blue-500 transition-colors mb-2" />
                    <div className="text-[11px] font-medium text-[var(--text-primary)]">Upload JPG, PNG</div>
                    <div className="text-[10px] text-[var(--text-muted)]">Max size: 2MB</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Academic Information */}
          {activeTab === 2 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center"><BookOpen size={16} /></div>
                <h4 className="font-bold text-lg text-[var(--text-primary)]">Academic Details</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Department <span className="text-red-500">*</span></label>
                    <select name="department" value={formData.department} onChange={handleChange as any} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none shadow-sm transition-all">
                      <option value="">-- Select Department --</option>
                      {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Class / Grade <span className="text-red-500">*</span></label>
                      <select name="classGrade" value={formData.classGrade} onChange={handleChange as any} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none shadow-sm transition-all">
                        <option value="">-- Select --</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Section</label>
                      <select name="section" value={formData.section} onChange={handleChange as any} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none shadow-sm transition-all">
                        <option value="">-- Select --</option>
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Admission Date <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"><Calendar size={14} /></div>
                      <input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Account Status <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select name="status" value={formData.status} onChange={handleChange as any} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2.5 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none shadow-sm transition-all">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${formData.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1.5">Determines if the student can log in and use devices</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Additional Information */}
          {activeTab === 3 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center"><Award size={16} /></div>
                <h4 className="font-bold text-lg text-[var(--text-primary)]">Additional Info (Optional)</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Scholarship / Waiver</label>
                    <select name="scholarship" value={formData.scholarship} onChange={handleChange as any} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none shadow-sm transition-all">
                      <option value="None">None</option>
                      <option value="Merit Based">Merit Based (50%)</option>
                      <option value="Full Free">Full Free (100%)</option>
                      <option value="Special Need">Special Need</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Extracurricular Activities</label>
                    <input type="text" name="extracurricular" value={formData.extracurricular} onChange={handleChange} placeholder="e.g. Debate Club, Football Team" className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Remarks / Special Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Enter any special notes, medical conditions, or remarks here..." className="w-full h-32 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none shadow-sm transition-all"></textarea>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Save */}
          {activeTab === 4 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><FileText size={16} /></div>
                <h4 className="font-bold text-lg text-[var(--text-primary)]">Review & Save</h4>
              </div>

              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  
                  {/* Photo Placeholder in Summary */}
                  <div className="w-32 h-32 bg-[var(--surface-2)] rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
                    <User size={48} opacity={0.5} />
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Full Name</p>
                      <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{formData.fullName || '--'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Student ID</p>
                      <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{formData.studentId || '--'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Department</p>
                      <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{formData.department || '--'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Email</p>
                      <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{formData.email || '--'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Phone</p>
                      <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{formData.phone || '--'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Status</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${formData.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">{formData.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-5 flex gap-4">
                <Info size={24} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-bold text-blue-500">Almost Done!</h5>
                  <p className="text-xs text-[var(--text-primary)] mt-1.5 leading-relaxed">
                    By clicking <b>Save Student</b>, this record will be permanently added to the SmartBio database. After saving, you can navigate to the <span className="font-semibold text-blue-500">Biometrics</span> page to enroll their fingerprint or RFID card.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 md:px-6 md:py-5 border-t border-[var(--border)] flex justify-between items-center shrink-0 bg-[var(--surface)] rounded-b-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex gap-3">
            {activeTab > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--surface-2)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg text-sm font-medium transition-colors"
              >
                <ChevronLeft size={16} /> Previous
              </button>
            )}
            
            {activeTab < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                Next Step <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Student'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
