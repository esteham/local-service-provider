import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const OTPVerification = ({ show, onHide, userData, onVerificationSuccess }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost';

    // Countdown timer for resend button
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // Auto-focus next input when typing
    const handleOtpChange = (index, value) => {
        if (value.length > 1) return; // Prevent multiple characters
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    // Handle backspace
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    // Handle paste
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        
        for (let i = 0; i < 6; i++) {
            newOtp[i] = pastedData[i] || '';
        }
        setOtp(newOtp);
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post(`${BASE_URL}/backend/api/auth/verify_otp.php`, {
                user_id: userData.id,
                otp_code: otpCode
            }, {
                withCredentials: true
            });

            if (response.data.success) {
                setSuccess(response.data.message);
                setTimeout(() => {
                    onVerificationSuccess(response.data.data);
                    onHide();
                }, 1500);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            setError(error.response?.data?.message || 'Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setResendLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post(`${BASE_URL}/backend/api/auth/resend_otp.php`, {
                user_id: userData.id
            }, {
                withCredentials: true
            });

            if (response.data.success) {
                setSuccess('OTP sent successfully! Please check your email.');
                setCountdown(60); // 60 second countdown
                setOtp(['', '', '', '', '', '']); // Clear current OTP
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            setError(error.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResendLoading(false);
        }
    };

    const handleClose = () => {
        setOtp(['', '', '', '', '', '']);
        setError('');
        setSuccess('');
        setCountdown(0);
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Email Verification</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="text-center mb-4">
                    <div className="mb-3">
                        <i className="fas fa-envelope-circle-check text-primary" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h5>Check Your Email</h5>
                    <p className="text-muted">
                        We've sent a 6-digit verification code to<br />
                        <strong>{userData?.email}</strong>
                    </p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleVerifyOTP}>
                    <div className="d-flex justify-content-center mb-4">
                        {otp.map((digit, index) => (
                            <Form.Control
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="text-center mx-1"
                                style={{ 
                                    width: '50px', 
                                    height: '50px', 
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold'
                                }}
                                maxLength={1}
                                pattern="\d*"
                                inputMode="numeric"
                            />
                        ))}
                    </div>

                    <div className="d-grid gap-2">
                        <Button 
                            type="submit" 
                            variant="primary" 
                            size="lg"
                            disabled={loading || otp.join('').length !== 6}
                        >
                            {loading ? (
                                <>
                                    <Spinner size="sm" className="me-2" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify Email'
                            )}
                        </Button>
                    </div>
                </Form>

                <div className="text-center mt-4">
                    <p className="text-muted mb-2">Didn't receive the code?</p>
                    <Button
                        variant="link"
                        onClick={handleResendOTP}
                        disabled={resendLoading || countdown > 0}
                        className="p-0"
                    >
                        {resendLoading ? (
                            <>
                                <Spinner size="sm" className="me-1" />
                                Sending...
                            </>
                        ) : countdown > 0 ? (
                            `Resend in ${countdown}s`
                        ) : (
                            'Resend OTP'
                        )}
                    </Button>
                </div>

                <div className="mt-4 p-3 bg-light rounded">
                    <small className="text-muted">
                        <strong>Note:</strong> The OTP is valid for 10 minutes. 
                        {userData?.role === 'worker' || userData?.role === 'agent' ? (
                            <> After verification, your account will be pending admin approval.</>
                        ) : (
                            <> After verification, your account will be activated.</>
                        )}
                    </small>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default OTPVerification;
