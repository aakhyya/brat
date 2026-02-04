import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

function Login() {
    const navigate = useNavigate();
    const { login, loading, error } = useAuth();
    //localerror: client side errors
    //error: server errors(handled by useAuth())
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [localError, setLocalError] = useState(null);

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
            //"email" -> whatever the user typed
        });
        setLocalError(null); //clear the error as soon as the user starts typing
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLocalError(null);

        const { email, password } = formData;
        if (!email || !password) {
            setLocalError("All fields are required");
            return;
        }

        try {
            await login(email, password);
            navigate("/dashboard");
        }
        catch (err) {
            console.error("Login failed", err); //server error handled by AuthContext
        }
    }
    return (
        <div className="
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
                    <h1 className="
            text-6xl
            md:text-5xl
            font-black
            uppercase
            tracking-tighter
            text-chrome
            mb-2
          ">
                        Login
                    </h1>
                </div>

                {/* Form Container */}
                <div className="
          glossy-black
          p-8
          rounded-2xl
          shadow-2xl
        ">
                    {/* Alerts */}
                    {localError && (
                        <Alert type="error" message={localError} />
                    )}

                    {error && (
                        <Alert type="error" message={error} />
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
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

                        <Button type="submit" loading={loading}>
                            Login
                        </Button>
                    </form>

                    {/* Signup Link */}
                    <div className="mt-6 text-center">
                        <p className="text-dark-chrome text-sm">
                            Don&apos;t have an account?{" "}
                            <Link
                                to="/signup"
                                className="
                  text-neon-green
                  font-bold
                  hover:text-electric-cyan
                  transition-colors
                "
                            >
                                Signup
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;