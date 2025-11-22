import React, { useState } from 'react';
import { requestOTP as sendOTP, verifyOTP } from '../services/authApi';
import './OTPForm.css';

const OTPForm = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'verify'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await sendOTP(email);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setOtpSent(true);
        setStep('verify');
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to send OTP. Please check your connection and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await verifyOTP(email, otp);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        // Reset form after successful verification
        setTimeout(() => {
          setEmail('');
          setOtp('');
          setStep('email');
          setOtpSent(false);
          setMessage({ type: '', text: '' });
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to verify OTP. Please check your connection and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setOtp('');
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="otp-form-container">
      <h2>OTP Authentication</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {step === 'email' ? (
        <form onSubmit={handleSendOTP} className="otp-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="otp-form">
          <div className="form-group">
            <label htmlFor="email-display">Email</label>
            <input
              type="email"
              id="email-display"
              value={email}
              disabled
              className="disabled-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="otp">Enter OTP</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              required
              disabled={loading}
              className="otp-input"
            />
            <small>Check your email for the OTP code</small>
          </div>
          <div className="button-group">
            <button type="button" onClick={handleBack} disabled={loading} className="btn-secondary">
              Back
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default OTPForm;

