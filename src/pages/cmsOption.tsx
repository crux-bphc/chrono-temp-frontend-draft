import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  LogOut,
  ArrowUpRightFromCircle,
  HelpCircle,
  FlaskConical,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const CMSOption = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userInfoCookie] = useCookies(["userInfo"]);

  return (
    <>
      <div className="flex bg-slate-950 h-screen w-full">
        <div className="flex flex-col w-full">
          <div className="flex w-full justify-between">
            <div className="flex items-center">
              <h1
                onClick={() => navigate("/")}
                className="scroll-m-20 cursor-pointer text-2xl font-extrabold tracking-tight lg:text-3xl mx-4 my-4 text-slate-50"
              >
                ChronoFactorem <sup>ᵝ</sup>
              </h1>
              <a
                href="/about"
                className="text-slate-300 py-2 px-4 ml-4 text-lg rounded-full hover:bg-slate-800 transition h-fit duration-200 ease-in-out"
              >
                About
              </a>
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
            <div className="flex pl-96 text-slate-50 pt-48 w-full">
              <div className="flex flex-col w-full">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="text-5xl font-bold">
                      Auto-Enroll these Sections into CMS?
                    </span>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-12 h-12 ml-2 text-slate-400 hover:text-slate-50 transition duration-300 ease-in-out" />
                      </TooltipTrigger>
                      <TooltipContent className="w-[48rem] flex flex-col bg-slate-800 text-slate-50 border-slate-700 text-md">
                        <span>
                          ChronoFactorem now allows you to cut the hassle of
                          enrolling into the CMS sections for your courses, and
                          automates it all away.
                        </span>
                        <span className="pt-2">
                          With just a few clicks, you can now sync everything in
                          your academic life with ChronoFactorem.
                        </span>
                        <span className="pt-2">
                          For those unaware, CMS is the single most important
                          academic resource for your life at BITS Hyderabad. All
                          your course slides, assignment details, and important
                          announcements are posted on CMS. You can access CMS at
                          <a
                            href="https://cms.bits-hyderabad.ac.in/"
                            className="text-blue-400 ml-1 inline items-center"
                          >
                            https://cms.bits-hyderabad.ac.in/
                            <ArrowUpRightFromCircle className="inline w-4 h-4 ml-1 mr-1" />
                          </a>
                          , download the Android app
                          <a
                            href="https://play.google.com/store/apps/details?id=crux.bphc.cms"
                            className="text-blue-400 ml-1 inline items-center"
                          >
                            here
                            <ArrowUpRightFromCircle className="inline w-4 h-4 ml-1 mr-1" />
                          </a>
                          , and download the iOS app
                          <a
                            href="https://apps.apple.com/in/app/cms-bphc/id1489946522"
                            className="text-blue-400 ml-1 inline items-center"
                          >
                            here
                            <ArrowUpRightFromCircle className="inline w-4 h-4 ml-1 mr-1" />
                          </a>
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-xl font-normal text-slate-400 pt-2 w-2/3">
                    You can always come back and edit your timetable and
                    auto-enroll from the dashboard.
                  </span>
                  <span className="text-xl inline items-center font-normal text-slate-400 pt-2 w-2/3">
                    <span className="font-bold">Note:</span> This feature is
                    experimental.
                    <FlaskConical className="inline ml-1" />
                  </span>
                  <span className="text-xl inline items-center font-normal text-slate-400 pt-2 w-2/3">
                    It won't break your CMS, but it might miss some sections.
                    Such cases are extremely rare, and the sections that error
                    out are reported to you, so you can go enroll into them
                    manually.
                  </span>
                </div>
                <div className="flex space-x-4">
                  <Button
                    className="bg-slate-950 border-slate-800 border-2 hover:bg-slate-800 w-3/12 mt-8 text-slate-100 px-4 mr-0 text-lg font-bold"
                    onClick={() => navigate("/")}
                  >
                    No, Thanks
                  </Button>
                  <Button
                    className="bg-green-700 hover:bg-green-600 w-3/12 mt-8 text-green-100 px-4 mr-0 text-lg font-bold"
                    onClick={() => navigate("/cms/" + id)}
                  >
                    Sure!
                  </Button>
                </div>
              </div>
            </div>
          </TooltipProvider>
        </div>
      </div>
      <span className="fixed bottom-0 bg-slate-800 w-full text-center py-1 text-md tracking-tight lg:text-lg text-slate-400">
        Powered by CRUx: The Programming and Computing Club of BITS Hyderabad
      </span>
    </>
  );
};

export default CMSOption;
