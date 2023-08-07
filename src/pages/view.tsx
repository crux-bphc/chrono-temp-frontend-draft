import Spinner from "@/components/Spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  LogOut,
  Lock,
  Globe,
  Pencil,
  Trash,
  GripVertical,
  GripHorizontal,
  Download,
  File,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { useCookies } from "react-cookie";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const View = () => {
  const { id } = useParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const [timetableDetails, setTimetableDetails] = useState({
    name: "",
    authorId: "",
    private: false,
    draft: false,
    archived: false,
    year: 0,
    semester: 0,
    acadYear: 0,
    degrees: [],
    examTimes: [] as string[],
    sections: [] as {
      id: string;
      roomTime: string;
      courseId: string;
      type: string;
      number: number;
      instructors: string[];
    }[],
    timings: [],
    warnings: [] as string[],
    lastUpdated: "",
  });
  const lastUpdatedDate = useMemo(
    () => new Date(timetableDetails.lastUpdated),
    [timetableDetails]
  );

  const handleDownload = async () => {
    const element = document.getElementById("save-tt");
    if (element === null) {
      alert("Error while downloading timetable");
      return;
    }
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL("image/jpg");
    const link = document.createElement("a");

    link.href = data;
    link.download = `${timetableDetails.name}.jpg`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [isVertical, setIsVertical] = useState(false);
  const timetableGrid = useMemo(() => {
    const daysOfWeek = ["M", "T", "W", "Th", "F", "S"];
    const grid = Array(11 * 6);
    for (let i = 0; i < grid.length; i++) {
      grid[i] = null;
    }
    for (let i = 0; i < timetableDetails.sections.length; i++) {
      for (let j = 0; j < timetableDetails.sections[i].roomTime.length; j++) {
        const [code, room, day, hour] =
          timetableDetails.sections[i].roomTime[j].split(":");
        const remainder = daysOfWeek.indexOf(day);
        const quotient = parseInt(hour) - 1;
        grid[
          isVertical ? remainder + quotient * 6 : quotient + remainder * 11
        ] = {
          id: timetableDetails.sections[i].id,
          courseId: timetableDetails.sections[i].courseId,
          room: room,
          code: code,
          type: timetableDetails.sections[i].type,
          number: timetableDetails.sections[i].number,
          instructors: timetableDetails.sections[i].instructors,
        };
      }
    }

    return grid;
  }, [isVertical, timetableDetails.sections]);

  const navigate = useNavigate();

  const deleteTimetable = async (id: string) => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/timetable/${id}/delete`,
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
    if (res.status === 200) {
      navigate(`/`);
    } else if (res.status === 401) {
      navigate("/login");
    } else if (res.status === 403 || res.status === 404) {
      alert(`Error: ${json.message}`);
    } else if (res.status === 500) {
      alert(`Server error: ${json.message}`);
    } else {
      alert(`Server error: ${JSON.stringify(json)}`);
    }
  };

  const makeTimetableDraft = async (
    name: string,
    privateTimetable: boolean,
    id: string
  ) => {
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
          name: name,
          isPrivate: privateTimetable,
          isDraft: true,
        }),
      }
    );
    const json = await res.json();
    if (res.status === 200) {
      navigate(`/edit/${id}`);
    } else if (res.status === 401) {
      navigate("/login");
    } else if (res.status === 400 || res.status === 403 || res.status === 404) {
      alert(`Error: ${json.message}`);
    } else if (res.status === 500) {
      alert(`Server error: ${json.message}`);
    } else {
      alert(`Server error: ${JSON.stringify(json)}`);
    }
  };

  useEffect(() => {
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
      if (res.status === 200 && json.draft === false) {
        setIsLoaded(true);
        setTimetableDetails(json);
      } else if (res.status === 404 || json.draft === true) {
        alert(`Error: ${json.message}`);
        navigate(`/`);
      } else if (res.status === 500) {
        alert(`Server error: ${json.message}`);
      } else {
        alert(`Server error: ${json}`);
      }
    };
    fetchTimetableDetails();
  }, [id, navigate]);

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
            <TooltipProvider>
              <div className="text-slate-50 w-full flex flex-col px-4">
                <div className="flex justify-between">
                  <div className="flex">
                    <div className="flex flex-col">
                      <div className="flex items-center pb-1">
                        <span className="text-2xl mr-4">
                          {timetableDetails.name}
                        </span>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            {timetableDetails.draft === true ? (
                              <File className="h-5 w-5" />
                            ) : timetableDetails.private === true ? (
                              <Lock className="h-5 w-5" />
                            ) : (
                              <Globe className="h-5 w-5" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-900 text-slate-50 border-slate-800">
                            {timetableDetails.draft === true
                              ? "Draft (wait how are you even here?)"
                              : timetableDetails.private === true
                              ? "Private (only people with link can view)"
                              : "Public (anyone can view)"}
                          </TooltipContent>
                        </Tooltip>
                        <span className="text-slate-400 text-xs px-2">
                          {"Last Updated at "}
                          {lastUpdatedDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true,
                          })}
                        </span>
                      </div>
                      <div className="flex">
                        <Badge
                          variant="default"
                          className="w-fit mx-1 h-fit text-sm bg-slate-700 hover:bg-slate-600"
                        >
                          {timetableDetails.year}-{timetableDetails.semester}
                        </Badge>
                        <Badge
                          variant="default"
                          className="w-fit text-sm h-fit mx-1 bg-slate-700 hover:bg-slate-600"
                        >
                          {timetableDetails.acadYear}
                        </Badge>
                        {timetableDetails.degrees.map((degree) => (
                          <Badge
                            variant="secondary"
                            className="w-fit h-fit text-sm mx-1"
                          >
                            {degree}
                          </Badge>
                        ))}
                        {userInfoCookie["userInfo"] &&
                          "id" in userInfoCookie["userInfo"] &&
                          typeof userInfoCookie["userInfo"].id === "string" &&
                          userInfoCookie["userInfo"].id ===
                            timetableDetails.authorId && (
                            <>
                              <Tooltip delayDuration={100}>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <TooltipTrigger asChild>
                                      <Button className="ml-2 mt-[-0.5rem] duration-300 rounded-full bg-slate-950 hover:bg-slate-700">
                                        <Pencil className="w-6 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-slate-800 p-8 border-slate-700 ring-slate-700 ring-offset-slate-700">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="font-bold text-2xl text-slate-50">
                                        Are you sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-lg text-slate-300">
                                        Attempting to edit this finished
                                        timetable will mark it as draft.{" "}
                                        <span className="font-bold text-red-400">
                                          People with the link will no longer be
                                          able to view this timetable until you
                                          publish it again.
                                        </span>
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="bg-slate-800 hover:bg-slate-700/60 hover:text-slate-200 text-slate-200 border-slate-500 ring-slate-500 ring-offset-slate-500">
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-slate-50 text-slate-900 hover:bg-slate-200 border-slate-200 ring-slate-200 ring-offset-slate-200"
                                        onClick={() => {
                                          makeTimetableDraft(
                                            timetableDetails.name,
                                            timetableDetails.private,
                                            id as string
                                          );
                                        }}
                                      >
                                        Continue
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <TooltipContent className="bg-slate-900 text-slate-50 border-slate-800">
                                  Edit Timetable
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip delayDuration={100}>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <TooltipTrigger asChild>
                                      <Button className="ml-2 mt-[-0.5rem] duration-300 rounded-full bg-slate-950 hover:bg-red-900/60">
                                        <Trash className="w-6 h-4 text-red-400" />
                                      </Button>
                                    </TooltipTrigger>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-slate-800 p-8 border-slate-700 ring-slate-700 ring-offset-slate-700">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="font-bold text-2xl text-slate-50">
                                        Are you sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-lg text-slate-300">
                                        <span className="font-bold text-red-300">
                                          People with the link will no longer be
                                          able to view this timetable.
                                        </span>
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="bg-slate-800 hover:bg-slate-700/60 hover:text-slate-200 text-slate-200 border-slate-500 ring-slate-500 ring-offset-slate-500">
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className="text-red-50 bg-red-900 hover:bg-red-700 border-red-200 ring-red-200 ring-offset-red-200"
                                        onClick={() => {
                                          deleteTimetable(id as string);
                                        }}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <TooltipContent className="bg-slate-900 text-slate-50 border-slate-800">
                                  Delete Timetable
                                </TooltipContent>
                              </Tooltip>
                            </>
                          )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center">
                    {" "}
                    {!timetableDetails.draft && !timetableDetails.archived && (
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger
                          asChild
                          className="mr-4 w-fit h-fit hover:bg-slate-700 bg-transparent transition duration-200 ease-in-out"
                        >
                          <Button
                            className="p-2 text-md rounded-lg px-4"
                            onClick={() => navigate(`/cms/${id}`)}
                          >
                            CMS AUTO-ENROLL
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-900 text-slate-50 border-slate-800">
                          Auto-Enroll sections into CMS
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger
                        asChild
                        className="mr-4 w-fit h-fit hover:bg-slate-700 bg-transparent transition duration-200 ease-in-out"
                      >
                        <Button
                          className="p-2 rounded-lg px-4"
                          onClick={() => handleDownload()}
                        >
                          <Download className="w-6 h-6 m-1 mr-2" /> JPG
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 text-slate-50 border-slate-800">
                        Download timetable as image
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger
                        asChild
                        className="mr-4 w-fit h-fit hover:bg-slate-700 bg-transparent transition duration-200 ease-in-out"
                      >
                        <Button
                          className="p-2 rounded-full"
                          onClick={() => setIsVertical(!isVertical)}
                        >
                          {isVertical ? (
                            <GripVertical className="w-6 h-6 m-1" />
                          ) : (
                            <GripHorizontal className="w-6 h-6 m-1" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 text-slate-50 border-slate-800">
                        {isVertical
                          ? "Make timetable horizontal"
                          : "Make timetable vertical"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="flex bg-slate-950" id="save-tt">
                  <div className="w-96 bg-slate-800 mt-4 h-fit">
                    <div className="w-full">
                      <div className="pt-3 pb-2 text-xl text-center ring-slate-700 ring-offset-slate-700 duration-200 font-bold text-md rounded-t-xl bg-slate-800 rounded-b-none -z-10 text-slate-100 w-full">
                        Exams
                      </div>
                      <div className="ring-slate-700 ring-offset-slate-700 bg-slate-800/40">
                        <div className="w-96 h-[calc(100vh-16rem)] overflow-y-auto pt-4">
                          <span className="text-xl font-bold pl-4 flex mb-2">
                            Midsems
                          </span>
                          {timetableDetails.examTimes
                            .filter((e) => e.includes("|MIDSEM|"))
                            .map((e) => {
                              return {
                                code: e.split("|")[0],
                                midsemStartTime: e.split("|")[2],
                                midsemEndTime: e.split("|")[3],
                              };
                            })
                            .sort(
                              (a, b) =>
                                Date.parse(a.midsemStartTime) -
                                Date.parse(b.midsemStartTime)
                            )
                            .map((course) => (
                              <div className="px-4 ease-in-out py-2 items-center flex">
                                <span className="w-fit text-sm font-bold pr-4">
                                  {course.code}
                                </span>
                                <span className="text-sm">
                                  {`${new Date(
                                    course.midsemStartTime
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                    hour12: true,
                                  })} — ${new Date(
                                    course.midsemEndTime
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                    hour12: true,
                                  })}`}
                                </span>
                              </div>
                            ))}
                          <span className="text-xl font-bold pl-4 flex mb-2 pt-4 border-slate-700/60 mt-4 border-t-2">
                            Compres
                          </span>
                          {timetableDetails.examTimes
                            .filter((e) => e.includes("|COMPRE|"))
                            .map((e) => {
                              return {
                                code: e.split("|")[0],
                                compreStartTime: e.split("|")[2],
                                compreEndTime: e.split("|")[3],
                              };
                            })
                            .sort(
                              (a, b) =>
                                Date.parse(a.compreStartTime) -
                                Date.parse(b.compreEndTime)
                            )
                            .map((course) => (
                              <div className="px-4 ease-in-out py-2 items-center flex">
                                <span className="w-fit text-sm font-bold pr-4">
                                  {course.code}
                                </span>
                                <span className="text-sm">
                                  {`${new Date(
                                    course.compreStartTime
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                    hour12: true,
                                  })} — ${new Date(
                                    course.compreEndTime
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                    hour12: true,
                                  })}`}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex w-full">
                    {isVertical ? (
                      <div></div>
                    ) : (
                      // <div className="flex flex-col justify-between w-28 mr-2 mt-11 text-md text-center text-slate-500 grid-rows-11">
                      //   <div className="mb-4 flex items-center justify-between w-full">
                      //     <span className="text-slate-600">8 - 9AM</span>
                      //     <span className="font-bold">1</span>
                      //   </div>
                      //   <div className="mb-4 flex items-center justify-between w-full">
                      //     <span className="text-slate-600">9 - 10AM</span>
                      //     <span className="font-bold">2</span>
                      //   </div>
                      //   <div className="mb-4 flex items-center justify-between w-full">
                      //     <span className="text-slate-600">10 - 11AM</span>
                      //     <span className="font-bold">3</span>
                      //   </div>
                      //   <div className="mb-4 flex items-center justify-between w-full">
                      //     <span className="text-slate-600">11 - 12PM</span>
                      //     <span className="font-bold">4</span>
                      //   </div>
                      //   <div className="mb-4 flex items-center justify-between w-full">
                      //     <span className="text-slate-600">12 - 1PM</span>
                      //     <span className="font-bold">5</span>
                      //   </div>
                      //   <div className="mb-4 flex items-center justify-between w-full">
                      //     <span className="text-slate-600">1 - 2PM</span>
                      //     <span className="font-bold">6</span>
                      //   </div>
                      //   <div className="mb-4 flex items-center justify-between w-full">
                      //     <span className="text-slate-600">2 - 3PM</span>
                      //     <span className="font-bold">7</span>
                      //   </div>
                      //   <div className="mb-4 flex items-center justify-between w-full">
                      //     <span className="text-slate-600">3 - 4PM</span>
                      //     <span className="font-bold">8</span>
                      //   </div>
                      //   <div className="mb-4 flex items-center justify-between w-full">
                      //     <span className="text-slate-600">4 - 5PM</span>
                      //     <span className="font-bold">9</span>
                      //   </div>
                      //   <div className="mb-4 flex items-center justify-between w-full">
                      //     <span className="text-slate-600">5 - 6PM</span>
                      //     <span className="font-bold">10</span>
                      //   </div>
                      //   <div className="mb-5 flex items-center justify-between w-full">
                      //     <span className="text-slate-600">6 - 7PM</span>
                      //     <span className="font-bold">11</span>
                      //   </div>
                      //   {/* <div className="mb-4 flex flex-col">
                      //   <span className="font-bold">12</span>
                      //   <span className="text-slate-600">7 - 8PM</span>
                      // </div> */}
                      // </div>
                      <div
                        className={`grid items-center pr-2 text-lg text-center font-bold ${
                          isVertical ? "grid-cols-6" : "grid-rows-6 mt-12"
                        }`}
                      >
                        <span>M</span>
                        <span>T</span>
                        <span>W</span>
                        <span>Th</span>
                        <span>F</span>
                        <span>S</span>
                      </div>
                    )}
                    <div className="flex flex-col w-full">
                      {isVertical ? (
                        <div
                          className={`grid items-center pr-2 text-lg mb-2 text-center font-bold ${
                            isVertical ? "grid-cols-6" : "grid-rows-6 mt-12"
                          }`}
                        >
                          <span>M</span>
                          <span>T</span>
                          <span>W</span>
                          <span>Th</span>
                          <span>F</span>
                          <span>S</span>
                        </div>
                      ) : (
                        <div
                          className={`grid justify-between text-md text-center text-slate-500 ${
                            isVertical ? "grid-rows-11" : "grid-cols-11 mb-2"
                          } `}
                        >
                          <div className="flex flex-col">
                            <span className="font-bold">1</span>
                            <span className="text-slate-600">8 - 9AM</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">2</span>
                            <span className="text-slate-600">9 - 10AM</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">3</span>
                            <span className="text-slate-600">10 - 11AM</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">4</span>
                            <span className="text-slate-600">11 - 12PM</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">5</span>
                            <span className="text-slate-600">12 - 1PM</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">6</span>
                            <span className="text-slate-600">1 - 2PM</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">7</span>
                            <span className="text-slate-600">2 - 3PM</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">8</span>
                            <span className="text-slate-600">3 - 4PM</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">9</span>
                            <span className="text-slate-600">4 - 5PM</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">10</span>
                            <span className="text-slate-600">5 - 6PM</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">11</span>
                            <span className="text-slate-600">6 - 7PM</span>
                          </div>
                          {/* <div className="mb-4 flex flex-col">
                        <span className="font-bold">12</span>
                        <span className="text-slate-600">7 - 8PM</span>
                      </div> */}
                        </div>
                      )}
                      <div
                        className={`grid ${
                          isVertical
                            ? "grid-cols-6 grid-rows-11 h-[calc(100vh-14rem)]"
                            : "grid-cols-11 grid-rows-6 h-[calc(100vh-15rem)]"
                        } gap-2 w-full`}
                      >
                        {timetableGrid.map((e) =>
                          e !== null ? (
                            <div
                              className={`bg-slate-600 rounded-lg ${
                                isVertical
                                  ? "h-fit pl-3 pb-2 pt-1"
                                  : "pl-3 pb-2 pt-2"
                              }`}
                            >
                              <div className="flex h-full text-sm flex-col">
                                <span className="font-bold">
                                  {e.code} {e.type}
                                  {e.number}
                                </span>
                                <span className="text-slate-300">{e.room}</span>
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`bg-slate-900 rounded-lg h-fit ${
                                isVertical
                                  ? "pl-3 pb-10 pt-3"
                                  : "pl-3 pt-20 pb-5"
                              }`}
                            ></div>
                          )
                        )}
                        {/* {JSON.stringify(timetableDetails)} */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TooltipProvider>
          ) : (
            <div className="w-full flex justify-center items-center h-full">
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

export default View;
