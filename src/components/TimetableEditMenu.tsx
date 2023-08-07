import Spinner from "@/components/Spinner";

import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  ArrowLeft,
  ArrowUpRightFromCircle,
  Bird,
  HelpCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TimetableEditMenu = ({
  courseSectionsOpened,
  setCourseSectionsOpened,
  courseSections,
  sectionTypeTab,
  setSectionTypeTab,
  uniqueSectionTypes,
  classifiedSections,
  timetableDetails,
  handleSectionClick,
  handleUnitClick,
  courseDetails,
  tabState,
  setTabState,
  requiredCourses,
  fetchCourseSections,
  searchTerm,
  setSearchTerm,
  coursesLoaded,
  courseSearchResults,
  addedCourses,
}: {
  courseSectionsOpened: boolean;
  setCourseSectionsOpened: React.Dispatch<React.SetStateAction<boolean>>;
  courseSections: {
    code: string;
    name: string;
    sections: {
      type: string;
      id: string;
      number: number;
      instructors: string[];
      roomTime: string[];
    }[];
  };
  sectionTypeTab: string | null;
  setSectionTypeTab: React.Dispatch<React.SetStateAction<string | null>>;
  uniqueSectionTypes: string[];
  classifiedSections: {
    L: {
      type: string;
      id: string;
      number: number;
      instructors: string[];
      roomTime: string[];
      clashing: null | string[];
    }[];
    P: {
      type: string;
      id: string;
      number: number;
      instructors: string[];
      roomTime: string[];
      clashing: null | string[];
    }[];
    T: {
      type: string;
      id: string;
      number: number;
      instructors: string[];
      roomTime: string[];
      clashing: null | string[];
    }[];
  };
  timetableDetails: {
    name: string;
    private: boolean;
    year: number;
    semester: number;
    acadYear: number;
    degrees: never[];
    examTimes: string[];
    sections: {
      id: string;
      roomTime: string[];
      courseId: string;
      type: string;
      number: number;
      instructors: string[];
    }[];
    timings: string[];
    warnings: string[];
    lastUpdated: string;
  };
  handleSectionClick: (type: string, sectionId: string) => Promise<void>;
  handleUnitClick: (
    e: {
      id: string;
      courseId: string;
      room: string;
      code: string;
      type: string;
      number: number;
      instructors: string[];
    } | null,
    event: React.MouseEvent,
    allowDoubleClick: boolean
  ) => Promise<void>;
  courseDetails: {
    id: string;
    code: string;
    name: string;
    midsemStartTime: string | null;
    midsemEndTime: string | null;
    compreStartTime: string | null;
    compreEndTime: string | null;
  }[];
  tabState: string;
  setTabState: React.Dispatch<React.SetStateAction<string>>;
  requiredCourses: (
    | {
        id: string;
        code: string;
        name: string;
        midsemStartTime: string | null;
        midsemEndTime: string | null;
        compreStartTime: string | null;
        compreEndTime: string | null;
      }
    | {
        id: null;
        type: "warning" | "optional";
        warning: string;
        options?: undefined;
      }
    | {
        id: null;
        type: "warning" | "optional";
        options: {
          id: string;
          code: string;
          name: string;
          midsemStartTime: string | null;
          midsemEndTime: string | null;
          compreStartTime: string | null;
          compreEndTime: string | null;
        }[];
        warning?: undefined;
      }
  )[];
  fetchCourseSections: (courseId: string) => Promise<void>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  coursesLoaded: boolean;
  courseSearchResults: {
    id: string;
    code: string;
    name: string;
    midsemStartTime: string | null;
    midsemEndTime: string | null;
    compreStartTime: string | null;
    compreEndTime: string | null;
    clashing: null | string[];
  }[];
  addedCourses: {
    id: string;
    code: string;
    name: string;
    midsemStartTime: string | null;
    midsemEndTime: string | null;
    compreStartTime: string | null;
    compreEndTime: string | null;
  }[];
}) => {
  return (
    <>
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
                          if (!section.clashing) {
                            handleSectionClick(type, section.id);
                          }
                        }}
                        className={`relative px-4 transition duration-200 ease-in-out py-3 border-2 m-2 rounded-lg border-slate-600 items-center flex ${
                          timetableDetails.sections.filter(
                            (ttSection) => ttSection.id === section.id
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
                                              .replace(/[0-9]/g, ""),
                                            courseId: courseDetails.filter(
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
                                        (section.clashing?.length ?? 0) - 1 && (
                                        <span>, </span>
                                      )}
                                  </>
                                ))}
                              </span>
                            </div>
                          )}
                        <span className="w-fit text-sm ">{section.number}</span>
                        <div className="flex flex-col pl-4">
                          <span className="w-fit text-sm font-semibold ">
                            {section.instructors.join(", ")}
                          </span>
                          <span className="w-fit text-sm pt-1">
                            {section.roomTime
                              .map((e) => e.split(":").splice(1).join(" "))
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
              {timetableDetails.year !== 1 && (
                <TabsTrigger
                  value="search"
                  onClick={() => setTabState("search")}
                  className="data-[state=active]:bg-slate-800 pt-3 pb-2 mb-[-0.5rem] ring-slate-700 ring-offset-slate-700 bg-slate-900 hover:bg-slate-800/60 duration-200 font-bold w-full text-md rounded-b-none rounded-t-xl data-[state=active]:text-slate-100"
                >
                  Search
                </TabsTrigger>
              )}
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
                        onClick={() => fetchCourseSections(course.id)}
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
                    (course) => course.id === null && course.type === "optional"
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
                              onClick={() => fetchCourseSections(course.id)}
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
                                      <>
                                        {" "}
                                        <div className="absolute border-2 border-slate-50 w-12 mt-[-0.1rem] h-8 rounded-full"></div>
                                        <span className="text-slate-50 z-20">
                                          OR
                                        </span>
                                      </>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-900 text-slate-50 border-slate-800">
                                      You have to pick only one of these options
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
                {requiredCourses.filter(
                  (course) =>
                    course.id !== null ||
                    (course.id === null && course.type === "optional")
                ).length === 0 && (
                  <div className="flex flex-col justify-center items-center bg-slate-800 h-full rounded-xl">
                    <Bird className="text-slate-400 w-36 h-36 mb-4" />
                    <span className="text-slate-400 text-2xl">
                      No CDCs for this semester
                    </span>
                    {timetableDetails.year === 1 ? (
                      <a
                        href="https://github.com/crux-bphc/chronofactorem-rewrite/issues"
                        className="text-green-200 cursor-pointer rounded-md py-2 w-fit text-2xl px-4 font-bold transition duration-200 ease-in-out mt-8 bg-green-900 hover:bg-green-800"
                      >
                        Report this issue
                      </a>
                    ) : (
                      <Button
                        onClick={() => setTabState("search")}
                        className="text-green-200 w-fit text-2xl p-4 mt-8 bg-green-900 hover:bg-green-800"
                      >
                        Search for courses
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            {timetableDetails.year !== 1 && (
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
                            <div className="absolute left-0 top-8 py-1 bg-slate-900/80 text-center w-full">
                              <span className="text-slate-200 font-medium text-md">
                                Clashing with{" "}
                                {course.clashing
                                  .map((x) => {
                                    const [code, exam] = x.split("|");
                                    return code + "'s " + exam.toLowerCase();
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
                              {`${
                                course.midsemStartTime
                                  ? new Date(
                                      course.midsemStartTime
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "numeric",
                                      hour12: true,
                                    })
                                  : "N/A"
                              } — ${
                                course.midsemEndTime
                                  ? new Date(
                                      course.midsemEndTime
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "numeric",
                                      hour12: true,
                                    })
                                  : "N/A"
                              }`}
                              {course.midsemStartTime === null && (
                                <Tooltip delayDuration={100}>
                                  <TooltipTrigger asChild>
                                    <div className="inline bg-transparent w-fit rounded-full hover:bg-slate-800/80 text-slate-100 p-1 transition duration-200 ease-in-out ml-2 text-sm font-bold">
                                      <HelpCircle className="inline h-4 w-4" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="w-96 bg-slate-700 text-slate-50 border-slate-600 text-md">
                                    Timetable Division hasn't published the
                                    midsem dates for this course. Either there
                                    is no midsem exam, or they haven't decided
                                    it yet. We recommend checking with your
                                    professor.
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </span>
                          </div>
                          <div className="pb-4">
                            <span className="pl-4 py-1 text-sm font-bold">
                              Compre
                            </span>
                            <span className="pl-4 py-1 text-sm">
                              {`${
                                course.compreStartTime
                                  ? new Date(
                                      course.compreStartTime
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "numeric",
                                      hour12: true,
                                    })
                                  : "N/A"
                              } — ${
                                course.compreEndTime
                                  ? new Date(
                                      course.compreEndTime
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "numeric",
                                      hour12: true,
                                    })
                                  : "N/A"
                              }`}
                              {course.compreStartTime === null && (
                                <Tooltip delayDuration={100}>
                                  <TooltipTrigger asChild>
                                    <div className="inline bg-transparent w-fit rounded-full hover:bg-slate-800/80 text-slate-100 p-1 transition duration-200 ease-in-out ml-2 text-sm font-bold">
                                      <HelpCircle className="inline h-4 w-4" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="w-96 bg-slate-700 text-slate-50 border-slate-600 text-md">
                                    Timetable Division hasn't published the
                                    compre dates for this course. Either there
                                    is no compre exam, or they haven't decided
                                    it yet. We recommend checking with your
                                    professor.
                                  </TooltipContent>
                                </Tooltip>
                              )}
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
            )}
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
                      onClick={() =>
                        setTabState(
                          timetableDetails.year === 1 ? "cdcs" : "search"
                        )
                      }
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
                      onClick={() =>
                        setTabState(
                          timetableDetails.year === 1 ? "cdcs" : "search"
                        )
                      }
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
    </>
  );
};

export default TimetableEditMenu;
