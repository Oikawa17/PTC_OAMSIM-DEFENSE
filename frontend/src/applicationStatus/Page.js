import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import './applicationStatus.css';
import { useNavigate } from 'react-router-dom';
import verifiedIcon from './assets/verified.png';
import TabBar from '../components/TabBar';
import pendingIcon from './assets/pending.png';
const STATUS_COLORS = {
  Completed: 'green',
  Pending: '#b58900',
};

const ApplicationStatus = () => {
  const [status, setStatus] = useState('Pending');
  const [docStatus, setDocStatus] = useState('Pending');
  const [docCount, setDocCount] = useState(0);
  const [docTotal, setDocTotal] = useState(7);
  const [submittedFields, setSubmittedFields] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState('Pending Verification (₱0)');
  const [paymentAmountPending, setPaymentAmountPending] = useState(0);
  const [paymentAmountVerified, setPaymentAmountVerified] = useState(0);
  const [appDetails, setAppDetails] = useState(null);
  const [detailsError, setDetailsError] = useState(null);
  const [examSchedule, setExamSchedule] = useState(null);
  const [examLoading, setExamLoading] = useState(true);
    const [profile, setProfile] = useState(null);
  const applicationId = localStorage.getItem('application_id');
  const navigate = useNavigate();

  useEffect(() => {
    if (!applicationId) return;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`http://localhost:5000/application-status/${applicationId}`);
        const data = await res.json();
        setStatus(data.applicationFormStatus);
        setDocStatus(data.documentRequirementsStatus);
        setDocCount(data.submittedCount);
        setDocTotal(data.totalRequired || 7);
        setSubmittedFields(data.submittedFields || []);
        setPaymentStatus(data.paymentStatus || 'Pending Verification (₱0)');
        setPaymentAmountPending(data.paymentAmountPending || 0);
        setPaymentAmountVerified(data.paymentAmountVerified || 0);
      } catch (error) {
        setStatus('Unable to fetch status');
        setDocStatus('Unable to fetch status');
        setSubmittedFields([]);
        setPaymentStatus('Unable to fetch status');
        setPaymentAmountPending(0);
        setPaymentAmountVerified(0);
      }
    };
    const fetchDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/application-status/application-details/${applicationId}`);
        if (res.ok) {
          const data = await res.json();
          setAppDetails(data);
          setDetailsError(null);
        } else if (res.status === 404) {
          setAppDetails(null);
          setDetailsError('Application details not found.');
        } else {
          setAppDetails(null);
          setDetailsError('Error fetching application details.');
        }
      } catch (error) {
        setAppDetails(null);
        setDetailsError('Error fetching application details.');
      }
    };
    const fetchExamSchedule = async () => {
      setExamLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/application-status/exam-schedule/${applicationId}`);
        if (res.ok) {
          const data = await res.json();
          setExamSchedule(data.exam_schedule); // could be null
        } else {
          setExamSchedule(null);
        }
      } catch (error) {
        setExamSchedule(null);
      }
      setExamLoading(false);
        };
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/profile/${applicationId}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        setProfile(null);
      }
    };
    fetchStatus();
    fetchDetails();
    fetchExamSchedule();
      fetchProfile();
  }, [applicationId]);

  // Payment status rendering logic
  let paymentDisplay;
  if (paymentAmountVerified === 1000) {
    paymentDisplay = (
      <div className="status-completed">
        Completed
      </div>
    );
  } else if (paymentStatus.startsWith('Pending Verification')) {
    paymentDisplay = (
      <div className="status-pending">
        Pending Verification (₱{paymentAmountPending})<br />
        Verified (₱{paymentAmountVerified})
      </div>
    );
  } else if (paymentStatus.startsWith('Verified')) {
    paymentDisplay = (
      <div className="status-pending">
        Verified (₱{paymentAmountVerified})
      </div>
    );
  } else {
    paymentDisplay = (
      <div className="status-pending">
        {paymentStatus}
      </div>
    );
  }

  // Exam schedule display logic
  let examDisplay;
  if (examLoading) {
    examDisplay = <div>Loading exam schedule...</div>;
  } else if (!examSchedule) {
    examDisplay = <div>To be assigned</div>;
  } else {
    // Format date as Month Day, Year
    const dateObj = new Date(examSchedule);
    const formatted = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    examDisplay = <div>{formatted}</div>;
  }

  return (
    <div>
      <TabBar profile={profile} />
      <div style={{ display: "flex" }}></div>
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="app-status-container">
        {/* --- Application Details Section (no container) --- */}
        <div className="app-details-no-container" style={{ marginBottom: 24, marginTop: 10, marginLeft: 60 }}>
          <h3 style={{ margin: 0, color: "#000000", marginBottom: 8, fontSize: "2.2rem" }}>Application Details</h3>
          {appDetails ? (
            <div>
              <div><strong>Application Number:</strong> {appDetails.application_id}</div>
              <div>
                <strong>Program applied for:</strong>{" "}
                {[appDetails.first_choice, appDetails.second_choice].filter(Boolean).join(', ')}
              </div>
            </div>
          ) : detailsError ? (
            <div style={{ color: 'red' }}>{detailsError}</div>
          ) : (
            <div>Loading application details...</div>
          )}
        </div>
        {/* --- Beautiful Divider Line --- */}
        <hr className="details-status-divider" />
        {/* --- End Application Details Section --- */}

        <h2 className="app-status-header">Application Status</h2>
        <div className="app-status-subheader">Track your application progress</div>
        <div className="app-status-timeline">
          {/* Application Form */}
          <div className={`timeline-step ${status === 'Completed' ? 'completed' : 'active'}`}>
            <span className="timeline-icon">
  {status === 'Completed'
    ? <img src={verifiedIcon} alt="Verified" className="verified-png" />
    :  <img src={pendingIcon} alt="Pending" className="verified-png" />}
</span>
            <div>
              <div className="timeline-title">Application Submitted</div>
              <div className="timeline-desc">
                {status === 'Completed'
                  ? 'Your application has been successfully submitted.'
                  : 'Please complete and submit your application form.'}
              </div>
            </div>
          </div>
          {/* Document Requirements */}
          <div className={`timeline-step ${docStatus.startsWith('Completed') ? 'completed' : (status === 'Completed' ? 'active' : '')}`}>
            <span className="timeline-icon">
  {docStatus.startsWith('Completed')
    ? <img src={verifiedIcon} alt="Verified" className="verified-png" />
    : <img src={pendingIcon} alt="Pending" className="verified-png" />}
</span>
            <div>
              <div className="timeline-title">Document Requirements</div>
              <div className="timeline-desc">
                {docStatus}
                {docStatus.startsWith('Pending') && (
                  <div className="app-status-doc-details">
                    <div>
                   <span style={{ color: 'red', fontWeight: 600 }}>
      
       Submitted:
       <br />
        
      </span>
            <span
          style={{ color: 'red', fontWeight: 400, marginLeft: 4, whiteSpace: 'pre-line' }}
        >
          {submittedFields.length > 0 ? submittedFields.join('\n') : 'None'}
        </span>
                    </div> 
                    <div>
                      <strong>{docCount}</strong> out of <strong>{docTotal}</strong> requirements submitted
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Payment */}
          <div className={`timeline-step ${paymentAmountVerified === 1000 ? 'completed' : (docStatus.startsWith('Completed') ? 'active' : '')}`}>
            <span className="timeline-icon">
  {paymentAmountVerified === 1000
    ? <img src={verifiedIcon} alt="Verified" className="verified-png" />
    :  <img src={pendingIcon} alt="Pending" className="verified-png" />}
</span>
            <div>
              <div className="timeline-title">Application Fee Payment</div>
              <div className="timeline-desc">
                {paymentDisplay}
              </div>
            </div>
          </div>
          {/* Exam Schedule */}
          <div className="timeline-step">
            <span className="timeline-icon">📝</span>
            <div>
              <div className="timeline-title">Exam Schedule</div>
              <div className="timeline-desc">{examDisplay}</div>
            </div>
          </div>
          {/* Final Decision */}
          <div className="timeline-step">
            <span className="timeline-icon">📩</span>
            <div>
              <div className="timeline-title">Final Decision</div>
              <div className="timeline-desc">
                Await for admin email regarding confirmation or additional action
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
     </div>
  );
};

export default ApplicationStatus;