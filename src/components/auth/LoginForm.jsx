import React, { useId, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 6.5h15v11h-15z" />
      <path d="m5 7 7 6 7-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 10V8a5 5 0 0 1 10 0v2" />
      <path d="M6 10h12v9H6z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function EyeIcon({ visible }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      {visible ? (
        <circle cx="12" cy="12" r="3" />
      ) : (
        <path d="m5 5 14 14M10.5 10.5a3 3 0 0 0 3 3M13.8 10.2A3 3 0 0 0 10.2 14" />
      )}
    </svg>
  );
}

const initialSignInValues = {
  email: '',
  password: '',
  remember: false,
};

const initialSignUpValues = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function validateSignIn(values) {
  const errors = {};
  const email = values.email.trim();

  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

function validateSignUp(values) {
  const errors = {};
  const fullName = values.fullName.trim();
  const email = values.email.trim();

  if (!fullName) {
    errors.fullName = 'Full name is required.';
  }

  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm password is required.';
  } else if (values.password && values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

function LoginForm({ selectedRole: externalRole, onRoleChange }) {
  const navigate = useNavigate();
  const [internalRole, setInternalRole] = useState('USER');
  const selectedRole = externalRole !== undefined ? externalRole : internalRole;
  const setSelectedRole = (role) => {
    setInternalRole(role);
    if (onRoleChange) {
      onRoleChange(role);
    }
  };
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [serverError, setServerError] = useState('');

  // Sign In State
  const signInEmailId = useId();
  const signInPasswordId = useId();
  const signInRememberId = useId();
  const [signInValues, setSignInValues] = useState(initialSignInValues);
  const [signInErrors, setSignInErrors] = useState({});
  const [signInTouched, setSignInTouched] = useState({});
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [isSignInSubmitting, setIsSignInSubmitting] = useState(false);

  // Sign Up State
  const signUpFullNameId = useId();
  const signUpEmailId = useId();
  const signUpPasswordId = useId();
  const signUpConfirmPasswordId = useId();
  const [signUpValues, setSignUpValues] = useState(initialSignUpValues);
  const [signUpErrors, setSignUpErrors] = useState({});
  const [signUpTouched, setSignUpTouched] = useState({});
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignUpSubmitting, setIsSignUpSubmitting] = useState(false);

  const visibleSignInErrors = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(signInErrors).filter(([field]) => signInTouched[field]),
      ),
    [signInErrors, signInTouched],
  );

  const visibleSignUpErrors = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(signUpErrors).filter(([field]) => signUpTouched[field]),
      ),
    [signUpErrors, signUpTouched],
  );

  function handleRoleSelect(role) {
    setSelectedRole(role);
    setSuccessMessage('');
    setServerError('');
  }

  function handleSwitchView(toSignUp) {
    setIsSignUp(toSignUp);
    setSuccessMessage('');
    setServerError('');
  }

  function updateSignInField(event) {
    const { name, type, checked, value } = event.target;
    const nextValues = {
      ...signInValues,
      [name]: type === 'checkbox' ? checked : value,
    };
    setSignInValues(nextValues);
    setSignInErrors(validateSignIn(nextValues));
    setServerError('');
  }

  function markSignInTouched(event) {
    setSignInTouched((current) => ({
      ...current,
      [event.target.name]: true,
    }));
  }

  async function handleSignInSubmit(event) {
    event.preventDefault();
    const nextErrors = validateSignIn(signInValues);
    setSignInErrors(nextErrors);
    setSignInTouched({ email: true, password: true });

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSignInSubmitting(true);
    setServerError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signInValues.email,
          password: signInValues.password,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const fallbackMsg =
          selectedRole === 'OPERATOR'
            ? 'Invalid Operator credentials.'
            : 'Invalid User credentials.';
        setServerError(data.message || fallbackMsg);
        setIsSignInSubmitting(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        // The API validates the selected role against the stored account.
        // Keep the accepted portal role authoritative for the client session.
        const userRole = selectedRole.toUpperCase();
        localStorage.setItem(
          'user',
          JSON.stringify({ ...data.user, role: userRole }),
        );
        navigate(userRole === 'USER' ? '/user-dashboard' : '/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setServerError('Unable to connect to backend server. Please try again later.');
    } finally {
      setIsSignInSubmitting(false);
    }
  }

  function updateSignUpField(event) {
    const { name, value } = event.target;
    const nextValues = {
      ...signUpValues,
      [name]: value,
    };
    setSignUpValues(nextValues);
    setSignUpErrors(validateSignUp(nextValues));
    setServerError('');
  }

  function markSignUpTouched(event) {
    setSignUpTouched((current) => ({
      ...current,
      [event.target.name]: true,
    }));
  }

  async function handleSignUpSubmit(event) {
    event.preventDefault();
    const nextErrors = validateSignUp(signUpValues);
    setSignUpErrors(nextErrors);
    setSignUpTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSignUpSubmitting(true);
    setServerError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: signUpValues.fullName,
          email: signUpValues.email,
          password: signUpValues.password,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message || 'Registration failed.');
        setIsSignUpSubmitting(false);
        return;
      }

      // Registration returns an authenticated session, so take the new user
      // straight to the appropriate dashboard instead of requiring a second login.
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Use the role selected in this signup form for routing. The backend
        // also persists this role and includes it in the returned user payload.
        const userRole = selectedRole.toUpperCase();
        navigate(userRole === 'USER' ? '/user-dashboard' : '/dashboard');
      } else {
        setServerError('Account created, but no login session was returned. Please sign in.');
        setIsSignUpSubmitting(false);
      }
    } catch (err) {
      setServerError('Unable to connect to backend server. Please try again later.');
    } finally {
      setIsSignUpSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      {/* 1. ROLE SELECTION PROMPT */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ margin: '0 0 10px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#73e6ff', textAlign: 'center', letterSpacing: '0.14em' }}>
          {isSignUp ? 'Choose an account type' : 'Who are you logging in as?'}
        </p>
        <div className="auth-switch" role="radiogroup" aria-label="Role Selection">
            <button
              type="button"
              className={`auth-switch-btn ${selectedRole === 'USER' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('USER')}
            >
              USER
            </button>
            <button
              type="button"
              className={`auth-switch-btn ${selectedRole === 'OPERATOR' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('OPERATOR')}
            >
              OPERATOR
            </button>
        </div>
      </div>

      {/* 2. AUTH VIEW SWITCH (SIGN IN / SIGN UP) */}
      <div className="auth-switch" role="tablist" aria-label="Authentication mode">
        <button
          type="button"
          role="tab"
          id="sign-in-tab"
          aria-selected={!isSignUp}
          aria-controls="auth-form-panel"
          className={`auth-switch-btn ${!isSignUp ? 'active' : ''}`}
          onClick={() => handleSwitchView(false)}
        >
          Sign In
        </button>
        <button
          type="button"
          role="tab"
          id="sign-up-tab"
          aria-selected={isSignUp}
          aria-controls="auth-form-panel"
          className={`auth-switch-btn ${isSignUp ? 'active' : ''}`}
          onClick={() => handleSwitchView(true)}
        >
          Sign Up
        </button>
      </div>

      {successMessage ? (
        <div className="auth-success-alert" role="status">
          {successMessage}
        </div>
      ) : null}

      {serverError ? (
        <div className="field-error" style={{ marginBottom: '16px', textAlign: 'center', fontSize: '14px' }} role="alert">
          {serverError}
        </div>
      ) : null}

      {!isSignUp ? (
        <form
          id="auth-form-panel"
          noValidate
          onSubmit={handleSignInSubmit}
          role="tabpanel"
          aria-labelledby="sign-in-tab"
        >
          <div className="auth-heading">
            <p>{selectedRole} PORTAL</p>
            <h2>Sign in to ApexStreet</h2>
            <span>
              {selectedRole === 'USER'
                ? 'Access your view-only smart city monitoring portal.'
                : 'Access your smart street-light control center.'}
            </span>
          </div>

          <div className="field-group">
            <label htmlFor={signInEmailId}>Email Address</label>
            <div className="input-shell">
              <MailIcon />
              <input
                id={signInEmailId}
                name="email"
                type="email"
                placeholder={selectedRole === 'USER' ? 'user@apexstreet.com' : 'operator@apexstreet.com'}
                autoComplete="email"
                value={signInValues.email}
                onBlur={markSignInTouched}
                onChange={updateSignInField}
                aria-invalid={Boolean(visibleSignInErrors.email)}
                aria-describedby={
                  visibleSignInErrors.email ? `${signInEmailId}-error` : undefined
                }
              />
            </div>
            {visibleSignInErrors.email ? (
              <p className="field-error" id={`${signInEmailId}-error`}>
                {visibleSignInErrors.email}
              </p>
            ) : null}
          </div>

          <div className="field-group">
            <label htmlFor={signInPasswordId}>Password</label>
            <div className="input-shell">
              <LockIcon />
              <input
                id={signInPasswordId}
                name="password"
                type={showSignInPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={signInValues.password}
                onBlur={markSignInTouched}
                onChange={updateSignInField}
                aria-invalid={Boolean(visibleSignInErrors.password)}
                aria-describedby={
                  visibleSignInErrors.password
                    ? `${signInPasswordId}-error`
                    : undefined
                }
              />
              <button
                className="icon-button"
                type="button"
                onClick={() => setShowSignInPassword((current) => !current)}
                aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon visible={showSignInPassword} />
              </button>
            </div>
            {visibleSignInErrors.password ? (
              <p className="field-error" id={`${signInPasswordId}-error`}>
                {visibleSignInErrors.password}
              </p>
            ) : null}
          </div>

          <div className="form-row">
            <label className="remember-control" htmlFor={signInRememberId}>
              <input
                id={signInRememberId}
                name="remember"
                type="checkbox"
                checked={signInValues.remember}
                onChange={updateSignInField}
              />
              <span>Remember me</span>
            </label>
            <a href="/login" onClick={(event) => event.preventDefault()}>
              Forgot password?
            </a>
          </div>

          <button
            className="sign-in-button"
            type="submit"
            disabled={isSignInSubmitting}
          >
            {isSignInSubmitting ? `Signing in as ${selectedRole}...` : `Sign In as ${selectedRole}`}
          </button>

          <p className="auth-toggle-prompt">
            Don't have a {selectedRole.toLowerCase()} account?{' '}
            <button
              type="button"
              className="switch-link-button"
              onClick={() => handleSwitchView(true)}
            >
              Sign Up
            </button>
          </p>
        </form>
      ) : (
        <form
          id="auth-form-panel"
          noValidate
          onSubmit={handleSignUpSubmit}
          role="tabpanel"
          aria-labelledby="sign-up-tab"
        >
          <div className="auth-heading">
            <p>CREATE {selectedRole} ACCOUNT</p>
            <h2>Create Your Account</h2>
            <span>
              {selectedRole === 'USER'
                ? 'Join ApexStreet smart city user network.'
                : 'Join ApexStreet smart city operations network.'}
            </span>
          </div>

          <div className="field-group">
            <label htmlFor={signUpFullNameId}>Full Name</label>
            <div className="input-shell">
              <UserIcon />
              <input
                id={signUpFullNameId}
                name="fullName"
                type="text"
                placeholder="Alex Mercer"
                autoComplete="name"
                value={signUpValues.fullName}
                onBlur={markSignUpTouched}
                onChange={updateSignUpField}
                aria-invalid={Boolean(visibleSignUpErrors.fullName)}
                aria-describedby={
                  visibleSignUpErrors.fullName
                    ? `${signUpFullNameId}-error`
                    : undefined
                }
              />
            </div>
            {visibleSignUpErrors.fullName ? (
              <p className="field-error" id={`${signUpFullNameId}-error`}>
                {visibleSignUpErrors.fullName}
              </p>
            ) : null}
          </div>

          <div className="field-group">
            <label htmlFor={signUpEmailId}>Email Address</label>
            <div className="input-shell">
              <MailIcon />
              <input
                id={signUpEmailId}
                name="email"
                type="email"
                placeholder={selectedRole === 'USER' ? 'user@apexstreet.com' : 'operator@apexstreet.com'}
                autoComplete="email"
                value={signUpValues.email}
                onBlur={markSignUpTouched}
                onChange={updateSignUpField}
                aria-invalid={Boolean(visibleSignUpErrors.email)}
                aria-describedby={
                  visibleSignUpErrors.email ? `${signUpEmailId}-error` : undefined
                }
              />
            </div>
            {visibleSignUpErrors.email ? (
              <p className="field-error" id={`${signUpEmailId}-error`}>
                {visibleSignUpErrors.email}
              </p>
            ) : null}
          </div>

          <div className="field-group">
            <label htmlFor={signUpPasswordId}>Password</label>
            <div className="input-shell">
              <LockIcon />
              <input
                id={signUpPasswordId}
                name="password"
                type={showSignUpPassword ? 'text' : 'password'}
                placeholder="Create a password"
                autoComplete="new-password"
                value={signUpValues.password}
                onBlur={markSignUpTouched}
                onChange={updateSignUpField}
                aria-invalid={Boolean(visibleSignUpErrors.password)}
                aria-describedby={
                  visibleSignUpErrors.password
                    ? `${signUpPasswordId}-error`
                    : undefined
                }
              />
              <button
                className="icon-button"
                type="button"
                onClick={() => setShowSignUpPassword((current) => !current)}
                aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon visible={showSignUpPassword} />
              </button>
            </div>
            {visibleSignUpErrors.password ? (
              <p className="field-error" id={`${signUpPasswordId}-error`}>
                {visibleSignUpErrors.password}
              </p>
            ) : null}
          </div>

          <div className="field-group">
            <label htmlFor={signUpConfirmPasswordId}>Confirm Password</label>
            <div className="input-shell">
              <LockIcon />
              <input
                id={signUpConfirmPasswordId}
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                autoComplete="new-password"
                value={signUpValues.confirmPassword}
                onBlur={markSignUpTouched}
                onChange={updateSignUpField}
                aria-invalid={Boolean(visibleSignUpErrors.confirmPassword)}
                aria-describedby={
                  visibleSignUpErrors.confirmPassword
                    ? `${signUpConfirmPasswordId}-error`
                    : undefined
                }
              />
              <button
                className="icon-button"
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon visible={showConfirmPassword} />
              </button>
            </div>
            {visibleSignUpErrors.confirmPassword ? (
              <p className="field-error" id={`${signUpConfirmPasswordId}-error`}>
                {visibleSignUpErrors.confirmPassword}
              </p>
            ) : null}
          </div>

          <button
            className="sign-in-button"
            type="submit"
            style={{ marginTop: '26px' }}
            disabled={isSignUpSubmitting}
          >
            {isSignUpSubmitting ? `Creating ${selectedRole.toLowerCase()} account...` : `Sign Up as ${selectedRole}`}
          </button>

          <p className="auth-toggle-prompt">
            Already have an account?{' '}
            <button
              type="button"
              className="switch-link-button"
              onClick={() => handleSwitchView(false)}
            >
              Sign In
            </button>
          </p>
        </form>
      )}

      <p className="auth-footer">ApexStreet Smart City Management</p>
    </div>
  );
}

export default LoginForm;
