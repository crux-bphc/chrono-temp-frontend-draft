import Spinner from "@/components/Spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { LogOut, File, Bird, Lock, Globe, Archive } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Home = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [birdRotation, setBirdRotation] = useState(0);
  const [userDetails, setUserDetails] = useState({
    name: "",
    timetables: [] as {
      id: string;
      name: string;
      draft: boolean;
      year: number;
      semester: number;
      acadYear: number;
      degrees: string[];
      private: boolean;
      archived: boolean;
    }[],
  });
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

  useEffect(() => {
    const fetchUserDetails = async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user`, {
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        mode: "cors",
        credentials: "include",
      });
      const json = await res.json();
      if (res.status === 200) {
        setIsLoaded(true);
        setUserDetails(json);
      } else if (res.status === 401) {
        navigate("/login");
      } else if (res.status === 404) {
        alert(`Error: ${json.message}`);
      } else if (res.status === 500) {
        alert(`Server error: ${json.message}`);
      } else {
        alert(`Server error: ${json}`);
      }
    };
    fetchUserDetails();
  }, [navigate]);

  return (
    <>
      {isLoaded ? (
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
                <Button
                  className="text-green-200 w-fit text-xl p-4 ml-4 bg-green-900 hover:bg-green-800"
                  onClick={() => createTimetable()}
                >
                  Create a timetable
                </Button>
                <a
                  href="/about"
                  className="text-slate-300 py-2 px-4 ml-4 text-lg rounded-full hover:bg-slate-800 transition h-fit duration-200 ease-in-out"
                >
                  About
                </a>
                <a
                  href="/cmsExport"
                  className="text-slate-300 py-2 px-4 ml-4 text-lg rounded-full hover:bg-slate-800 transition h-fit duration-200 ease-in-out"
                >
                  CMS Auto-Enroll
                </a>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="rounded-full text-slate-50 bg-slate-500 p-1 px-3 text-xl h-fit mx-8 mt-4">
                    <span>{userDetails.name[0]}</span>
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
            </div>
            <TooltipProvider>
              <div className="w-full flex flex-col pt-4 pl-4">
                <span className="text-xl lg:text-2xl m-4 text-slate-50">
                  Hi {userDetails.name},
                </span>
                {userDetails.timetables.length === 0 && (
                  <div className="flex flex-col justify-center mx-8 mt-8 items-center bg-slate-800 p-16 rounded-xl">
                    <Bird
                      className="text-slate-400 w-36 h-36 mb-4"
                      style={{ transform: `rotate(${birdRotation}deg)` }}
                      onClick={() => setBirdRotation((birdRotation + 45) % 360)}
                    />
                    <span className="text-slate-400 text-3xl">
                      It's empty in here.
                    </span>
                    <Button
                      className="text-green-200 w-fit text-3xl p-8 mt-8 bg-green-900 hover:bg-green-800"
                      onClick={() => createTimetable()}
                    >
                      Create a timetable
                    </Button>
                  </div>
                )}
                {userDetails.timetables.filter((timetable) => timetable.draft)
                  .length > 0 && (
                  <div className="flex flex-col">
                    <span className="text-xl lg:text-2xl tracking-tight font-bold m-4 text-slate-50">
                      Draft Timetables
                    </span>
                    <div className="flex flex-wrap">
                      {userDetails.timetables
                        .filter((timetable) => timetable.draft)
                        .map((timetable) => {
                          return (
                            <Card
                              onClick={() => navigate(`/edit/${timetable.id}`)}
                              id={timetable.id}
                              className="m-2 w-80 h-40 flex flex-col duration-300 justify-between bg-slate-800 hover:bg-slate-700 cursor-pointer text-slate-50 border-slate-700"
                            >
                              <CardHeader>
                                <CardTitle>{timetable.name}</CardTitle>
                                <CardDescription className="text-slate-400">
                                  {timetable.year}-{timetable.semester},{" "}
                                  {timetable.acadYear}-
                                  {(timetable.acadYear + 1) % 1000}
                                </CardDescription>
                              </CardHeader>
                              <CardFooter>
                                <div className="flex justify-between w-full items-end">
                                  <div>
                                    {timetable.degrees.map((degree) => (
                                      <Badge variant="secondary">
                                        {degree}
                                      </Badge>
                                    ))}
                                  </div>

                                  <Tooltip delayDuration={100}>
                                    <TooltipTrigger asChild>
                                      <File className="h-5 w-5" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-900 text-slate-50 border-slate-800">
                                      Draft
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </CardFooter>
                            </Card>
                          );
                        })}
                    </div>
                  </div>
                )}
                {userDetails.timetables.filter((timetable) => !timetable.draft)
                  .length > 0 && (
                  <div className="flex flex-col">
                    <span className="text-xl lg:text-2xl tracking-tight font-bold m-4 text-slate-50">
                      Finished Timetables
                    </span>
                    <div className="flex flex-wrap">
                      {userDetails.timetables
                        .filter((timetable) => !timetable.draft)
                        .map((timetable) => {
                          return (
                            <Card
                              onClick={() => navigate(`/tt/${timetable.id}`)}
                              id={timetable.id}
                              className="group/card m-2 w-80 h-40 flex flex-col duration-300 justify-between bg-slate-800 hover:bg-slate-700 cursor-pointer text-slate-50 border-slate-700"
                            >
                              <CardHeader>
                                <div className="flex justify-between">
                                  <div>
                                    <CardTitle>{timetable.name}</CardTitle>
                                    <CardDescription className="text-slate-400">
                                      {timetable.year}-{timetable.semester},{" "}
                                      {timetable.acadYear}-
                                      {(timetable.acadYear + 1) % 1000}
                                    </CardDescription>
                                  </div>
                                </div>
                              </CardHeader>

                              <CardFooter>
                                <div className="flex justify-between w-full items-end">
                                  <div>
                                    {timetable.degrees.map((degree) => (
                                      <Badge variant="secondary">
                                        {degree}
                                      </Badge>
                                    ))}
                                  </div>
                                  <Tooltip delayDuration={100}>
                                    <TooltipTrigger asChild>
                                      {timetable.private === true ? (
                                        <Lock className="h-5 w-5" />
                                      ) : (
                                        <Globe className="h-5 w-5" />
                                      )}
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-900 text-slate-50 border-slate-800">
                                      {timetable.private === true
                                        ? "Private (only people with link can view)"
                                        : "Public (anyone can view)"}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </CardFooter>
                            </Card>
                          );
                        })}
                    </div>
                  </div>
                )}
                {userDetails.timetables.filter(
                  (timetable) => timetable.archived
                ).length > 0 && (
                  <div className="flex flex-col">
                    <span className="text-xl lg:text-2xl tracking-tight font-bold m-4 text-slate-50">
                      Archived Timetables
                    </span>
                    <div className="flex flex-wrap">
                      {userDetails.timetables
                        .filter((timetable) => timetable.archived)
                        .map((timetable) => {
                          return (
                            <Card
                              id={timetable.id}
                              className="m-2 w-80 h-40 flex flex-col duration-300 justify-between bg-slate-800 text-slate-50 border-slate-700"
                            >
                              <CardHeader>
                                <CardTitle>{timetable.name}</CardTitle>
                                <CardDescription className="text-slate-400">
                                  {timetable.year}-{timetable.semester},{" "}
                                  {timetable.acadYear}-
                                  {(timetable.acadYear + 1) % 1000}
                                </CardDescription>
                              </CardHeader>
                              <CardFooter>
                                <div className="flex justify-between w-full items-end">
                                  <div>
                                    {timetable.degrees.map((degree) => (
                                      <Badge variant="secondary">
                                        {degree}
                                      </Badge>
                                    ))}
                                  </div>
                                  <div className="flex space-x-4 items-center">
                                    <Tooltip delayDuration={100}>
                                      <TooltipTrigger asChild>
                                        <Archive className="h-6 w-6" />
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-slate-900 text-slate-50 border-slate-800">
                                        Archived (no longer editable)
                                      </TooltipContent>
                                    </Tooltip>

                                    <Tooltip delayDuration={100}>
                                      <TooltipTrigger asChild>
                                        {timetable.private === true ? (
                                          <Lock className="h-5 w-5" />
                                        ) : (
                                          <Globe className="h-5 w-5" />
                                        )}
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-slate-900 text-slate-50 border-slate-800">
                                        {timetable.private === true
                                          ? "Private (only people with link can view)"
                                          : "Public (anyone can view)"}
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                              </CardFooter>
                            </Card>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </TooltipProvider>
          </div>
          <span className="fixed bottom-0 bg-slate-800 w-full text-center py-1 text-md tracking-tight lg:text-lg text-slate-400">
            Powered by CRUx: The Programming and Computing Club of BITS
            Hyderabad
          </span>
        </>
      ) : (
        <div className="flex bg-slate-950 h-screen w-full justify-center items-center">
          <Spinner />
        </div>
      )}
    </>
  );
};

export default Home;
