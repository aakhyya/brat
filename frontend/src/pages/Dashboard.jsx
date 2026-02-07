import useAuth from "../hooks/useAuth";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";

function Dashboard() {
    const { user, logout } = useAuth();

    const memberSince = user?.createdAt ?
        new Date(user.createdAt).toLocaleDateString() :
        "Unknown";

    return (
        <div
            className="
        min-h-screen
        p-8
        relative
        overflow-hidden
      "
        >

            {/* Content Container */}
            <div className="relative z-10 max-w-4xl mx-auto">
                {/* Header */}
                <h1
                    className="
                                text-7xl
                                md:text-6xl
                                font-serif
                                font-black
                                uppercase
                                tracking-tighter
                                text-chrome
                                mb-4
                                text-center
                            "
                >
                    ♱ Brat ♱
                </h1>
                {/* Welcome Card */}
                <div
                    className="
            glossy-black
            p-8
            rounded-2xl
            shadow-2xl
            mb-8
          "
                >
                    {/* User Info Header */}
                    <div className="flex items-center justify-between mb-6">
                        {/* Avatar */}
                        <div className="flex justify-between">
                        <div
                            className="
                w-20
                h-20
                bg-black
                border-r-4
                border-neon-green
                text-neon-green
                rounded-full
                flex
                items-center
                justify-center
                text-4xl
              "
                        >
                            ☠︎︎
                        </div>
                        <div className="pl-5">
                            <h2
                                className="
                  text-3xl
                  font-black
                  text-neon-green
                  mb-2
                  
                "
                            >
                                Welcome {user?.profile?.displayName} ᝰ🚬
                            </h2>
                            <p className="text-chrome-silver text-lg">
                                prove you're not tasteless
                            </p>
                        </div>
                    </div>
                        
                    {/* Primary Action: Search Content */}
                    <div className="mb-8 flex justify-center">
                        <Link to="/search">
                            <Button variant="secondary">
                                Search Content
                            </Button>
                        </Link>
                    </div>

                        
                    </div>

                    {/* Info Grid */}
                    <div
                        className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
              mb-6
            "
                    >
                        <div
                            className="
                bg-glossy-black/50
                p-4
                rounded-lg
                border-2
                border-neon-green/30
              "
                        >
                            <p className="text-dark-chrome text-sm uppercase tracking-wide">
                                Email
                            </p>
                            <p className="text-chrome-silver font-bold">
                                {user?.email}
                            </p>
                        </div>

                        <div
                            className="
                bg-glossy-black/50
                p-4
                rounded-lg
                border-2
                border-neon-green/30
              "
                        >
                            <p className="text-dark-chrome text-sm uppercase tracking-wide">
                                Member Since
                            </p>
                            <p className="text-chrome-silver font-bold">
                                {memberSince}
                            </p>
                        </div>
                    </div>


                    {/* Logout Button */}
                    <div className="max-w-xs mx-auto">
                        <Button variant="secondary" onClick={logout}>
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Success Message Card */}
                <div
                    className="
            glossy-black
            p-6
            rounded-xl
            border-2
            border-electric-cyan/30
            text-center
          "
                >
                    <p
                        className="
              text-chrome-silver
              font-bold
              text-xl
              font-serif
              tracking-wide
            "
                    >
                        don♱ lie to the algorithm𓏲ּ𝄢
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;