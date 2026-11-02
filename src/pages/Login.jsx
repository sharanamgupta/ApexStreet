import React from 'react';
import BrandPanel from '../components/auth/BrandPanel.jsx';
import LoginForm from '../components/auth/LoginForm.jsx';

function Login() {
  return (
    <main className="login-page">
      <BrandPanel />
      <section className="auth-shell" aria-label="ApexStreet authentication">
        <LoginForm />
      </section>
    </main>
  );
}

export default Login;
