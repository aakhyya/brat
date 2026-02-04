import useAuth from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({children}){
    const {isAuthenticated,loading}=useAuth();

    if(loading){ //checking Auth status
        return(
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                    <div className='w-16
                                h-16
                                border-4
                                border-neon-green
                                border-t-transparent
                                rounded-full
                                animate-spin
                                mx-auto
                                mb-4'/>
                    <p className='text-chrome-silver text-xl font-bo uppercase tracking-wider'>
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) { //Not Authenticated
        return <Navigate to="/login" replace />;
    }

    return children; //Logged in
}

export default ProtectedRoute;