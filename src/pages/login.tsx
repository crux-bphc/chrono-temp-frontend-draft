import { AtSign } from "lucide-react";

const Login = () => {
  return (
    <>
      <div className="flex bg-slate-950 h-screen w-full justify-center items-center">
        <div className="flex flex-col items-center">
          <span className="scroll-m-20 text-lg tracking-tight lg:text-xl text-slate-400">
            Welcome to
          </span>
          <h1 className="scroll-m-20 text-6xl font-extrabold tracking-tight lg:text-7xl text-slate-50">
            ChronoFactorem <sup>ᵝ</sup>
          </h1>
          <a
            href={`${import.meta.env.VITE_BACKEND_URL}/auth/google`}
            className="w-fit mt-6 bg-slate-700 text-slate-50 rounded-lg flex px-4 py-2 items-center font-bold hover:bg-slate-600 transition ease-in-out"
          >
            <AtSign className="mr-2 h-4 w-4" />
            Login with Google
          </a>
          <a
            href="/about"
            className="w-fit mt-8 text-slate-400 text-lg hover:underline underline-offset-4"
          >
            About ChronoFactorem ᵝ
          </a>
        </div>
      </div>
      <span className="fixed bottom-0 bg-slate-800 w-full text-center py-1 text-md tracking-tight lg:text-lg text-slate-400">
        Powered by CRUx: The Programming and Computing Club of BITS Hyderabad
      </span>
    </>
  );
};

export default Login;
