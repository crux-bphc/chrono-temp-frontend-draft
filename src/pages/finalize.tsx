import Spinner from "@/components/Spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { LogOut, Lock, Globe, Clipboard, ClipboardCheck } from "lucide-react";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const Finalize = () => {
  const { id } = useParams();
  const [headingText, setHeadingText] = useState("");
  const [privateTimetable, setPrivate] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [timetableDetails, setTimetableDetails] = useState({ name: "" });
  useEffect(() => {
    const headingOptions = [
      "Anything else?",
      "The final touch",
      "One last thing",
      "Almost there!",
    ];
    setHeadingText(
      headingOptions[Math.floor(Math.random() * headingOptions.length)]
    );

    const fetchTimetableDetails = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/timetable/${id}`,
        {
          method: "GET",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
          mode: "cors",
          credentials: "include",
        }
      );
      const json = await res.json();
      if (res.status === 200) {
        setIsLoaded(true);
        setTimetableDetails(json);
      } else if (res.status === 404) {
        alert(`Error: ${json.message}`);
      } else if (res.status === 500) {
        alert(`Server error: ${json.message}`);
      } else {
        alert(`Server error: ${json}`);
      }
    };
    fetchTimetableDetails();
  }, [id]);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  const submitTimetable = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/timetable/${id}/edit`,
      {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        mode: "cors",
        credentials: "include",
        body: JSON.stringify({
          name: nameInput.current?.value,
          isPrivate: privateTimetable,
          isDraft: false,
        }),
      }
    );
    const json = await res.json();
    if (res.status === 200) {
      navigate("/cmsOption/" + id);
    } else if (res.status === 401) {
      navigate("/login");
    } else if (res.status === 400 || res.status === 403 || res.status === 404) {
      alert(`Error: ${json.message}`);
    } else if (res.status === 500) {
      alert(`Server error: ${json.message}`);
    } else {
      alert(`Server error: ${json}`);
    }
  };
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
          {isLoaded ? (
            <div className="flex pl-96 text-slate-50 pt-48 w-full">
              <div className="flex flex-col w-full">
                <span className="text-5xl font-bold">{headingText}</span>
                <Label htmlFor="name" className="mt-8 mb-1 text-lg">
                  Name
                </Label>
                <Input
                  ref={nameInput}
                  id="name"
                  defaultValue={timetableDetails.name}
                  placeholder="Timetable Name"
                  className="text-xl w-1/3 bg-slate-800 ring-slate-700 ring-offset-slate-700 border-slate-700"
                />
                <Label htmlFor="poop" className="mt-4 mb-1 text-lg">
                  Share your timetable
                </Label>
                <div className="flex items-center w-1/3" id="poop">
                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button
                          className="rounded-r-none rounded-l-lg bg-slate-800 hover:bg-slate-600 text-slate-100 px-4 mr-0"
                          onClick={() => setPrivate(!privateTimetable)}
                        >
                          {privateTimetable ? <Lock /> : <Globe />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 text-slate-50 border-slate-700">
                        {privateTimetable
                          ? "Private (only people with the link can view)"
                          : "Public (anyone can view)"}
                      </TooltipContent>
                    </Tooltip>
                    <Input
                      disabled
                      value={`${import.meta.env.VITE_PROD_URL}/tt/${id}`}
                      className="text-xl ml-0 rounded-none bg-slate-800 ring-slate-700 ring-offset-slate-700 border-slate-700"
                    />
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button
                          className="rounded-l-none bg-green-700 hover:bg-green-600 text-green-100 rounded-r-lg px-4 mr-0"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${import.meta.env.VITE_PROD_URL}/tt/${id}`
                            );
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2500);
                          }}
                        >
                          {copied ? <ClipboardCheck /> : <Clipboard />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 text-slate-50 border-slate-700">
                        {copied ? "Copied!" : "Copy link to timetable"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button
                  className="bg-green-700 hover:bg-green-600 w-1/3 mt-8 text-green-100 px-4 mr-0 text-lg font-bold"
                  onClick={() => submitTimetable()}
                >
                  Finish
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              <Spinner />
            </div>
          )}
        </div>
      </div>
      <span className="fixed bottom-0 bg-slate-800 w-full text-center py-1 text-md tracking-tight lg:text-lg text-slate-400">
        Powered by CRUx: The Programming and Computing Club of BITS Hyderabad
      </span>
    </>
  );
};

export default Finalize;
