import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './login/Login';
import ChangePassword from './login/ChangePassword';
import Dashboard from './dashboard/Dashboard';
import ApplicationForm from './applicationForm/applicationForm';
import ApplicationStatus from './applicationStatus/Page';
import PaymentInformation from './paymentInformation/Page';
import DocumentUpload from './documentUpload/Page';
import Messages from './messages/Page';
import Profile from './profile/Page';
import Settings from './settings/Page';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} /> 
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/application-form" element={<ApplicationForm />} />
        <Route path="/application-status" element={<ApplicationStatus />} />
        <Route path="/payment-information" element={<PaymentInformation />} />
        <Route path="/document-upload" element={<DocumentUpload />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
