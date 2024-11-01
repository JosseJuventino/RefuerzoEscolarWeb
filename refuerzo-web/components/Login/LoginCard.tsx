"use client";

import Illustration from "./Ilustration";
import LoginForm from "./LoginForm";

const LoginCard: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <Illustration />
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginCard;
