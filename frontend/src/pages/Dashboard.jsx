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
        px-4 sm:px-6 lg:px-8
        py-6 sm:py-8 lg:py-10
        relative
        overflow-hidden
      "
        >

            {/* Content Container */}
            <div className="relative z-10 max-w-4xl mx-auto">
                {/* Header */}
                <h1
                    className="
                                text-5xl sm:text-6xl md:text-7xl lg:text-8xl
                                font-serif
                                font-black
                                uppercase
                                tracking-tighter
                                text-chrome
                                mb-4 sm:mb-6
                                text-center
                            "
                >
                    ♱ Brat ♱
                </h1>
                {/* Welcome Card */}
                <div
                    className="
            glossy-black
            p-4 sm:p-6 lg:p-8
            rounded-2xl
            shadow-2xl
            mb-6 sm:mb-8
          "
                >
                    {/* User Info Header */}
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 mb-6">
                        {/* Avatar & User Info */}
                        <div className="flex items-center gap-3 sm:gap-5 w-full lg:w-auto">
                            <div
  className="
    w-16 h-16 sm:w-20 sm:h-20
    rounded-full
    overflow-hidden
    flex-shrink-0
  "
>
  <img
    src="/1.jpg"
    alt="User Avatar"
    className="w-full h-full object-cover"
  />
</div>

                            <div className="flex-1 min-w-0">
                                <h2
                                    className="
                  text-xl sm:text-2xl lg:text-3xl
                  font-black
                  text-neon-green
                  mb-1 sm:mb-2
                  truncate
                "
                                >
                                    Welcome {user?.profile?.displayName}ᝰ🚬
                                </h2>
                                <p className="text-chrome-silver text-sm sm:text-base lg:text-lg">
                                    prove you're not tasteless
                                </p>
                            </div>
                        </div>

                        {/* Primary Action: Search Content */}
                        <div className="w-full lg:w-auto flex justify-center lg:justify-end">
                            <Link to="/home" className="w-full sm:w-auto">
                            <Button variant="secondary">
                                enter brat
                            </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div
                        className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-3 sm:gap-4
              mb-4 sm:mb-6
            "
                    >
                        <div
                            className="
                bg-glossy-black/50
                p-3 sm:p-4
                rounded-lg
                border-2
                border-neon-green/30
              "
                        >
                            <p className="text-dark-chrome text-xs sm:text-sm uppercase tracking-wide mb-1">
                                Email
                            </p>
                            <p className="text-chrome-silver font-bold text-sm sm:text-base truncate">
                                {user?.email}
                            </p>
                        </div>

                        <div
                            className="
                bg-glossy-black/50
                p-3 sm:p-4
                rounded-lg
                border-2
                border-neon-green/30
              "
                        >
                            <p className="text-dark-chrome text-xs sm:text-sm uppercase tracking-wide mb-1">
                                Member Since
                            </p>
                            <p className="text-chrome-silver font-bold text-sm sm:text-base">
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
            p-4 sm:p-6
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
              text-base sm:text-lg lg:text-xl
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
