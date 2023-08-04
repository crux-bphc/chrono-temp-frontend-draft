import Spinner from "@/components/Spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";
import {
  LogOut,
  AlertOctagon,
  File,
  ChevronRight,
  ArrowLeft,
  Check,
  Info,
  AlertTriangle,
  ArrowUpRightFromCircle,
  Bird,
  GripHorizontal,
  GripVertical,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import CDCList from "../../CDCs.json";

const Edit = () => {
  const { id } = useParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const [timetableDetails, setTimetableDetails] = useState({
    name: "",
    private: false,
    year: 0,
    semester: 0,
    acadYear: 0,
    degrees: [],
    examTimes: [] as string[],
    sections: [] as {
      id: string;
      roomTime: string[];
      courseId: string;
      type: string;
      number: number;
      instructors: string[];
    }[],
    timings: [] as string[],
    warnings: [] as string[],
    lastUpdated: "",
  });
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const [sectionTypeTab, setSectionTypeTab] = useState<string | null>(null);
  const [courseSections, setCourseSections] = useState({
    code: "",
    name: "",
    sections: [] as {
      type: string;
      id: string;
      number: number;
      instructors: string[];
      roomTime: string[];
    }[],
  });
  const [interactable, setInteractable] = useState(true);
  const [courseSectionsOpened, setCourseSectionsOpened] = useState(false);
  const [tabState, setTabState] = useState("cdcs");
  const [courseDetails, setCourseDetails] = useState<
    {
      id: string;
      code: string;
      name: string;
      midsemStartTime: string;
      midsemEndTime: string;
      compreStartTime: string;
      compreEndTime: string;
    }[]
  >([]);
  const lastUpdatedDate = useMemo(
    () => new Date(timetableDetails.lastUpdated),
    [timetableDetails]
  );

  const uniqueSectionTypes = useMemo(
    () =>
      Array.from(new Set(courseSections.sections.map((e) => e.type))).sort(),
    [courseSections]
  );

  const classifiedSections = useMemo(() => {
    const courseSectionsWithClashCheck = courseSections.sections.map((e) => {
      const withClash = e as {
        type: string;
        id: string;
        number: number;
        instructors: string[];
        roomTime: string[];
        clashing: null | string[];
      };
      const existingRoomTimes = timetableDetails.sections.flatMap((e) =>
        e.roomTime.map(
          (x) =>
            e.roomTime[0].split(":")[0] +
            " " +
            e.type +
            e.number +
            ":" +
            x.split(":").splice(2).join("")
        )
      );
      const newRoomTimes = withClash.roomTime.map(
        (x) =>
          e.roomTime[0].split(":")[0] +
          " " +
          e.type +
          e.number +
          ":" +
          x.split(":").splice(2).join("")
      );
      const clashes = [
        ...new Set(
          existingRoomTimes
            .filter((x) => {
              return newRoomTimes
                .map((y) => y.split(":")[1])
                .includes(x.split(":")[1]);
            })
            .map((x) => x.split(":")[0])
        ),
      ];
      withClash.clashing =
        clashes.length === 0
          ? null
          : clashes[0] === newRoomTimes[0]
          ? null
          : clashes;
      return withClash;
    });
    return {
      L: courseSectionsWithClashCheck.filter((e) => e.type === "L"),
      P: courseSectionsWithClashCheck.filter((e) => e.type === "P"),
      T: courseSectionsWithClashCheck.filter((e) => e.type === "T"),
    };
  }, [courseSections.sections, timetableDetails.sections]);

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

  const [searchTerm, setSearchTerm] = useState("");
  const courseSearchResults = useMemo(
    () =>
      (searchTerm === ""
        ? courseDetails
        : courseDetails.filter((e) =>
            (e.code + ": " + e.name)
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
      ).map((e) => {
        const withClash = e as {
          id: string;
          code: string;
          name: string;
          midsemStartTime: string;
          midsemEndTime: string;
          compreStartTime: string;
          compreEndTime: string;
          clashing: null | string[];
        };
        const clashes = timetableDetails.examTimes.filter((x) => {
          if (x.split("|")[0] === e.code) return false;
          return (
            x.includes(
              withClash.midsemStartTime + "|" + withClash.midsemEndTime
            ) ||
            x.includes(
              withClash.compreStartTime + "|" + withClash.compreEndTime
            )
          );
        });
        withClash.clashing = clashes.length === 0 ? null : clashes;
        return withClash;
      }),
    [courseDetails, searchTerm, timetableDetails.examTimes]
  );
  const addedCourses = useMemo(
    () =>
      courseDetails.filter((e) =>
        timetableDetails.sections.map((x) => x.courseId).includes(e.id)
      ),
    [courseDetails, timetableDetails.sections]
  );

  const requiredCourses = useMemo(() => {
    if (timetableDetails.year === 0) return [];
    const courses = [];
    const cdcs =
      (timetableDetails.degrees.length === 1 &&
      timetableDetails.degrees[0][0] === "B"
        ? timetableDetails.degrees[0]
        : timetableDetails.degrees.sort((a, b) => b - a).join("")) in CDCList &&
      `${timetableDetails.year}-${timetableDetails.semester}` in
        CDCList[
          (timetableDetails.degrees.length === 1 &&
          timetableDetails.degrees[0][0] === "B"
            ? timetableDetails.degrees[0]
            : timetableDetails.degrees
                .sort((a, b) => b - a)
                .join("")) as keyof typeof CDCList
        ]
        ? CDCList[
            (timetableDetails.degrees.length === 1 &&
            timetableDetails.degrees[0][0] === "B"
              ? timetableDetails.degrees[0]
              : timetableDetails.degrees
                  .sort((a, b) => b - a)
                  .join("")) as keyof typeof CDCList
          ][
            `${timetableDetails.year}-${timetableDetails.semester}` as keyof (typeof CDCList)[keyof typeof CDCList]
          ]
        : [];
    for (let i = 0; i < cdcs.length; i++) {
      if (cdcs[i].includes("/")) {
        const [depts, codes] = cdcs[i].split(" ");
        const options: string[] = [];
        for (let j = 0; j < depts.split("/").length; j++) {
          options.push(depts.split("/")[j] + " " + codes.split("/")[j]);
        }
        const matchedCourses = courseDetails.filter((e) =>
          options.includes(e.code)
        );
        if (matchedCourses.length < options.length) {
          courses.push({
            id: null,
            type: "warning" as "warning" | "optional",
            warning: `One CDC of ${options.join(", ")} not found`,
          });
        } else {
          courses.push({
            id: null,
            type: "optional" as "warning" | "optional",
            options: matchedCourses,
          });
        }
      } else {
        const matchedCourses = courseDetails.filter((e) => e.code === cdcs[i]);
        if (matchedCourses.length === 1) {
          courses.push(matchedCourses[0]);
        } else {
          courses.push({
            id: null,
            type: "warning" as "warning" | "optional",
            warning: `CDC ${cdcs[i]} not found`,
          });
        }
      }
    }
    return courses;
  }, [
    courseDetails,
    timetableDetails.degrees,
    timetableDetails.year,
    timetableDetails.semester,
  ]);
  const cdcNotFoundWarning = useMemo(
    () =>
      requiredCourses.filter((e) => e.id === null && e.type === "warning") as {
        id: null;
        type: "warning";
        warning: string;
      }[],
    [requiredCourses]
  );
  const missingCDCs = useMemo(() => {
    const missing: {
      id: string;
      code: string;
      name: string;
    }[] = [];
    for (let i = 0; i < requiredCourses.length; i++) {
      if (requiredCourses[i].id === null) {
        const option = requiredCourses[i] as
          | {
              id: null;
              type: "warning";
              warning: string;
            }
          | {
              id: null;
              type: "optional";
              options: {
                id: string;
                code: string;
                name: string;
              }[];
            };
        if (
          option.type === "optional" &&
          !option.options.some((e) =>
            addedCourses.map((added) => added.id).includes(e.id as string)
          )
        ) {
          const splitCodes = option.options.map((e) => e.code).join(" (or) ");
          missing.push({
            id: "",
            code: splitCodes,
            name: "",
          });
        }
      } else {
        if (
          !addedCourses
            .map((e) => e.id)
            .includes(requiredCourses[i].id as string)
        ) {
          missing.push(
            requiredCourses[i] as {
              id: string;
              code: string;
              name: string;
            }
          );
        }
      }
    }
    return missing;
  }, [addedCourses, requiredCourses]);

  const navigate = useNavigate();
  const fetchCourseSections = async (courseId: string) => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/course/${courseId}`,
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
      setCourseSections(json);
      setCourseSectionsOpened(true);
      setSectionTypeTab(
        Array.from(
          new Set(json.sections.map((e: { type: string }) => e.type))
        ).sort()[0] as string
      );
    } else if (res.status === 404) {
      alert(`Error: ${json.message}`);
    } else if (res.status === 500) {
      alert(`Server error: ${json.message}`);
    } else {
      alert(`Server error: ${json}`);
    }
  };
  const fetchTimetableDetails = useCallback(async () => {
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
  }, [id]);

  const addCourseSection = async (sectionId: string) => {
    if (!interactable) return;
    setInteractable(false);
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/timetable/${id}/add`,
      {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectionId: sectionId,
        }),
        mode: "cors",
        credentials: "include",
      }
    );
    const json = await res.json();
    if (res.status === 200) {
      await fetchTimetableDetails();
      setInteractable(true);
      return true;
    } else if (res.status === 401) {
      navigate("/login");
    } else if (
      res.status === 400 ||
      res.status === 404 ||
      res.status === 403 ||
      res.status === 418
    ) {
      alert(`Error: ${json.message}`);
    } else if (res.status === 500) {
      alert(`Server error: ${json.message}`);
    } else {
      alert(`Server error: ${json}`);
    }
    setInteractable(true);
  };

  const removeCourseSection = async (sectionId: string) => {
    if (!interactable) return;
    setInteractable(false);
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/timetable/${id}/remove`,
      {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectionId: sectionId,
        }),
        mode: "cors",
        credentials: "include",
      }
    );
    const json = await res.json();
    if (res.status === 200) {
      await fetchTimetableDetails();
      setInteractable(true);
      return true;
    } else if (res.status === 401) {
      navigate("/login");
    } else if (res.status === 404 || res.status === 403 || res.status === 418) {
      alert(`Error: ${json.message}`);
    } else if (res.status === 500) {
      alert(`Server error: ${json.message}`);
    } else {
      alert(`Server error: ${json}`);
    }
    setInteractable(true);
  };

  const selectedSections = useMemo(() => {
    return {
      L: classifiedSections.L.filter((section) =>
        timetableDetails.sections
          .map((ttSection) => ttSection.id)
          .includes(section.id)
      ),
      P: classifiedSections.P.filter((section) =>
        timetableDetails.sections
          .map((ttSection) => ttSection.id)
          .includes(section.id)
      ),
      T: classifiedSections.T.filter((section) =>
        timetableDetails.sections
          .map((ttSection) => ttSection.id)
          .includes(section.id)
      ),
    };
  }, [
    classifiedSections.L,
    classifiedSections.P,
    classifiedSections.T,
    timetableDetails.sections,
  ]);

  const handleSectionClick = async (type: string, sectionId: string) => {
    if (
      timetableDetails.sections.filter(
        (ttSection) => ttSection.id === sectionId
      ).length > 0
    ) {
      await removeCourseSection(sectionId);
    } else {
      if (
        selectedSections[
          type as keyof {
            L: { type: string; id: string }[];
            P: { type: string; id: string }[];
            T: { type: string; id: string }[];
          }
        ].length > 0
      ) {
        const success = await removeCourseSection(
          selectedSections[
            type as keyof {
              L: { type: string; id: string }[];
              P: { type: string; id: string }[];
              T: { type: string; id: string }[];
            }
          ][0].id
        );
        if (success) {
          const success2 = await addCourseSection(sectionId);
          if (success2) {
            if (
              uniqueSectionTypes.indexOf(sectionTypeTab as string) <
              uniqueSectionTypes.length - 1
            ) {
              setSectionTypeTab(
                uniqueSectionTypes[
                  uniqueSectionTypes.indexOf(sectionTypeTab as string) + 1
                ]
              );
            }
          } else {
            await addCourseSection(
              selectedSections[
                type as keyof {
                  L: { type: string; id: string }[];
                  P: { type: string; id: string }[];
                  T: { type: string; id: string }[];
                }
              ][0].id
            );
          }
        }
      } else {
        const success = await addCourseSection(sectionId);
        if (
          success &&
          uniqueSectionTypes.indexOf(sectionTypeTab as string) <
            uniqueSectionTypes.length - 1
        ) {
          setSectionTypeTab(
            uniqueSectionTypes[
              uniqueSectionTypes.indexOf(sectionTypeTab as string) + 1
            ]
          );
        }
      }
    }
  };

  const handleUnitClick = async (
    e: null | {
      id: string;
      courseId: string;
      room: string;
      code: string;
      type: string;
      number: number;
      instructors: string[];
    },
    event: React.MouseEvent,
    allowDoubleClick: boolean
  ) => {
    if (e !== null) {
      if (allowDoubleClick) {
        if (event.detail === 1) {
          setTabState("manage");
          await fetchCourseSections(e.courseId);
          setSectionTypeTab(e.type);
        } else if (event.detail >= 2) {
          await removeCourseSection(e.id);
        }
      } else {
        setTabState("manage");
        await fetchCourseSections(e.courseId);
        setSectionTypeTab(e.type);
      }
    }
  };

  const handleMissingCDCClick = async (courseId: string) => {
    setTabState("cdcs");
    if (courseId === "") {
      setCourseSectionsOpened(false);
    } else {
      await fetchCourseSections(courseId);
    }
  };

  useEffect(() => {
    const fetchCourseDetails = async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/course`, {
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
        setCoursesLoaded(true);
        setCourseDetails(json);
      } else if (res.status === 404) {
        alert(`Error: ${json.message}`);
      } else if (res.status === 500) {
        alert(`Server error: ${json.message}`);
      } else {
        alert(`Server error: ${json}`);
      }
    };
    fetchTimetableDetails();
    fetchCourseDetails();
  }, [fetchTimetableDetails, id]);
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
                            <File className="h-5 w-5" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-900 text-slate-50 border-slate-800">
                            You're editing a draft timetable
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
                          className="w-fit mx-1 text-sm bg-slate-700 hover:bg-slate-600"
                        >
                          {timetableDetails.year}-{timetableDetails.semester}
                        </Badge>
                        <Badge
                          variant="default"
                          className="w-fit text-sm mx-1 bg-slate-700 hover:bg-slate-600"
                        >
                          {timetableDetails.acadYear}
                        </Badge>
                        {timetableDetails.degrees.map((degree) => (
                          <Badge
                            variant="secondary"
                            className="w-fit text-sm mx-1"
                          >
                            {degree}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center">
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
                    {missingCDCs.length > 0 && (
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger
                          asChild
                          className="mr-4 hover:bg-slate-700 transition duration-200 ease-in-out"
                        >
                          <div className="p-2 rounded-full">
                            <Info className="w-6 h-6 m-1" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-900 text-slate-50 border-slate-800">
                          <div className="flex flex-col">
                            <span>
                              You haven't added all CDCs for this semester to
                              your timetable.
                            </span>
                            <span className="font-bold pt-2">
                              CDCs missing:
                            </span>
                            {missingCDCs.map((e) => (
                              <div className="flex items-center">
                                <span className="ml-2">{e.code}</span>
                                <Button
                                  onClick={() => {
                                    handleMissingCDCClick(e.id);
                                  }}
                                  className="p-2 w-fit h-fit ml-2 mb-1 bg-transparent hover:bg-slate-700 rounded-full"
                                >
                                  <ArrowUpRightFromCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {cdcNotFoundWarning.length > 0 && (
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger
                          asChild
                          className="mr-4 hover:bg-orange-800/40 transition duration-200 ease-in-out"
                        >
                          <div className="p-2 rounded-full">
                            <AlertOctagon className="text-orange-400 m-1 w-6 h-6" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-900 text-slate-50 border-slate-800">
                          <div className="flex flex-col">
                            <span className="font-bold">
                              Chrono could not find some of your CDCs in the
                              list of courses.
                            </span>
                            <span className="flex">
                              Please report this issue
                              <a
                                href="https://github.com/crux-bphc/chronofactorem-rewrite/issues"
                                className="text-blue-300 flex pl-1"
                              >
                                here
                                <ArrowUpRightFromCircle className="w-4 h-4 ml-1" />
                              </a>
                            </span>
                            <span className="font-bold pt-2">Error List:</span>
                            <span className="ml-2">
                              {cdcNotFoundWarning.map((e) => e.warning)}
                            </span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {timetableDetails.warnings.length !== 0 && (
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger
                          asChild
                          className="duration-200 mr-4 text-md p-2 h-fit hover:bg-orange-800/40 rounded-lg px-4"
                        >
                          <div className="flex items-center">
                            <span className="text-orange-400 pr-4">
                              {timetableDetails.warnings
                                .slice(0, 2)
                                .map((x) => x.replace(":", " "))
                                .map((x, i) => (
                                  <>
                                    <span className="font-bold">{x}</span>
                                    {i >= 0 &&
                                      i <
                                        timetableDetails.warnings.length -
                                          1 && <span>, </span>}
                                  </>
                                ))}
                              {timetableDetails.warnings.length > 2 &&
                                ` and ${
                                  timetableDetails.warnings.length - 2
                                } other warning${
                                  timetableDetails.warnings.length > 3
                                    ? "s"
                                    : ""
                                }`}
                            </span>
                            <AlertTriangle className="w-6 h-6 m-1 text-orange-400" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-800 text-slate-50 border-slate-700">
                          {timetableDetails.warnings.map((warning) => (
                            <div className="pb-2">
                              <span className="font-bold">
                                {warning.split(":")[0]} is
                              </span>
                              <div className="flex flex-col pl-4">
                                {warning
                                  .split(":")[1]
                                  .split("")
                                  .map((x) => (
                                    <div className="flex items-center">
                                      <span>missing a {x} section</span>
                                      <Button
                                        onClick={(event) => {
                                          handleUnitClick(
                                            {
                                              id: "",
                                              type: x,
                                              courseId: courseDetails.filter(
                                                (x) =>
                                                  x.code ===
                                                  warning.split(":")[0]
                                              )[0].id,
                                              code: "",
                                              instructors: [],
                                              number: 0,
                                              room: "",
                                            },
                                            event,
                                            false
                                          );
                                        }}
                                        className="p-2 w-fit h-fit ml-2 mb-1 bg-transparent hover:bg-slate-700 rounded-full"
                                      >
                                        <ArrowUpRightFromCircle className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {timetableDetails.warnings.length === 0 &&
                      missingCDCs.length === 0 &&
                      cdcNotFoundWarning.length === 0 && (
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger
                            asChild
                            className="duration-200 mr-4 text-md p-2 h-fit hover:bg-slate-800 rounded-full"
                          >
                            <div>
                              <Check className="w-6 h-6 m-1" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-800 text-slate-50 border-slate-700">
                            All good!
                          </TooltipContent>
                        </Tooltip>
                      )}

                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <span tabIndex={0}>
                          <Button
                            className={`rounded-lg font-bold flex text-lg p-4 bg-green-800 hover:bg-green-700`}
                            disabled={
                              timetableDetails.warnings.length !== 0 ||
                              timetableDetails.sections.length === 0
                            }
                            onClick={() => navigate(`/finalize/${id}`)}
                          >
                            Publish
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {(timetableDetails.warnings.length !== 0 ||
                        timetableDetails.sections.length === 0) && (
                        <TooltipContent className="bg-slate-900 text-slate-50 border-slate-800">
                          {timetableDetails.sections.length === 0
                            ? "Can't publish empty timetable"
                            : "Can't publish timetable until you fix all warnings"}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-96 bg-slate-800 mt-4 h-fit">
                    {courseSectionsOpened ? (
                      <div className="w-96 h-[calc(100vh-16.5rem)]">
                        <div className="flex items-center w-full pt-2">
                          <Button
                            className="rounded-full flex ml-2 px-2 mb-2 mr-2 items-center bg-slate-800 hover:bg-slate-700"
                            onClick={() => {
                              setCourseSectionsOpened(false);
                            }}
                          >
                            <ArrowLeft />
                          </Button>
                          <span className="text-md pb-2 pt-1">
                            {courseSections.code}: {courseSections.name}
                          </span>
                        </div>
                        <Tabs
                          value={sectionTypeTab as string}
                          className="w-full h-full bg-slate-700"
                        >
                          <TabsList className="bg-slate-800 rounded-b-none text-slate-200 h-10 w-full">
                            {uniqueSectionTypes.map((type) => (
                              <TabsTrigger
                                onClick={() => setSectionTypeTab(type)}
                                value={type}
                                className="duration-300 data-[state=active]:bg-slate-700 mx-1 ring-slate-700 ring-offset-slate-700 bg-slate-900 hover:bg-slate-700/40 font-medium w-full text-lg rounded-b-none rounded-t-xl data-[state=active]:text-slate-100"
                              >
                                {type}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                          {uniqueSectionTypes.map((type) => (
                            <TabsContent
                              value={type}
                              className="h-[calc(100%-3rem)] ring-slate-700 ring-offset-slate-700"
                            >
                              <div className="h-full overflow-y-scroll">
                                {classifiedSections[
                                  type as keyof {
                                    L: { type: string; id: string }[];
                                    P: { type: string; id: string }[];
                                    T: { type: string; id: string }[];
                                  }
                                ].map((section) => (
                                  <div
                                    onClick={() => {
                                      if (
                                        timetableDetails.sections.filter(
                                          (ttSection) =>
                                            ttSection.id === section.id
                                        ).length === 0 &&
                                        !section.clashing
                                      ) {
                                        handleSectionClick(type, section.id);
                                      }
                                    }}
                                    className={`relative px-4 transition duration-200 ease-in-out py-3 border-2 m-2 rounded-lg border-slate-600 items-center flex ${
                                      timetableDetails.sections.filter(
                                        (ttSection) =>
                                          ttSection.id === section.id
                                      ).length > 0
                                        ? "text-slate-50 cursor-pointer hover:bg-slate-600/40 bg-slate-600"
                                        : section.clashing
                                        ? "text-slate-300/40 bg-slate-800/40"
                                        : "text-slate-50 cursor-pointer hover:bg-slate-600/40"
                                    }`}
                                  >
                                    {timetableDetails.sections.filter(
                                      (ttSection) => ttSection.id === section.id
                                    ).length === 0 &&
                                      section.clashing && (
                                        <div className="absolute left-0 bg-slate-800/80 text-center w-full">
                                          <span className="text-slate-200 font-bold text-md">
                                            Clashing with{" "}
                                            {section.clashing.map((y, i) => (
                                              <>
                                                <span
                                                  className="text-blue-400 inline pl-1 items-center cursor-pointer"
                                                  onClick={(event) => {
                                                    handleUnitClick(
                                                      {
                                                        id: "",
                                                        type: y
                                                          .split(" ")[2]
                                                          .replace(
                                                            /[0-9]/g,
                                                            ""
                                                          ),
                                                        courseId:
                                                          courseDetails.filter(
                                                            (x) =>
                                                              x.code ===
                                                              y
                                                                .split(" ")
                                                                .splice(0, 2)
                                                                .join(" ")
                                                          )[0].id,
                                                        code: "",
                                                        instructors: [],
                                                        number: 0,
                                                        room: "",
                                                      },
                                                      event,
                                                      false
                                                    );
                                                  }}
                                                >
                                                  {y}
                                                  <ArrowUpRightFromCircle className="inline w-3 h-3 ml-1 mr-1" />
                                                </span>
                                                {i >= 0 &&
                                                  i <
                                                    (section.clashing?.length ??
                                                      0) -
                                                      1 && <span>, </span>}
                                              </>
                                            ))}
                                          </span>
                                        </div>
                                      )}
                                    <span className="w-fit text-sm ">
                                      {section.number}
                                    </span>
                                    <div className="flex flex-col pl-4">
                                      <span className="w-fit text-sm font-semibold ">
                                        {section.instructors.join(", ")}
                                      </span>
                                      <span className="w-fit text-sm pt-1">
                                        {section.roomTime
                                          .map((e) =>
                                            e.split(":").splice(1).join(" ")
                                          )
                                          .join(", ")}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </TabsContent>
                          ))}
                        </Tabs>
                        {/* <div>{JSON.stringify(courseSections)}</div> */}
                      </div>
                    ) : (
                      <Tabs value={tabState} className="w-full">
                        <TabsList className="bg-slate-900 rounded-b-none -z-10 text-slate-200 w-full mb-[-0.5rem]">
                          <TabsTrigger
                            value="cdcs"
                            onClick={() => setTabState("cdcs")}
                            className="data-[state=active]:bg-slate-800 pt-3 pb-2 mb-[-0.5rem] ring-slate-700 ring-offset-slate-700 bg-slate-900 hover:bg-slate-800/60 duration-200 font-bold w-full text-md rounded-b-none rounded-t-xl data-[state=active]:text-slate-100"
                          >
                            CDCs
                          </TabsTrigger>
                          <TabsTrigger
                            value="search"
                            onClick={() => setTabState("search")}
                            className="data-[state=active]:bg-slate-800 pt-3 pb-2 mb-[-0.5rem] ring-slate-700 ring-offset-slate-700 bg-slate-900 hover:bg-slate-800/60 duration-200 font-bold w-full text-md rounded-b-none rounded-t-xl data-[state=active]:text-slate-100"
                          >
                            Search
                          </TabsTrigger>
                          <TabsTrigger
                            value="manage"
                            onClick={() => setTabState("manage")}
                            className="data-[state=active]:bg-slate-800 pt-3 pb-2 mb-[-0.5rem] ring-slate-700 ring-offset-slate-700 bg-slate-900 hover:bg-slate-800/60 duration-200 font-bold w-full text-md rounded-b-none rounded-t-xl data-[state=active]:text-slate-100"
                          >
                            Manage
                          </TabsTrigger>
                          <TabsTrigger
                            value="exams"
                            onClick={() => setTabState("exams")}
                            className="data-[state=active]:bg-slate-800 pt-3 pb-2 mb-[-0.5rem] ring-slate-700 ring-offset-slate-700 bg-slate-900 hover:bg-slate-800/60 duration-200 font-bold w-full text-md rounded-b-none rounded-t-xl data-[state=active]:text-slate-100"
                          >
                            Exams
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent
                          value="cdcs"
                          className="ring-slate-700 ring-offset-slate-700 bg-slate-800/40"
                        >
                          <div className="w-96 h-[calc(100vh-16rem)] overflow-y-auto">
                            {requiredCourses
                              .filter((course) => course.id !== null)
                              .map((nonOptionalCourses) => {
                                const course = nonOptionalCourses as {
                                  id: string;
                                  code: string;
                                  name: string;
                                };
                                return (
                                  <div
                                    onClick={() =>
                                      fetchCourseSections(course.id)
                                    }
                                    className="px-4 hover:bg-slate-700 transition duration-200 ease-in-out cursor-pointer h-14 border-t-2 border-slate-700/60 items-center flex justify-between"
                                  >
                                    <span className="w-fit text-sm">
                                      {course.code}: {course.name}
                                    </span>
                                    <ChevronRight className="w-6 h-6" />
                                  </div>
                                );
                              })}
                            {requiredCourses
                              .filter(
                                (course) =>
                                  course.id === null &&
                                  course.type === "optional"
                              )
                              .map((optionalCourses) => {
                                const courseOptions = optionalCourses as {
                                  id: null;
                                  options: {
                                    id: string;
                                    code: string;
                                    name: string;
                                  }[];
                                };
                                return (
                                  <>
                                    <div className="border-slate-700/60 border-t-2 w-full h-fit"></div>
                                    {courseOptions.options
                                      .map((course) => (
                                        <div
                                          onClick={() =>
                                            fetchCourseSections(course.id)
                                          }
                                          className="px-4 hover:bg-slate-700 transition duration-200 ease-in-out cursor-pointer h-14 border-slate-700/60 items-center flex justify-between"
                                        >
                                          <span className="w-fit text-sm">
                                            {course.code}: {course.name}
                                          </span>
                                          <ChevronRight className="w-6 h-6" />
                                        </div>
                                      ))
                                      .reduce((prev, curr) => (
                                        <>
                                          <div className="flex flex-col">
                                            {prev}
                                            <div className="w-full flex justify-center font-bold text-lg">
                                              <Tooltip delayDuration={100}>
                                                <TooltipTrigger asChild>
                                                  <span className="text-slate-50 z-20">
                                                    <div className="absolute border-2 border-slate-50 w-12 mt-[-0.1rem] ml-[-0.75rem] h-8 rounded-full"></div>
                                                    OR
                                                  </span>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-slate-900 text-slate-50 border-slate-800">
                                                  You have to pick only one of
                                                  these options
                                                </TooltipContent>
                                              </Tooltip>
                                            </div>
                                            {curr}
                                          </div>
                                        </>
                                      ))}
                                    <div className="border-slate-700/60 border-t-2 w-full h-fit"></div>
                                  </>
                                );
                              })}
                            {requiredCourses.length === 0 && (
                              <div className="flex flex-col justify-center items-center bg-slate-800 h-full rounded-xl">
                                <Bird className="text-slate-400 w-36 h-36 mb-4" />
                                <span className="text-slate-400 text-2xl">
                                  No CDCs for this semester
                                </span>
                                <Button
                                  onClick={() => setTabState("search")}
                                  className="text-green-200 w-fit text-2xl p-4 mt-8 bg-green-900 hover:bg-green-800"
                                >
                                  Search for courses
                                </Button>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                        <TabsContent
                          value="search"
                          className="ring-slate-700 ring-offset-slate-700 bg-slate-800/40"
                        >
                          <div className="pt-1">
                            <Input
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Search Courses"
                              className="mx-4 my-2 w-[22rem] text-md p-2 bg-slate-900/80 ring-slate-700 ring-offset-slate-700 border-slate-700/60"
                            />
                            {coursesLoaded ? (
                              <div className="h-[calc(100vh-20rem)] overflow-y-auto">
                                {courseSearchResults.map((course) => (
                                  <div
                                    onClick={() => {
                                      if (!course.clashing) {
                                        fetchCourseSections(course.id);
                                      }
                                    }}
                                    className={`relative px-4 transition flex-col pt-4 flex duration-200 ease-in-out border-t-2 border-slate-700/60 ${
                                      course.clashing
                                        ? "text-slate-400"
                                        : "cursor-pointer hover:bg-slate-700 text-slate-50"
                                    }`}
                                  >
                                    {course.clashing && (
                                      <div className="absolute left-0 top-8 py-1 bg-slate-900/60 text-center w-full">
                                        <span className="text-slate-200 font-medium text-md">
                                          Clashing with{" "}
                                          {course.clashing
                                            .map((x) => {
                                              const [code, exam] = x.split("|");
                                              return (
                                                code +
                                                "'s " +
                                                exam.toLowerCase()
                                              );
                                            })
                                            .join(", ")}
                                        </span>
                                      </div>
                                    )}

                                    <div className="w-full flex justify-between items-center">
                                      <span className="w-fit text-sm">
                                        {course.code}: {course.name}
                                      </span>
                                      <ChevronRight className="w-6 h-6" />
                                    </div>

                                    <div>
                                      <span className="pl-4 py-1 text-sm font-bold">
                                        Midsem
                                      </span>
                                      <span className="pl-4 py-1 text-sm">
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
                                    <div className="pb-4">
                                      <span className="pl-4 py-1 text-sm font-bold">
                                        Compre
                                      </span>
                                      <span className="pl-4 py-1 text-sm">
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
                                  </div>
                                ))}
                                {courseSearchResults.length === 0 && (
                                  <div className="flex flex-col justify-center items-center bg-slate-800/40 h-full rounded-xl">
                                    <Bird className="text-slate-300 w-36 h-36 mb-4" />
                                    <span className="text-slate-300 text-2xl">
                                      No results
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Spinner />
                            )}
                          </div>
                        </TabsContent>
                        <TabsContent
                          value="manage"
                          className="ring-slate-700 ring-offset-slate-700 bg-slate-800/40"
                        >
                          <div className="w-96 h-[calc(100vh-16rem)] overflow-y-auto">
                            {addedCourses.map((course) => (
                              <div
                                onClick={() => fetchCourseSections(course.id)}
                                className="px-4 hover:bg-slate-700 transition duration-200 ease-in-out cursor-pointer h-14 border-t-2 border-slate-700/60 items-center flex justify-between"
                              >
                                <span className="w-fit text-sm">
                                  {course.code}: {course.name}
                                </span>
                                <ChevronRight className="w-6 h-6" />
                              </div>
                            ))}
                            {addedCourses.length === 0 && (
                              <div className="flex flex-col justify-center items-center bg-slate-800/40 h-full rounded-xl">
                                <Bird className="text-slate-300 w-36 h-36 mb-4" />
                                <span className="text-slate-300 text-2xl">
                                  Nothing to manage.
                                </span>
                                <Button
                                  onClick={() => setTabState("search")}
                                  className="text-green-200 w-fit text-2xl p-4 mt-8 bg-green-800 hover:bg-green-700"
                                >
                                  Add a course
                                </Button>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                        <TabsContent
                          value="exams"
                          className="ring-slate-700 ring-offset-slate-700 bg-slate-800/40"
                        >
                          <div className="w-96 h-[calc(100vh-16rem)] overflow-y-auto pt-4">
                            {addedCourses.length === 0 ? (
                              <div className="flex flex-col justify-center items-center bg-slate-800/40 h-full rounded-xl">
                                <Bird className="text-slate-300 w-36 h-36 mb-4" />
                                <span className="text-slate-300 text-2xl">
                                  No exams to worry about.
                                </span>
                                <Button
                                  onClick={() => setTabState("search")}
                                  className="text-green-200 w-fit text-2xl p-4 mt-8 bg-green-800 hover:bg-green-700"
                                >
                                  Add a course
                                </Button>
                              </div>
                            ) : (
                              <>
                                <span className="text-xl font-bold pl-4 flex mb-2 mt-2">
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
                              </>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    )}
                  </div>
                  <div className="ml-4 flex w-full">
                    {isVertical ? (
                      <div className="flex flex-col justify-between w-28 mr-2 mt-11 text-md text-center text-slate-500 grid-rows-11">
                        <div className="mb-4 flex items-center justify-between w-full">
                          <span className="text-slate-600">8 - 9AM</span>
                          <span className="font-bold">1</span>
                        </div>
                        <div className="mb-4 flex items-center justify-between w-full">
                          <span className="text-slate-600">9 - 10AM</span>
                          <span className="font-bold">2</span>
                        </div>
                        <div className="mb-4 flex items-center justify-between w-full">
                          <span className="text-slate-600">10 - 11AM</span>
                          <span className="font-bold">3</span>
                        </div>
                        <div className="mb-4 flex items-center justify-between w-full">
                          <span className="text-slate-600">11 - 12PM</span>
                          <span className="font-bold">4</span>
                        </div>
                        <div className="mb-4 flex items-center justify-between w-full">
                          <span className="text-slate-600">12 - 1PM</span>
                          <span className="font-bold">5</span>
                        </div>
                        <div className="mb-4 flex items-center justify-between w-full">
                          <span className="text-slate-600">1 - 2PM</span>
                          <span className="font-bold">6</span>
                        </div>
                        <div className="mb-4 flex items-center justify-between w-full">
                          <span className="text-slate-600">2 - 3PM</span>
                          <span className="font-bold">7</span>
                        </div>
                        <div className="mb-4 flex items-center justify-between w-full">
                          <span className="text-slate-600">3 - 4PM</span>
                          <span className="font-bold">8</span>
                        </div>
                        <div className="mb-4 flex items-center justify-between w-full">
                          <span className="text-slate-600">4 - 5PM</span>
                          <span className="font-bold">9</span>
                        </div>
                        <div className="mb-4 flex items-center justify-between w-full">
                          <span className="text-slate-600">5 - 6PM</span>
                          <span className="font-bold">10</span>
                        </div>
                        <div className="mb-4 flex items-center justify-between w-full">
                          <span className="text-slate-600">6 - 7PM</span>
                          <span className="font-bold">11</span>
                        </div>
                        {/* <div className="mb-4 flex flex-col">
                        <span className="font-bold">12</span>
                        <span className="text-slate-600">7 - 8PM</span>
                      </div> */}
                      </div>
                    ) : (
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
                      ) : (
                        <div
                          className={`grid justify-between text-md text-center text-slate-500 ${
                            isVertical
                              ? "grid-rows-11"
                              : "grid-cols-11 mb-[-1rem]"
                          } `}
                        >
                          <div className="mb-4 flex flex-col">
                            <span className="font-bold">1</span>
                            <span className="text-slate-600">8 - 9AM</span>
                          </div>
                          <div className="mb-4 flex flex-col">
                            <span className="font-bold">2</span>
                            <span className="text-slate-600">9 - 10AM</span>
                          </div>
                          <div className="mb-4 flex flex-col">
                            <span className="font-bold">3</span>
                            <span className="text-slate-600">10 - 11AM</span>
                          </div>
                          <div className="mb-4 flex flex-col">
                            <span className="font-bold">4</span>
                            <span className="text-slate-600">11 - 12PM</span>
                          </div>
                          <div className="mb-4 flex flex-col">
                            <span className="font-bold">5</span>
                            <span className="text-slate-600">12 - 1PM</span>
                          </div>
                          <div className="mb-4 flex flex-col">
                            <span className="font-bold">6</span>
                            <span className="text-slate-600">1 - 2PM</span>
                          </div>
                          <div className="mb-4 flex flex-col">
                            <span className="font-bold">7</span>
                            <span className="text-slate-600">2 - 3PM</span>
                          </div>
                          <div className="mb-4 flex flex-col">
                            <span className="font-bold">8</span>
                            <span className="text-slate-600">3 - 4PM</span>
                          </div>
                          <div className="mb-4 flex flex-col">
                            <span className="font-bold">9</span>
                            <span className="text-slate-600">4 - 5PM</span>
                          </div>
                          <div className="mb-4 flex flex-col">
                            <span className="font-bold">10</span>
                            <span className="text-slate-600">5 - 6PM</span>
                          </div>
                          <div className="mb-4 flex flex-col">
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
                            ? "grid-cols-6 grid-rows-11 h-[calc(100vh-13rem)]"
                            : "grid-cols-11 grid-rows-6 h-[calc(100vh-14rem)]"
                        } gap-2 w-full`}
                      >
                        {timetableGrid.map((e) =>
                          e !== null ? (
                            <Tooltip delayDuration={100}>
                              <TooltipTrigger asChild>
                                <div
                                  className={`hover:bg-slate-500/90 cursor-pointer transition duration-200 ease-in-out bg-slate-600 rounded-lg ${
                                    isVertical
                                      ? "h-fit pl-3 pb-2 pt-1"
                                      : "pl-3 pb-2 pt-2"
                                  }`}
                                  onClick={(event) =>
                                    handleUnitClick(e, event, true)
                                  }
                                >
                                  <div className="flex h-full text-sm flex-col">
                                    <span className="font-bold">
                                      {e.code} {e.type}
                                      {e.number}
                                    </span>
                                    <span className="text-slate-300">
                                      {e.room}
                                    </span>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-slate-900 text-slate-50 border-slate-800">
                                Double click to remove section
                              </TooltipContent>
                            </Tooltip>
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

export default Edit;
