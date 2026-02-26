# SAHOD - Human Resource Information System

**© 2026 DevSpot. All rights reserved.**

A modern, cloud-based Human Resource Information System (HRIS) designed for Philippine businesses. SAHOD streamlines HR operations including employee management, attendance tracking, leave management, and payroll processing.

## Features

- 👥 **Employee Management** - Complete employee lifecycle management with comprehensive profiles
- ⏰ **Attendance Tracking** - Real-time attendance monitoring and reporting
- 📅 **Leave Management** - Digital leave request and approval workflow with calendar view
- 💰 **Payroll Processing** - Automated salary calculations with SSS, PhilHealth, Pag-IBIG, and tax deductions
- 📊 **Reports & Analytics** - Comprehensive HR reports and compliance documentation
- 🔒 **Role-based Access** - Secure access control for different user levels
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Build Tool**: Vite
- **Routing**: React Router v6

## Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Firebase project account

### Setup Instructions

1. **Clone the repository**
   bash
   git clone <repository-url>
   cd hris-master
   

2. **Install dependencies**
   bash
   npm install
   

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication, Firestore, and Storage
   - Copy your Firebase config to .env

4. **Start development server**
   bash
   npm run dev
   

5. **Build for production**
   bash
   npm run build
   

## User Roles

- **System Owner**: Full platform access, manages multiple companies
- **HR Administrator**: Company-level access, manages employees and HR operations
- **Employee**: Self-service access to view personal information and submit requests

## Deployment

The application is configured for deployment on Vercel:

bash
vercel deploy


## License

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

© 2026 DevSpot. All rights reserved.

## Support

For support inquiries, please contact DevSpot.
