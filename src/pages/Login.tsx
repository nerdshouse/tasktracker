/*
 *
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { whatsappService } from '../services/whatsapp';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AlertTriangle, ArrowLeft, CheckCircle2, KeyRound, MessageSquare, Phone } from 'lucide-react';

type ForgotStep = 'phone' | 'otp' | 'reset' | 'success';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>('phone');
  const [fpPhone, setFpPhone] = useState('');
  const [fpOtp, setFpOtp] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpConfirmPassword, setFpConfirmPassword] = useState('');
  const [fpError, setFpError] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpUserId, setFpUserId] = useState('');
  const [fpUserPhone, setFpUserPhone] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await api.login(email, password);
      login(user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleEmail = result.user.email;

      if (!googleEmail) {
        throw new Error('Google account has no email address.');
      }

      const user = await api.loginWithGoogle(googleEmail);
      login(user);
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpError('');
    setFpLoading(true);
    try {
      const found = await api.findUserByPhone(fpPhone);
      if (!found) {
        setFpError('No account found with this mobile number.');
        return;
      }
      setFpUserId(found.id);
      setFpUserPhone(found.phone);

      const otp = await api.createOtp(found.id);
      await whatsappService.sendOtp({ phone: found.phone, otp });

      setForgotStep('otp');
    } catch (err: any) {
      setFpError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setFpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpError('');
    setFpLoading(true);
    try {
      const valid = await api.verifyOtp(fpUserId, fpOtp);
      if (!valid) {
        setFpError('Invalid or expired OTP. Please try again.');
        return;
      }
      setForgotStep('reset');
    } catch (err: any) {
      setFpError(err.message || 'Verification failed. Please try again.');
    } finally {
      setFpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setFpError('');
    setFpLoading(true);
    try {
      const otp = await api.createOtp(fpUserId);
      await whatsappService.sendOtp({ phone: fpUserPhone, otp });
      setFpOtp('');
      setFpError('');
    } catch (err: any) {
      setFpError(err.message || 'Failed to resend OTP.');
    } finally {
      setFpLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpError('');

    if (fpNewPassword.length < 6) {
      setFpError('Password must be at least 6 characters.');
      return;
    }
    if (fpNewPassword !== fpConfirmPassword) {
      setFpError('Passwords do not match.');
      return;
    }

    setFpLoading(true);
    try {
      await api.resetPassword(fpUserId, fpNewPassword);
      setForgotStep('success');
    } catch (err: any) {
      setFpError(err.message || 'Failed to reset password.');
    } finally {
      setFpLoading(false);
    }
  };

  const resetForgotState = () => {
    setShowForgot(false);
    setForgotStep('phone');
    setFpPhone('');
    setFpOtp('');
    setFpNewPassword('');
    setFpConfirmPassword('');
    setFpError('');
    setFpUserId('');
    setFpUserPhone('');
  };

  const renderForgotPassword = () => {
    return (
      <div className="space-y-5">
        {/* Back button */}
        {forgotStep !== 'success' && (
          <button
            type="button"
            onClick={resetForgotState}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>
        )}

        {/* Error display */}
        {fpError && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl flex items-start gap-3">
            <AlertTriangle size={18} className="shrink-0 mt-0.5 text-red-500" />
            <p className="text-sm font-medium">{fpError}</p>
          </div>
        )}

        {/* Step 1: Enter Phone */}
        {forgotStep === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="text-center mb-2">
              <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-3">
                <Phone size={24} className="text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Forgot Password?</h3>
              <p className="text-sm text-slate-500 mt-1">
                Enter your registered mobile number. We'll send a verification code via WhatsApp.
              </p>
            </div>
            <Input
              label="Mobile Number"
              type="tel"
              value={fpPhone}
              onChange={(e) => setFpPhone(e.target.value)}
              required
              placeholder="+91 98765 43210"
            />
            <Button type="submit" className="w-full h-11 text-sm font-semibold cursor-pointer" isLoading={fpLoading}>
              Send OTP
            </Button>
          </form>
        )}

        {/* Step 2: Enter OTP */}
        {forgotStep === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center mb-2">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <MessageSquare size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Verify OTP</h3>
              <p className="text-sm text-slate-500 mt-1">
                Enter the 6-digit code sent to your WhatsApp.
              </p>
            </div>
            <Input
              label="OTP Code"
              type="text"
              value={fpOtp}
              onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              placeholder="123456"
              maxLength={6}
            />
            <Button type="submit" className="w-full h-11 text-sm font-semibold" isLoading={fpLoading}>
              Verify
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={fpLoading}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50 cursor-pointer"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {forgotStep === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center mb-2">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
                <KeyRound size={24} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Create New Password</h3>
              <p className="text-sm text-slate-500 mt-1">
                Choose a strong password (minimum 6 characters).
              </p>
            </div>
            <Input
              label="New Password"
              type="password"
              value={fpNewPassword}
              onChange={(e) => setFpNewPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <Input
              label="Confirm Password"
              type="password"
              value={fpConfirmPassword}
              onChange={(e) => setFpConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <Button type="submit" className="w-full h-11 text-sm font-semibold" isLoading={fpLoading}>
              Reset Password
            </Button>
          </form>
        )}

        {/* Step 4: Success */}
        {forgotStep === 'success' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Password Reset Successful!</h3>
            <p className="text-sm text-slate-500">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <Button
              type="button"
              onClick={resetForgotState}
              className="w-full h-11 text-sm font-semibold cursor-pointer"
            >
              Back to Login
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <div className="w-full max-w-md">
        <div className="card shadow-lg shadow-slate-200/50 pt-4 px-8 pb-8">
          <div className="flex justify-center overflow-hidden">
            <img
              src="/logo.jpg"
              alt="Nerdshouse"
              className="w-[161px] h-[161px] object-contain object-center block"
            />
          </div>

          {showForgot ? (
            <div className="mt-4">
              {renderForgotPassword()}
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl mb-6 flex items-start gap-3 mt-4">
                  <AlertTriangle size={20} className="shrink-0 mt-0.5 text-red-500" />
                  <div className="text-sm">
                    <p className="font-medium">{error}</p>
                    {error === 'Invalid email or password' && (
                      <p className="mt-2 text-red-600/90">
                        Contact your administrator for access.
                      </p>
                    )}
                  </div>
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-5 mt-4">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                <Button type="submit" className="w-full h-11 text-sm font-semibold" isLoading={loading}>
                  Sign in
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-slate-500">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 text-sm font-medium flex items-center justify-center gap-2 bg-white"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </Button>
              </form>
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => { setShowForgot(true); setError(''); }}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
