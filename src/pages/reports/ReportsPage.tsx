/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { 
  FileText, Download, Users, Clock, Calendar, Wallet, TrendingUp,
  Search, Filter, X, Eye, FileSpreadsheet, File, Loader2, Building,
  CheckCircle, BarChart3, Grid3x3
} from 'lucide-react';

type Category = 'All' | 'Employees' | 'Attendance' | 'Leaves' | 'Payroll' | 'Government';
type FileFormat = 'pdf' | 'excel' | 'csv';

const reports = [
  { id: 1, name: 'Employee Roster', description: 'Complete list of all employees with details', icon: Users, category: 'Employees', color: 'from-blue-500 to-blue-600' },
  { id: 2, name: 'Attendance Summary', description: 'Monthly attendance report with totals', icon: Clock, category: 'Attendance', color: 'from-amber-500 to-amber-600' },
  { id: 3, name: 'Leave Balance Report', description: 'Employee leave balances and usage', icon: Calendar, category: 'Leaves', color: 'from-emerald-500 to-emerald-600' },
  { id: 4, name: 'Payroll Register', description: 'Detailed payroll register with deductions', icon: Wallet, category: 'Payroll', color: 'from-purple-500 to-purple-600' },
  { id: 5, name: '13th Month Pay', description: '13th month pay computation report', icon: TrendingUp, category: 'Payroll', color: 'from-pink-500 to-pink-600' },
  { id: 6, name: 'SSS Contributions', description: 'SSS contribution summary', icon: Building, category: 'Government', color: 'from-cyan-500 to-cyan-600' },
  { id: 7, name: 'PhilHealth Contributions', description: 'PhilHealth contribution summary', icon: Building, category: 'Government', color: 'from-teal-500 to-teal-600' },
  { id: 8, name: 'Pag-IBIG Contributions', description: 'Pag-IBIG contribution summary', icon: Building, category: 'Government', color: 'from-indigo-500 to-indigo-600' },
  { id: 10, name: 'Headcount Analysis', description: 'Department-wise employee distribution', icon: BarChart3, category: 'Employees', color: 'from-violet-500 to-violet-600' },
];

const categories: { value: Category; label: string; icon: typeof Users }[] = [
  { value: 'All', label: 'All Reports', icon: Grid3x3 },
  { value: 'Employees', label: 'Employees', icon: Users },
  { value: 'Attendance', label: 'Attendance', icon: Clock },
  { value: 'Leaves', label: 'Leaves', icon: Calendar },
  { value: 'Payroll', label: 'Payroll', icon: Wallet },
  { value: 'Government', label: 'Government', icon: Building },
];

const categoryColors: Record<string, string> = {
  'Employees': 'bg-blue-100 text-blue-700',
  'Attendance': 'bg-amber-100 text-amber-700',
  'Leaves': 'bg-emerald-100 text-emerald-700',
  'Payroll': 'bg-purple-100 text-purple-700',
  'Government': 'bg-cyan-100 text-cyan-700',
};

export function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<FileFormat>('pdf');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = async (reportId: number) => {
    setDownloadingId(reportId);
    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 1500));
    setDownloadingId(null);
  };

  const getFormatIcon = (format: FileFormat) => {
    switch (format) {
      case 'pdf': return File;
      case 'excel': return FileSpreadsheet;
      case 'csv': return FileText;
    }
  };

  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat.value] = cat.value === 'All' 
      ? reports.length 
      : reports.filter(r => r.category === cat.value).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-xl">
            <FileText className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-neutral-900">Reports</h1>
            <p className="text-neutral-500 text-sm">Generate and download HR reports</p>
          </div>
        </div>
        
        {/* Format Selector */}
        <div className="flex items-center gap-2 bg-neutral-100 rounded-lg p-1">
          {(['pdf', 'excel', 'csv'] as FileFormat[]).map((format) => {
            const FormatIcon = getFormatIcon(format);
            return (
              <button
                key={format}
                onClick={() => setSelectedFormat(format)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedFormat === format
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <FormatIcon size={16} />
                {format.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className={`card p-4 transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports..."
              className="input pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 rounded-full"
              >
                <X size={16} className="text-neutral-400" />
              </button>
            )}
          </div>
          
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-neutral-400 hidden sm:block" />
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === category.value
                        ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500/20'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{category.label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      selectedCategory === category.value 
                        ? 'bg-primary-200 text-primary-800' 
                        : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      {categoryCounts[category.value]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className={`flex items-center justify-between text-sm transition-all duration-500 delay-150 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-neutral-500">
          Showing <span className="font-medium text-neutral-700">{filteredReports.length}</span> of {reports.length} reports
          {selectedCategory !== 'All' && (
            <span className="ml-2">
              in <span className={`badge ${categoryColors[selectedCategory]}`}>{selectedCategory}</span>
            </span>
          )}
        </p>
      </div>

      {/* Reports Grid */}
      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report, index) => (
            <div 
              key={report.id} 
              className={`card group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
              style={{ 
                transitionDelay: `${index * 50}ms`,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)'
              }}
            >
              {/* Header with gradient */}
              <div className={`h-2 bg-gradient-to-r ${report.color}`}></div>
              
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 bg-gradient-to-br ${report.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                    <report.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                      {report.name}
                    </h3>
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{report.description}</p>
                    <span className={`inline-block mt-3 text-xs px-2.5 py-1 rounded-full font-medium ${categoryColors[report.category]}`}>
                      {report.category}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-neutral-100 flex gap-2">
                  <button className="btn btn-ghost btn-sm flex-1 text-neutral-600 hover:text-primary-600">
                    <Eye size={16} />
                    Preview
                  </button>
                  <button 
                    onClick={() => handleDownload(report.id)}
                    disabled={downloadingId === report.id}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    {downloadingId === report.id ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        {selectedFormat.toUpperCase()}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`card p-12 text-center transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No reports found</h3>
          <p className="text-neutral-500 mb-4">
            No reports match your search criteria. Try adjusting your filters.
          </p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="btn btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Quick Tips */}
      <div className={`card p-6 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-100 transition-all duration-500 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary-100 rounded-xl shrink-0">
            <CheckCircle className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-primary-900 mb-1">Report Tips</h3>
            <ul className="text-sm text-primary-700 space-y-1">
              <li>• <strong>PDF</strong> format is best for printing and formal submissions</li>
              <li>• <strong>Excel</strong> format allows further data manipulation</li>
              <li>• <strong>CSV</strong> format is ideal for importing into other systems</li>
              <li>• Government reports are formatted according to SSS, PhilHealth, and Pag-IBIG requirements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
