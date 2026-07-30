import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await login(data);
      if (result.success) {
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Invalid credentials.');
      }
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Google Font – Poppins */}
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      <div style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Poppins', 'Segoe UI', sans-serif",
        overflow: 'hidden',
      }}>

        {/* ── Full Background Image ── */}
        <img
          src="/login-bg.jpg"
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            zIndex: 0,
          }}
        />

        {/* ── Very light center-focused overlay so image shines through ── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.28) 100%)',
        }} />

        {/* ── Centered Glassmorphism Card ── */}
        <div style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: 400,
          margin: '24px',
          background: 'rgba(8, 10, 14, 0.48)',        /* ← faded, see-through */
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          borderRadius: 22,
          border: '1px solid rgba(255,255,255,0.16)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
          padding: '40px 36px',
        }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <img
              src="/logo.png"
              alt="Builders Brick"
              style={{ height: 50, width: 'auto', margin: '0 auto' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 26 }}>
            <h2 style={{
              color: '#ffffff',
              fontSize: 24,
              fontWeight: 800,
              margin: '0 0 5px',
              letterSpacing: -0.3,
              textAlign: 'center',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
              fontFamily: "'Poppins', sans-serif",
            }}>
              Welcome Back
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 13,
              textAlign: 'center',
              margin: 0,
              fontWeight: 400,
              fontFamily: "'Poppins', sans-serif",
            }}>
              Sign in to your CRM dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Email */}
            <div>
              <label style={{
                display: 'block',
                color: 'rgba(255,255,255,0.75)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                marginBottom: 7,
                fontFamily: "'Poppins', sans-serif",
              }}>
                Email Address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                placeholder="you@builderbrick.com"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '12px 15px',
                  background: 'rgba(255,255,255,0.10)',
                  border: errors.email
                    ? '1.5px solid rgba(239,68,68,0.7)'
                    : '1.5px solid rgba(255,255,255,0.18)',
                  borderRadius: 11,
                  color: '#fff',
                  fontSize: 14,
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 400,
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(124,132,255,0.8)';
                  e.target.style.background = 'rgba(124,132,255,0.12)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(92,107,192,0.15)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = errors.email ? 'rgba(239,68,68,0.7)' : 'rgba(255,255,255,0.18)';
                  e.target.style.background = 'rgba(255,255,255,0.10)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.email && (
                <p style={{ color: '#f87171', fontSize: 11.5, marginTop: 5, fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block',
                color: 'rgba(255,255,255,0.75)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                marginBottom: 7,
                fontFamily: "'Poppins', sans-serif",
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Minimum 6 characters',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '12px 44px 12px 15px',
                    background: 'rgba(255,255,255,0.10)',
                    border: errors.password
                      ? '1.5px solid rgba(239,68,68,0.7)'
                      : '1.5px solid rgba(255,255,255,0.18)',
                    borderRadius: 11,
                    color: '#fff',
                    fontSize: 14,
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 400,
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(124,132,255,0.8)';
                    e.target.style.background = 'rgba(124,132,255,0.12)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(92,107,192,0.15)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = errors.password ? 'rgba(239,68,68,0.7)' : 'rgba(255,255,255,0.18)';
                    e.target.style.background = 'rgba(255,255,255,0.10)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.45)', padding: 0,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword
                    ? <EyeSlashIcon style={{ width: 17, height: 17 }} />
                    : <EyeIcon style={{ width: 17, height: 17 }} />
                  }
                </button>
              </div>
              {errors.password && (
                <p style={{ color: '#f87171', fontSize: 11.5, marginTop: 5, fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: -2 }}>
              <input
                type="checkbox"
                style={{ width: 14, height: 14, accentColor: '#7c84ff', cursor: 'pointer' }}
              />
              <span style={{
                color: 'rgba(255,255,255,0.48)', fontSize: 12.5,
                fontFamily: "'Poppins', sans-serif", fontWeight: 400,
              }}>
                Remember me
              </span>
            </label>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '13px 24px',
                background: isLoading
                  ? 'rgba(92,107,192,0.4)'
                  : 'linear-gradient(135deg, #5c6bc0 0%, #7c3aed 100%)',
                border: 'none', borderRadius: 12,
                color: '#fff', fontSize: 14.5,
                fontWeight: 700,
                fontFamily: "'Poppins', sans-serif",
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.25s',
                boxShadow: isLoading ? 'none' : '0 6px 26px rgba(92,107,192,0.45)',
                marginTop: 6,
                letterSpacing: 0.4,
              }}
              onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(92,107,192,0.55)'; } }}
              onMouseLeave={e => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 26px rgba(92,107,192,0.45)'; } }}
            >
              {isLoading ? (
                <>
                  <svg style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }}
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRightIcon style={{ width: 15, height: 15 }} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p style={{
            textAlign: 'center', marginTop: 24, marginBottom: 0,
            color: 'rgba(255,255,255,0.22)', fontSize: 11,
            fontFamily: "'Poppins', sans-serif", fontWeight: 400,
          }}>
            © 2025 Builders Brick. All rights reserved.
          </p>
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          input::placeholder {
            color: rgba(255,255,255,0.28) !important;
            font-family: 'Poppins', sans-serif !important;
            font-weight: 400 !important;
            letter-spacing: 0 !important;
          }
        `}</style>
      </div>
    </>
  );
};

export default Login;
