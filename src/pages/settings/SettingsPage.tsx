/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { 
  Save, Building, Bell, Shield, Settings, CheckCircle, 
  Upload, Trash2, Lock, Globe, Palette, Clock, Mail,
  ChevronRight, Info, AlertCircle, Loader2, User, Calendar, Wallet
} from 'lucide-react';

type TabId = 'company' | 'rates' | 'notifications' | 'security';

const tabs = [
  { id: 'company', label: 'Company', icon: Building, description: 'Organization details' },
  { id: 'rates', label: 'Contribution Rates', icon: Shield, description: 'Government rates' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert preferences' },
  { id: 'security', label: 'Security', icon: Lock, description: 'Access & permissions' },
] as const;

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('company');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {showSaved && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-4 fade-in">
          <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Settings saved successfully!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-xl">
            <Settings className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-neutral-900">Settings</h1>
            <p className="text-neutral-500 text-sm">Manage organization settings and preferences</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className={`lg:w-72 shrink-0 transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="card p-2 sticky top-6">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      isActive 
                        ? 'bg-primary-50 text-primary-600 shadow-sm' 
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-primary-100' : 'bg-neutral-100'}`}>
                      <Icon size={18} className={isActive ? 'text-primary-600' : 'text-neutral-500'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${isActive ? 'text-primary-700' : 'text-neutral-900'}`}>
                        {tab.label}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">{tab.description}</p>
                    </div>
                    <ChevronRight size={16} className={`transition-transform ${isActive ? 'text-primary-500 rotate-90' : 'text-neutral-300'}`} />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {activeTab === 'company' && (
            <div className="space-y-6">
              <div className="card overflow-hidden">
                <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-900">Company Information</h2>
                      <p className="text-sm text-neutral-500">Basic organization details</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  {/* Company Logo */}
                  <div>
                    <label className="label">Company Logo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-neutral-100 rounded-xl flex items-center justify-center border-2 border-dashed border-neutral-200">
                        <Building className="w-8 h-8 text-neutral-400" />
                      </div>
                      <div className="space-y-2">
                        <button className="btn btn-secondary btn-sm">
                          <Upload size={16} />
                          Upload Logo
                        </button>
                        <p className="text-xs text-neutral-500">PNG or JPG, max 2MB</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="label">Company Name</label>
                      <input type="text" className="input" defaultValue="Acme Corporation" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">Address</label>
                      <input type="text" className="input" defaultValue="123 Business St, Makati City" />
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input type="tel" className="input" defaultValue="+63 912 345 6789" />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input type="email" className="input" defaultValue="hr@acmecorp.com" />
                    </div>
                    <div>
                      <label className="label">Tax ID Number (TIN)</label>
                      <input type="text" className="input" defaultValue="123-456-789-000" />
                    </div>
                    <div>
                      <label className="label">RDO Code</label>
                      <input type="text" className="input" defaultValue="044" placeholder="e.g., 044" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="card overflow-hidden">
                <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-900">Business Hours</h2>
                      <p className="text-sm text-neutral-500">Default work schedule</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="label">Work Days</label>
                      <select className="input">
                        <option>Monday - Friday</option>
                        <option>Monday - Saturday</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Start Time</label>
                      <input type="time" className="input" defaultValue="08:00" />
                    </div>
                    <div>
                      <label className="label">End Time</label>
                      <input type="time" className="input" defaultValue="17:00" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSave} disabled={isSaving} className="btn btn-primary">
                  {isSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'rates' && (
            <div className="space-y-6">
              {/* SSS */}
              <div className="card overflow-hidden">
                <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <span className="text-xl">🏛️</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-neutral-900">SSS Rates (2024)</h2>
                        <p className="text-sm text-neutral-500">Social Security System contribution rates</p>
                      </div>
                    </div>
                    <span className="badge bg-blue-100 text-blue-700">Updated</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                      <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Salary Range</p>
                      <p className="font-bold text-lg text-neutral-900">₱20K - ₱24,999</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Employee Share</p>
                      <p className="font-bold text-lg text-blue-900">₱800 <span className="text-sm font-normal text-blue-600">/month</span></p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <p className="text-xs text-emerald-600 uppercase tracking-wide mb-1">Employer Share</p>
                      <p className="font-bold text-lg text-emerald-900">₱960 <span className="text-sm font-normal text-emerald-600">/month</span></p>
                    </div>
                  </div>
                  <button className="mt-4 btn btn-ghost text-primary-600 hover:text-primary-700">
                    <Info size={16} />
                    View Full SSS Table
                  </button>
                </div>
              </div>

              {/* PhilHealth */}
              <div className="card overflow-hidden">
                <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-emerald-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-xl">
                        <span className="text-xl">🏥</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-neutral-900">PhilHealth Rates (2024)</h2>
                        <p className="text-sm text-neutral-500">Philippine Health Insurance Corporation</p>
                      </div>
                    </div>
                    <span className="badge bg-emerald-100 text-emerald-700">5% Total</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                      <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Contribution Rate</p>
                      <p className="font-bold text-lg text-neutral-900">5% <span className="text-sm font-normal">of basic salary</span></p>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                      <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Max Monthly Salary</p>
                      <p className="font-bold text-lg text-neutral-900">₱100,000</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <p className="text-xs text-emerald-600 uppercase tracking-wide mb-1">Max Contribution</p>
                      <p className="font-bold text-lg text-emerald-900">₱5,000 <span className="text-sm font-normal text-emerald-600">/month</span></p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">Split equally between employee (2.5%) and employer (2.5%)</p>
                  </div>
                </div>
              </div>

              {/* Pag-IBIG */}
              <div className="card overflow-hidden">
                <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-amber-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-xl">
                        <span className="text-xl">🏠</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-neutral-900">Pag-IBIG Rates (2024)</h2>
                        <p className="text-sm text-neutral-500">Home Development Mutual Fund</p>
                      </div>
                    </div>
                    <span className="badge bg-amber-100 text-amber-700">4% Total</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                      <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Contribution Rate</p>
                      <p className="font-bold text-lg text-neutral-900">2% + 2% <span className="text-sm font-normal">(EE + ER)</span></p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <p className="text-xs text-amber-600 uppercase tracking-wide mb-1">Maximum</p>
                      <p className="font-bold text-lg text-amber-900">₱200 <span className="text-sm font-normal text-amber-600">/month total</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSave} disabled={isSaving} className="btn btn-primary">
                  {isSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="card overflow-hidden">
                <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Bell className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-900">Notification Preferences</h2>
                      <p className="text-sm text-neutral-500">Configure how you receive alerts</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { title: 'Leave Request Notifications', desc: 'Receive alerts when employees submit leave requests', icon: Calendar, defaultChecked: true },
                    { title: 'Payroll Completion', desc: 'Get notified when payroll processing completes', icon: Wallet, defaultChecked: true },
                    { title: 'Employee Updates', desc: 'Alerts for new hires, resignations, and promotions', icon: User, defaultChecked: true },
                    { title: 'Weekly Summary Reports', desc: 'Receive weekly HR summary via email', icon: Mail, defaultChecked: false },
                    { title: 'System Maintenance', desc: 'Notifications about scheduled maintenance', icon: Settings, defaultChecked: true },
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <label key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Icon size={18} className="text-neutral-500 group-hover:text-primary-500 transition-colors" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">{item.title}</p>
                            <p className="text-sm text-neutral-500">{item.desc}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            defaultChecked={item.defaultChecked} 
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-neutral-200 rounded-full peer peer-checked:bg-primary-500 transition-colors"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Email Settings */}
              <div className="card overflow-hidden">
                <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-900">Email Settings</h2>
                      <p className="text-sm text-neutral-500">Configure email notification delivery</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="label">Notification Email</label>
                    <input type="email" className="input" defaultValue="hr@acmecorp.com" />
                    <p className="text-xs text-neutral-500 mt-1">Email address for receiving notifications</p>
                  </div>
                  <div>
                    <label className="label">Email Frequency</label>
                    <select className="input">
                      <option>Instant</option>
                      <option>Hourly Digest</option>
                      <option>Daily Digest</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSave} disabled={isSaving} className="btn btn-primary">
                  {isSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="card overflow-hidden">
                <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <Lock className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-900">Security Settings</h2>
                      <p className="text-sm text-neutral-500">Manage access and authentication</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="label">Session Timeout</label>
                    <select className="input">
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="480">8 hours</option>
                    </select>
                    <p className="text-xs text-neutral-500 mt-1">Automatically log out after inactivity</p>
                  </div>
                  
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900">Two-Factor Authentication</p>
                        <p className="text-sm text-neutral-500">Add an extra layer of security</p>
                      </div>
                      <button className="btn btn-secondary btn-sm">Enable</button>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900">Password Policy</p>
                        <p className="text-sm text-neutral-500">Require strong passwords for all users</p>
                      </div>
                      <span className="badge bg-emerald-100 text-emerald-700">Enabled</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="card overflow-hidden border-red-200">
                <div className="p-6 border-b border-red-100 bg-gradient-to-r from-red-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
                      <p className="text-sm text-red-600">Irreversible actions</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-xl">
                    <div>
                      <p className="font-medium text-neutral-900">Reset All Settings</p>
                      <p className="text-sm text-neutral-500">Restore all settings to default values</p>
                    </div>
                    <button className="btn btn-sm border-red-300 text-red-600 hover:bg-red-50">
                      <Trash2 size={16} />
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSave} disabled={isSaving} className="btn btn-primary">
                  {isSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
