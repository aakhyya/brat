import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

function Signup(){
    const navigate=useNavigate();
    const {signup,loading,error}= useAuth();

    const [formData, setFormData] = useState({
        displayName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [localError, setLocalError] = useState(null);

    function handleChange(e){
        setFormData({
            ...formData,
            [e.target.name]:e.target.value,
        });
        setLocalError(null);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLocalError(null);

        const {displayName,email,password,confirmPassword}=formData;
        if(!email || !password || !displayName || !confirmPassword){
            setLocalError("All fields are required");
            return;
        }
        if (password.length < 6) {
            setLocalError("Password must be at least 6 characters");
            return;
        }
        if (password !== confirmPassword) {
            setLocalError("Passwords do not match");
            return;
        }

        try{
            await signup(email,password,displayName);
            navigate("/dashboard");
        }
        catch(err){
            console.error("Sign Up failed", err);
        }
    }

    return(
        <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        p-4
        relative
        overflow-hidden
      ">
      {/* Centered Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="
              text-6xl
              md:text-5xl
              font-black
              uppercase
              tracking-tighter
              text-chrome
              mb-2
            "
          >
            Sign up
          </h1>

        </div>

        {/* Form Container */}
        <div
          className="
            glossy-black
            p-8
            rounded-2xl
            shadow-2xl
          "
        >
          {/* Alerts */}
          {localError && <Alert type="error" message={localError} />}
          {error && <Alert type="error" message={error} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Display Name"
              type="text"
              name="displayName"
              placeholder="your name"
              value={formData.displayName}
              onChange={handleChange}
              icon={<span>💀</span>}
            />

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              icon={<span>✉︎</span>}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={<span>🔒</span>}
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={<span>⟳</span>}
            />

            <Button type="submit" loading={loading}>
              Sign up
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-dark-chrome text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="
                  text-neon-green
                  font-bold
                  hover:text-electric-cyan
                  transition-colors
                "
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    );

}

export default Signup;