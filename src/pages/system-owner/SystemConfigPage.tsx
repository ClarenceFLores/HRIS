/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { 
  Settings2, 
  Calculator,
  Shield,
  Percent,
  Clock,
  Save,
  RefreshCw,
  AlertTriangle,
  Check,
  ChevronRight,
  FileText,
  Lock,
  Key,
  Eye,
  EyeOff,
  Info,
  DollarSign,
  Building2,
  Calendar
} from 'lucide-react';

// Tax bracket configuration
const mockTaxBrackets = [
  { min: 0, max: 250000, rate: 0, baseTax: 0 },
  { min: 250001, max: 400000, rate: 15, baseTax: 0 },
  { min: 400001, max: 800000, rate: 20, baseTax: 22500 },
  { min: 800001, max: 2000000, rate: 25, baseTax: 102500 },
  { min: 2000001, max: 8000000, rate: 30, baseTax: 402500 },
  { min: 8000001, max: Infinity, rate: 35, baseTax: 2202500 },
];

// Government contribution rates
const mockContributions = {
  sss: {
    employeeRate: 4.5,
    employerRate: 9.5,
    maxMSC: 30000,
    minMSC: 4000,
  },
  philhealth: {
    rate: 5,
    employeeShare: 2.5,
    employerShare: 2.5,
    maxContribution: 5000,
  },
  pagibig: {
    employeeRate: 2,
    employerRate: 2,
    maxContribution: 200,
  },
};

// Overtime settings
const mockOvertimeSettings = {
  regularOT: 1.25,
  restDayOT: 1.30,
  holidayOT: 2.00,
  specialHolidayOT: 1.30,
  nightDiffRate: 0.10,
  nightDiffStart: '22:00',
  nightDiffEnd: '06:00',
};

// Security settings
const mockSecuritySettings = {
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumber: true,
  passwordRequireSpecial: true,
  passwordExpireDays: 90,
  twoFactorEnabled: true,
  maxLoginAttempts: 5,
  lockoutDuration: 30,
  sessionTimeout: 60,
};

type TabType = 'payroll' | 'tax' | 'contributions' | 'security';

export function SystemConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('payroll');
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [taxBrackets, setTaxBrackets] = useState(mockTaxBrackets);
  const [contributions, setContributions] = useState(mockContributions);
  const [overtimeSettings, setOvertimeSettings] = useState(mockOvertimeSettings);
  const [securitySettings, setSecuritySettings] = useState(mockSecuritySettings);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`space-y-6 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900">
            System Configuration
          </h1>
          <p className="text-neutral-500 mt-1">
            Global settings for payroll computation, taxes, and security
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save All Changes
            </>
          )}
        </button>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Important Notice</p>
          <p className="text-sm text-amber-700 mt-1">
            Changes to system configuration will affect all companies on the platform. 
            Please review carefully before saving.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex gap-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('payroll')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'payroll'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Payroll Settings
            </div>
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'tax'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Tax Tables
            </div>
          </button>
          <button
            onClick={() => setActiveTab('contributions')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'contributions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Contribution Rates
            </div>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Settings
            </div>
          </button>
        </nav>
      </div>

      {/* Payroll Settings Tab */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          {/* Overtime Settings */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Overtime Computation</h3>
                <p className="text-sm text-neutral-500">Configure overtime rates and rules</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Regular Overtime Rate</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={overtimeSettings.regularOT}
                    onChange={(e) => setOvertimeSettings({...overtimeSettings, regularOT: parseFloat(e.target.value)})}
                    className="input pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">×</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Multiplier for regular OT hours</p>
              </div>

              <div>
                <label className="label">Rest Day Overtime Rate</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={overtimeSettings.restDayOT}
                    onChange={(e) => setOvertimeSettings({...overtimeSettings, restDayOT: parseFloat(e.target.value)})}
                    className="input pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">×</span>
                </div>
              </div>

              <div>
                <label className="label">Holiday Overtime Rate</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={overtimeSettings.holidayOT}
                    onChange={(e) => setOvertimeSettings({...overtimeSettings, holidayOT: parseFloat(e.target.value)})}
                    className="input pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">×</span>
                </div>
              </div>

              <div>
                <label className="label">Special Holiday Rate</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={overtimeSettings.specialHolidayOT}
                    onChange={(e) => setOvertimeSettings({...overtimeSettings, specialHolidayOT: parseFloat(e.target.value)})}
                    className="input pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">×</span>
                </div>
              </div>
            </div>
          </div>

          {/* Night Differential */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Night Differential</h3>
                <p className="text-sm text-neutral-500">Configure night shift premium</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="label">Night Diff Rate</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={overtimeSettings.nightDiffRate * 100}
                    onChange={(e) => setOvertimeSettings({...overtimeSettings, nightDiffRate: parseFloat(e.target.value) / 100})}
                    className="input pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Additional pay percentage</p>
              </div>

              <div>
                <label className="label">Start Time</label>
                <input
                  type="time"
                  value={overtimeSettings.nightDiffStart}
                  onChange={(e) => setOvertimeSettings({...overtimeSettings, nightDiffStart: e.target.value})}
                  className="input"
                />
              </div>

              <div>
                <label className="label">End Time</label>
                <input
                  type="time"
                  value={overtimeSettings.nightDiffEnd}
                  onChange={(e) => setOvertimeSettings({...overtimeSettings, nightDiffEnd: e.target.value})}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Payroll Cycle Defaults */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Payroll Cycle Defaults</h3>
                <p className="text-sm text-neutral-500">Default settings for new companies</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Default Pay Schedule</label>
                <select className="input">
                  <option value="monthly">Monthly</option>
                  <option value="semi-monthly">Semi-Monthly (15th & 30th)</option>
                  <option value="bi-weekly">Bi-Weekly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="label">Cutoff Days</label>
                <select className="input">
                  <option value="1-15">1st - 15th / 16th - End</option>
                  <option value="16-15">16th - 15th</option>
                  <option value="26-25">26th - 25th</option>
                </select>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Each company can customize their own payroll cycle. 
                  These are just default values for new registrations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tax Tables Tab */}
      {activeTab === 'tax' && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Income Tax Brackets (BIR)</h3>
                  <p className="text-sm text-neutral-500">Annual tax brackets based on TRAIN Law</p>
                </div>
              </div>
              <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">
                Effective: Jan 2023
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="bg-neutral-50 border-y border-neutral-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                      Annual Income From
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                      To
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                      Tax Rate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                      Base Tax
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                      Plus % of Excess
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {taxBrackets.map((bracket, index) => (
                    <tr key={index} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium text-neutral-900">
                        {formatCurrency(bracket.min)}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {bracket.max === Infinity ? 'Above' : formatCurrency(bracket.max)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bracket.rate === 0 ? 'bg-emerald-100 text-emerald-700' :
                          bracket.rate <= 20 ? 'bg-blue-100 text-blue-700' :
                          bracket.rate <= 30 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {bracket.rate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {formatCurrency(bracket.baseTax)}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {bracket.rate}% over {formatCurrency(bracket.min)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-4 bg-amber-50 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">
                  <strong>Warning:</strong> Tax tables should only be updated when BIR releases new regulations. 
                  Incorrect values may result in compliance issues.
                </p>
              </div>
            </div>
          </div>

          {/* Withholding Tax Formula */}
          <div className="card p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Withholding Tax Computation</h3>
            <div className="bg-neutral-50 rounded-xl p-4 font-mono text-sm">
              <p className="text-neutral-600">// Monthly Withholding Tax Formula</p>
              <p className="text-neutral-800 mt-2">
                <span className="text-purple-600">monthlyTax</span> = (<span className="text-purple-600">baseTax</span> / 12) + 
                ((<span className="text-purple-600">monthlyIncome</span> - (<span className="text-purple-600">bracketMin</span> / 12)) × <span className="text-purple-600">rate</span>)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contribution Rates Tab */}
      {activeTab === 'contributions' && (
        <div className="space-y-6">
          {/* SSS */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">SSS Contribution</h3>
                <p className="text-sm text-neutral-500">Social Security System rates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="label">Employee Rate</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={contributions.sss.employeeRate}
                    onChange={(e) => setContributions({
                      ...contributions,
                      sss: {...contributions.sss, employeeRate: parseFloat(e.target.value)}
                    })}
                    className="input pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
                </div>
              </div>

              <div>
                <label className="label">Employer Rate</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={contributions.sss.employerRate}
                    onChange={(e) => setContributions({
                      ...contributions,
                      sss: {...contributions.sss, employerRate: parseFloat(e.target.value)}
                    })}
                    className="input pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
                </div>
              </div>

              <div>
                <label className="label">Minimum MSC</label>
                <input
                  type="number"
                  value={contributions.sss.minMSC}
                  onChange={(e) => setContributions({
                    ...contributions,
                    sss: {...contributions.sss, minMSC: parseInt(e.target.value)}
                  })}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Maximum MSC</label>
                <input
                  type="number"
                  value={contributions.sss.maxMSC}
                  onChange={(e) => setContributions({
                    ...contributions,
                    sss: {...contributions.sss, maxMSC: parseInt(e.target.value)}
                  })}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* PhilHealth */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">PhilHealth Contribution</h3>
                <p className="text-sm text-neutral-500">Philippine Health Insurance rates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="label">Total Rate</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={contributions.philhealth.rate}
                    onChange={(e) => setContributions({
                      ...contributions,
                      philhealth: {...contributions.philhealth, rate: parseFloat(e.target.value)}
                    })}
                    className="input pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Split 50/50 EE/ER</p>
              </div>

              <div>
                <label className="label">Employee Share</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={contributions.philhealth.employeeShare}
                    className="input pr-12 bg-neutral-50"
                    disabled
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
                </div>
              </div>

              <div>
                <label className="label">Employer Share</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={contributions.philhealth.employerShare}
                    className="input pr-12 bg-neutral-50"
                    disabled
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
                </div>
              </div>

              <div>
                <label className="label">Max Monthly Contribution</label>
                <input
                  type="number"
                  value={contributions.philhealth.maxContribution}
                  onChange={(e) => setContributions({
                    ...contributions,
                    philhealth: {...contributions.philhealth, maxContribution: parseInt(e.target.value)}
                  })}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Pag-IBIG */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Pag-IBIG Contribution</h3>
                <p className="text-sm text-neutral-500">Home Development Mutual Fund rates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="label">Employee Rate</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={contributions.pagibig.employeeRate}
                    onChange={(e) => setContributions({
                      ...contributions,
                      pagibig: {...contributions.pagibig, employeeRate: parseFloat(e.target.value)}
                    })}
                    className="input pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
                </div>
              </div>

              <div>
                <label className="label">Employer Rate</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={contributions.pagibig.employerRate}
                    onChange={(e) => setContributions({
                      ...contributions,
                      pagibig: {...contributions.pagibig, employerRate: parseFloat(e.target.value)}
                    })}
                    className="input pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
                </div>
              </div>

              <div>
                <label className="label">Max Monthly Contribution</label>
                <input
                  type="number"
                  value={contributions.pagibig.maxContribution}
                  onChange={(e) => setContributions({
                    ...contributions,
                    pagibig: {...contributions.pagibig, maxContribution: parseInt(e.target.value)}
                  })}
                  className="input"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Password Policy */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Key className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Password Policy</h3>
                <p className="text-sm text-neutral-500">Configure password requirements</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Minimum Password Length</label>
                <input
                  type="number"
                  value={securitySettings.passwordMinLength}
                  onChange={(e) => setSecuritySettings({...securitySettings, passwordMinLength: parseInt(e.target.value)})}
                  className="input"
                  min={6}
                  max={32}
                />
              </div>

              <div>
                <label className="label">Password Expiry (Days)</label>
                <input
                  type="number"
                  value={securitySettings.passwordExpireDays}
                  onChange={(e) => setSecuritySettings({...securitySettings, passwordExpireDays: parseInt(e.target.value)})}
                  className="input"
                />
                <p className="text-xs text-neutral-500 mt-1">0 = Never expires</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={securitySettings.passwordRequireUppercase}
                  onChange={(e) => setSecuritySettings({...securitySettings, passwordRequireUppercase: e.target.checked})}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-neutral-700">Require uppercase letter (A-Z)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={securitySettings.passwordRequireLowercase}
                  onChange={(e) => setSecuritySettings({...securitySettings, passwordRequireLowercase: e.target.checked})}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-neutral-700">Require lowercase letter (a-z)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={securitySettings.passwordRequireNumber}
                  onChange={(e) => setSecuritySettings({...securitySettings, passwordRequireNumber: e.target.checked})}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-neutral-700">Require number (0-9)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={securitySettings.passwordRequireSpecial}
                  onChange={(e) => setSecuritySettings({...securitySettings, passwordRequireSpecial: e.target.checked})}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-neutral-700">Require special character (!@#$%^&*)</span>
              </label>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-neutral-500">Require 2FA for all users</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactorEnabled}
                  onChange={(e) => setSecuritySettings({...securitySettings, twoFactorEnabled: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          {/* Login Security */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Login Security</h3>
                <p className="text-sm text-neutral-500">Configure login attempt limits</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="label">Max Login Attempts</label>
                <input
                  type="number"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value)})}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Lockout Duration (Minutes)</label>
                <input
                  type="number"
                  value={securitySettings.lockoutDuration}
                  onChange={(e) => setSecuritySettings({...securitySettings, lockoutDuration: parseInt(e.target.value)})}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Session Timeout (Minutes)</label>
                <input
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                  className="input"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
