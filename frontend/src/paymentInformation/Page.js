import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import './paymentInformation.css';
import TabBar from '../components/TabBar';
import gcashLogo from './assets/gcash.png';
import paymayaLogo from './assets/paymaya.png';
import bankLogo from './assets/bank.jpg';
import { QRCodeSVG } from 'qrcode.react';

const paymentMethods = [
  {
    key: 'GCash',
    name: 'GCash',
    logo: gcashLogo,
    details: [
      'Send money to: 0917-123-4567',
      'Account Name: Pateros Technological College',
      'Enter the amount: ₱1,000',
      'Use your Application ID as reference number'
    ],
    qrValue: 'GCASH|0917-123-4567|Pateros Technological College|1000'
  },
  {
    key: 'PayMaya',
    name: 'PayMaya',
    logo: paymayaLogo,
    details: [
      'Send money to: 0998-765-4321',
      'Account Name: Pateros Technological College',
      'Enter the amount: ₱1,000',
      'Use your Application ID as reference number'
    ],
    qrValue: 'PAYMAYA|0998-765-4321|Pateros Technological College|1000'
  },
  {
    key: 'Bank Transfer',
    name: 'Bank Transfer',
    logo: bankLogo,
    details: [
      'Bank: BDO',
      'Account Name: Pateros Technological College',
      'Account Number: 1234-5678-9012',
      'Amount: ₱1,000',
      'Use your Application ID as reference number'
    ],
    qrValue: 'BDO|1234-5678-9012|Pateros Technological College|1000'
  }
];

function PaymentInformation() {
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0].key);
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const applicationId = localStorage.getItem('application_id');

  useEffect(() => {
    fetch('http://localhost:5000/payment/methods')
      .then(res => res.json())
      .then(setMethods)
      .catch(() => setStatus('Unable to connect to payment server.'));

    if (applicationId) {
      fetch(`http://localhost:5000/payment/history/${applicationId}`)
        .then(res => res.json())
        .then(data => {
          setHistory(Array.isArray(data) ? data : []);
        })
        .catch(() => setHistory([]));
    }

    if (applicationId) {
      fetch(`http://localhost:5000/profile/${applicationId}`)
        .then(res => res.json())
        .then(data => setProfile(data))
        .catch(() => setProfile(null));
    }
  }, [applicationId]);

  const handleScreenshotChange = (e) => {
    setScreenshot(e.target.files[0]);
    setScreenshotUrl(URL.createObjectURL(e.target.files[0]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!selectedMethod || !reference || !amount) {
      setStatus('Please fill in all fields.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/payment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: applicationId,
          method: selectedMethod,
          reference_number: reference,
          amount
        })
      });
      const data = await res.json();
      setStatus(data.message || data.error);

      if (res.ok && screenshot) {
        const formData = new FormData();
        formData.append('application_id', applicationId);
        formData.append('screenshot', screenshot);
        const uploadRes = await fetch('http://localhost:5000/payment/upload-screenshot', {
          method: 'POST',
          body: formData
        });
        if (uploadRes.ok) {
          setStatus(prev => prev + ', Screenshot Uploaded successfully.');
        } else {
          setStatus(prev => prev + ', but screenshot upload failed.');
        }
      }

      if (applicationId) {
        fetch(`http://localhost:5000/payment/history/${applicationId}`)
          .then(res => res.json())
          .then(data => {
            setHistory(Array.isArray(data) ? data : []);
          })
          .catch(() => setHistory([]));
      }
    } catch (err) {
      setStatus('Failed to connect to server. Please try again later.');
    }
  };

  // Find the selected payment method for QR code
  const selectedMethodObj = paymentMethods.find(m => m.key === selectedMethod);

  return (
    <div>
      <TabBar profile={profile} />
      <div style={{ display: "flex" }}></div>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div className="payment-container">
          <h2>Payment Information</h2>
          <div className="payment-card">
            <div className="payment-header">
              <div>
                <strong>Application Fee:</strong> ₱1,000.00
              </div>
              <span className="payment-status unpaid">Unpaid</span>
            </div>
            <h3 className="payment-methods-title">Payment Methods</h3>
            <div className="payment-methods">
              {paymentMethods.map(method => (
                <div
                  key={method.key}
                  className={`payment-method${selectedMethod === method.key ? ' selected' : ''}`}
                  onClick={() => {
                    setSelectedMethod(method.key);
                    setAmount('1000');
                  }}
                >
                  <div className="payment-method-title">
                    <img src={method.logo} alt={method.name} className="method-icon" />
                    <span>{method.name}</span>
                  </div>
                  <div className="payment-method-details">
                    <ul>
                      {method.details.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            {/* QR Code container below payment methods */}
            <div
              style={{
                marginTop: 24,
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 2px 8px #e5e7eb',
                padding: 24,
                textAlign: 'center',
                maxWidth: 440,
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            >
              <h3>Scan QR Code to Pay ({selectedMethodObj.name})</h3>
              <QRCodeSVG value={selectedMethodObj.qrValue} size={180} />
            </div>
            <form onSubmit={handleSubmit} className="payment-form">
              <label>
                Payment Screenshot:
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                />
              </label>
              {screenshotUrl && (
                <div className="payment-screenshot-preview">
                  <img src={screenshotUrl} alt="Screenshot Preview" />
                </div>
              )}
              <button type="submit">Submit Payment</button>
            </form>
            {status && <div className="payment-status-message">{status}</div>}
          </div>
          <h3 style={{ marginTop: 32 }}>Payment History</h3>
          <div className="payment-history">
            {Array.isArray(history) && history.length === 0 ? (
              <div>No payment history found.</div>
            ) : (
              Array.isArray(history) && (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Method</th>
                      <th>Reference #</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id}>
                        <td>{new Date(item.created_at).toLocaleString()}</td>
                        <td>{item.method}</td>
                        <td>{item.reference_number}</td>
                        <td>₱{Number(item.amount).toLocaleString()}</td>
                        <td className={
                          item.status === 'Pending'
                            ? 'status-pending'
                            : item.status === 'Verified'
                              ? 'status-verified'
                              : ''
                        }>
                          {item.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentInformation;