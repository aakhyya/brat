import { createContext,useEffect,useState } from "react";
import api from "../services/api";

const AuthContext=createContext();

export function AuthProvider({children}){
    const [user,setUser]=useState("");
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState("");

    useEffect(()=>{
        async function checkAuth(){
            const token=localStorage.getItem("token");
            if(!token){
                setLoading(false);
                return;
            }

            try{
                //attaches the JWT token to every future API request
                api.defaults.headers.common["Authorization"]=`Bearer ${token}`;
                const response=await api.get("/api/auth/me");
                setUser(response.data.data.user);
            }
            catch(err){
                localStorage.removeItem("token");
                delete api.defaults.headers.common["Authorization"];
                setUser(null);
                setError(err.response?.data?.error || "Something went wrong!");
            }
            finally{
                setLoading(false);
            }
        }

        checkAuth();
    },[]);

    async function login(email, password){
        setError(null);
        setLoading(true);
        try{
            const response= await api.post("/api/auth/login",{
                email,
                password,
            });
            const {token,user}=response.data.data;
            localStorage.setItem("token",token);
            api.defaults.headers.common["Authorization"]=`Bearer ${token}`;
            setUser(user);
        }
        catch(err){
            setError(err.response?.data?.error || "Login failed");
        }
        finally{
            setLoading(false);
        }
    }

    async function signup(email,password,displayName) {
        setError(null);
        setLoading(true);
        try{
            const response= await api.post("/api/auth/signup",{
                email,
                password,
                displayName,
            });
            const {token,user}=response.data.data;
            localStorage.setItem("token",token);
            api.defaults.headers.common["Authorization"]=`Bearer ${token}`;
            setUser(user);
        }
        catch(err){
            setError(err.response?.data?.error || "Signup failed");
        }
        finally{
            setLoading(false);
        }
    }

    async function logout() {
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
    }

    const value={
        user,
        loading,
        error,
        login,
        signup,
        logout,
        isAuthenticated:!!user,
    }

    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
