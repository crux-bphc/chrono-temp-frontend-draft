import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LogOut, ArrowUpRightFromCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCookies } from "react-cookie";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

const About = () => {
  const [userInfoCookie] = useCookies(["userInfo"]);
  const navigate = useNavigate();
  const createTimetable = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/timetable/create`,
      {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        mode: "cors",
        credentials: "include",
      }
    );
    const json = await res.json();
    if (res.status === 201) {
      navigate(`/edit/${json.id}`);
    } else if (res.status === 401) {
      navigate("/login");
    } else if (res.status === 500) {
      alert(`Server error: ${json.message}`);
    } else {
      alert(`Server error: ${JSON.stringify(json)}`);
    }
  };

  return (
    <>
      <div className="fixed -z-10 top-0 flex bg-slate-950 h-screen w-full"></div>
      <div className="flex flex-col w-full pb-20">
        <div className="flex w-full justify-between">
          <div className="flex items-center">
            <h1
              onClick={() => navigate("/")}
              className="scroll-m-20 cursor-pointer text-2xl font-extrabold tracking-tight lg:text-3xl m-4 text-slate-50"
            >
              ChronoFactorem <sup>ᵝ</sup>
            </h1>
            {userInfoCookie["userInfo"] && (
              <Button
                className="text-green-200 w-fit text-xl p-4 ml-4 bg-green-900 hover:bg-green-800"
                onClick={() => createTimetable()}
              >
                Create a timetable
              </Button>
            )}
          </div>
          {userInfoCookie["userInfo"] && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="rounded-full text-slate-50 bg-slate-500 p-1 px-3 text-xl h-fit mx-8 mt-4">
                  {userInfoCookie["userInfo"].name
                    ? (userInfoCookie["userInfo"].name as string)[0]
                    : "?"}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-800 text-slate-300 border-slate-700">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem
                  className="focus:bg-red-700 focus:text-red-100 cursor-pointer"
                  onClick={() => {
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
                      method: "GET",
                      headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type": "application/json",
                      },
                      mode: "cors",
                      credentials: "include",
                    });
                    navigate("/login");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <TooltipProvider>
          <div className="w-full pl-20 pt-16 flex flex-col">
            <h2 className="text-slate-50 text-4xl font-bold tracking-tight">
              About ChronoFactorem <sup>ᵝ</sup>
            </h2>
            <span className="text-slate-50 text-2xl w-2/3 pt-4">
              ChronoFactorem is a project that makes the process of creating
              timetables and sharing them easy as pie. ChronoFactorem is
              developed and maintained by CRUx: The Programming and Computing
              Club of BITS Hyderabad.
            </span>
            <span className="text-slate-50 text-2xl w-2/3 pt-4">
              This version of ChronoFactorem is a beta version we fastracked so
              that we can get the new version of ChronoFactorem out for this
              registration session. The frontend code is not up to CRUx
              standards, and was written by one sleepless loser in the span of 5
              days, which is why you might experience some bugs. If you do find
              them, please report them{" "}
              <a
                href="https://github.com/crux-bphc/chronofactorem-rewrite/issues"
                className="text-blue-400 inline pl-1 items-center"
              >
                here
                <ArrowUpRightFromCircle className="inline w-5 h-5 ml-1 mr-1" />
              </a>
              .
            </span>
            <span className="text-slate-50 text-2xl w-2/3 pt-4">
              This is a ground-up rewrite of the last iteration of
              ChronoFactorem. We thank Harshvardhan Jha (Product Owner +
              Developer), Aviral Agarwal (Scrum Master + Developer), Kushagra
              Gupta (Developer), Abhinav Sukumar Rao (Developer), Vikramjeet Das
              (Developer) for the previous version.
            </span>
            <span className="text-slate-50 text-2xl w-2/3 pt-4">
              This version has a different set of features to make it easier to
              make timetables. As we move on from this registration, you will
              see even more features being added to this project.
            </span>
            <span className="text-slate-50 text-2xl w-2/3 pt-4">
              The backend code is some of the most solid code we've written over
              the years, you can go look at it and star it{" "}
              <a
                href="https://github.com/crux-bphc/chronofactorem-rewrite/"
                className="text-blue-400 inline pl-1 items-center"
              >
                here
                <ArrowUpRightFromCircle className="inline w-5 h-5 ml-1 mr-1" />
              </a>
              . We thank Arunachala AM, Anurav Garg, Kovid Lakhera, Shreyash
              Dash, Palaniappan R, Jason Goveas, Karthik Prakash, Meghraj
              Goswami, and Soumitra Shewale for this rewrite of ChronoFactorem.
            </span>
          </div>
        </TooltipProvider>
      </div>
      <span className="fixed bottom-0 bg-slate-800 w-full text-center py-1 text-md tracking-tight lg:text-lg text-slate-400">
        Powered by CRUx: The Programming and Computing Club of BITS Hyderabad
      </span>
    </>
  );
};

export default About;
