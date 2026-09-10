import profilePhoto from "./../../assets/profile-photo.webp";

type props = {
  onLogin: () => void;
};

function LoginButton({ onLogin }: props) {
  return (
    <div
      className="group relative overflow-hidden rounded-md pointer"
      onClick={onLogin}
    >
      {/* Hover gradient */}
      <div className="absolute inset-0 bg-linear-to-r from-[#113fa6] via-[#113fa6] to-[#587cdb] opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100" />

      {/* Content */}
      <div className="relative py-3 px-4.5">
        <div className="flex gap-4">
          <div className="box-border h-16 w-16">
            <img
              src={profilePhoto}
              alt="user"
              className="rounded-md border-[3px] border-white transition-colors duration-300 group-hover:border-amber-400"
            />
          </div>

          <div className="font-arial">
            <p className="text-2xl text-white">Arian Makiabadi</p>

            <p className="text-sm font-bold text-[#000080] transition-colors duration-300 group-hover:text-amber-400">
              Full-Stack Developer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginButton;
