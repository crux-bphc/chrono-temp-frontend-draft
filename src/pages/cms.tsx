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

import {
  LogOut,
  Save,
  Pencil,
  RotateCw,
  Trash,
  HelpCircle,
  Bird,
  Plus,
  ArrowUpRightFromCircle,
} from "lucide-react";
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

const CMS = () => {
  const { id } = useParams();
  const [enrolledCourses, setEnrolledCourses] = useState(
    [] as {
      id: number;
      displayname: string;
    }[]
  );
  const tokenRef = useRef<HTMLInputElement>(null);
  const cookieRef = useRef<HTMLInputElement>(null);
  const sesskeyRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [enrollingInProgress, setEnrollingInProgress] = useState(false);
  const [coursesLoaded, setCoursesLoaded] = useState(false);
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
  const [allowEdit, setAllowEdit] = useState(true);
  const [enrolledLoaded, setEnrolledLoaded] = useState(true);
  const navigate = useNavigate();

  const [sectionsInTimetable, setSectionsInTimetable] = useState<
    {
      courseId: string;
      type: string;
      roomTime: string[];
      number: number;
    }[]
  >([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [sectionNameListLoaded, setSectionNameListLoaded] = useState(false);
  const [sectionNameList, setSectionNameList] = useState<string[]>([]);

  useEffect(() => {
    const computeFinalSectionNames = async () => {
      const sectionNames = (
        await Promise.all(
          sectionsInTimetable.map(async (section) => {
            const course = courseDetails.filter(
              (course) => course.id === section.courseId
            )[0];
            const courseSections = await fetch(
              `${import.meta.env.VITE_BACKEND_URL}/course/${course.id}`,
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
            const json = await courseSections.json();
            if (courseSections.status === 200) {
              const count = (json.sections as { type: string }[]).filter(
                (e) => e.type === section.type
              ).length;
              return count > 1
                ? [
                    section.roomTime[0].split(":")[0] +
                      " " +
                      course.name +
                      " " +
                      section.type,
                    section.roomTime[0].split(":")[0] +
                      " " +
                      course.name +
                      " " +
                      section.type +
                      section.number,
                  ]
                : section.roomTime[0].split(":")[0] +
                    " " +
                    course.name +
                    " " +
                    section.type +
                    section.number;
            } else if (courseSections.status === 404) {
              alert(`Error: ${json.message}`);
              return [];
            } else if (courseSections.status === 500) {
              alert(`Server error: ${json.message}`);
              return [];
            } else {
              alert(`Server error: ${json}`);
              return [];
            }
          })
        )
      ).flat();
      setSectionNameList(sectionNames);
      setSectionNameListLoaded(true);
    };
    computeFinalSectionNames();
  }, [courseDetails, sectionsInTimetable]);

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
        if (!json.draft && !json.archived) {
          setIsLoaded(true);
          setSectionsInTimetable(json.sections);
        } else {
          alert(
            "CMS Auto-Enroll cannot be used with draft or archived timetables."
          );
          navigate("/");
        }
      } else if (res.status === 404) {
        alert(`Error: ${json.message}`);
      } else if (res.status === 500) {
        alert(`Server error: ${json.message}`);
      } else {
        alert(`Server error: ${json}`);
      }
    };
    fetchCourseDetails();
    fetchTimetableDetails();
  }, [id, navigate]);

  const enrollAllSections = async () => {
    setEnrolledLoaded(false);
    setEnrollingInProgress(true);
    const errors: string[] = [];
    for (let i = 0; i < sectionNameList.length; i++) {
      const courseRes = await fetch(
        `https://cms.bits-hyderabad.ac.in/webservice/rest/server.php?wsfunction=core_course_search_courses&moodlewsrestformat=json&wstoken=${
          tokenRef.current?.value
        }&criterianame=search&criteriavalue=${encodeURIComponent(
          sectionNameList[i]
        )}`,
        {
          method: "GET",
        }
      );
      const courseJSON = await courseRes.json();
      if (
        "courses" in courseJSON &&
        Array.isArray(courseJSON.courses) &&
        courseJSON.courses.length > 0 &&
        "displayname" in courseJSON.courses[0] &&
        typeof courseJSON.courses[0].displayname === "string" &&
        "id" in courseJSON.courses[0] &&
        typeof courseJSON.courses[0].id === "number"
      ) {
        const split = courseJSON.courses[0].displayname.split(" ");
        const sectionNameSplit = sectionNameList[i].split(" ");
        if (
          split[split.length - 1] ===
          sectionNameSplit[sectionNameSplit.length - 1]
        ) {
          const enrollResponse = await fetch(
            `https://cms.bits-hyderabad.ac.in/webservice/rest/server.php?wsfunction=enrol_self_enrol_user&moodlewsrestformat=json&wstoken=${tokenRef.current?.value}&courseid=${courseJSON.courses[0].id}`,
            {
              method: "GET",
            }
          );
          const json = await enrollResponse.json();
          if (enrollResponse.status !== 200 || !json.status) {
            errors.push(sectionNameList[i]);
            setErrors(errors);
          }
        } else {
          errors.push(sectionNameList[i]);
          setErrors(errors);
        }
      } else {
        errors.push(sectionNameList[i]);
        setErrors(errors);
      }
    }
    setEnrollingInProgress(false);
    await fetchEnrolledSections();
  };

  const unenrollAllSections = async () => {
    setEnrolledLoaded(false);
    for (let i = 0; i < enrolledCourses.length; i++) {
      const res = await fetch(
        `https://cms.bits-hyderabad.ac.in/webservice/rest/server.php?wsfunction=core_enrol_get_course_enrolment_methods&moodlewsrestformat=json&wstoken=${tokenRef.current?.value}&courseid=${enrolledCourses[i].id}`,
        {
          method: "GET",
        }
      );
      const enrollmentInstance = await res.json();
      const unenrollResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/unenroll`,
        {
          method: "POST",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
          mode: "cors",
          credentials: "include",
          body: JSON.stringify({
            enrollID: enrollmentInstance[0].id,
            sesskey: sesskeyRef.current?.value,
            cookie: cookieRef.current?.value,
          }),
        }
      );
      if (unenrollResponse.status !== 200) {
        alert(
          "Error when unenrolling from courses: " +
            JSON.stringify(await unenrollResponse.json())
        );
      }
    }
    await fetchEnrolledSections();
  };

  const fetchEnrolledSections = async () => {
    setEnrolledLoaded(false);
    const userRes = await fetch(
      `https://cms.bits-hyderabad.ac.in/webservice/rest/server.php?wsfunction=core_webservice_get_site_info&moodlewsrestformat=json&wstoken=${tokenRef.current?.value}`,
      {
        method: "GET",
      }
    );
    const userJSON = await userRes.json();
    if (
      userRes.status !== 200 ||
      !("userid" in userJSON) ||
      typeof userJSON.userid !== "number"
    ) {
      console.log(userJSON);
      alert("Web Service Token is likely incorrect");
      setEnrolledLoaded(true);
      return;
    }
    const res = await fetch(
      `https://cms.bits-hyderabad.ac.in/webservice/rest/server.php?wsfunction=core_enrol_get_users_courses&moodlewsrestformat=json&wstoken=${tokenRef.current?.value}&userid=${userJSON.userid}`,
      {
        method: "GET",
      }
    );
    const json = await res.json();
    if (Array.isArray(json)) {
      if (json.length > 0) {
        if (
          "id" in json[0] &&
          typeof json[0].id === "number" &&
          "displayname" in json[0] &&
          typeof json[0].displayname === "string"
        ) {
          setEnrolledCourses(
            json as {
              id: number;
              displayname: string;
            }[]
          );
        } else {
          alert("Error fetching courses from CMS! Check your credentials.");
        }
      } else {
        setEnrolledCourses([]);
      }
    } else {
      alert("Error fetching courses from CMS! Check your credentials.");
    }
    setEnrolledLoaded(true);
  };
  const [userInfoCookie] = useCookies(["userInfo"]);

  return (
    <>
      <TooltipProvider>
        <div className="fixed -z-10 top-0 flex bg-slate-950 h-screen w-full"></div>
        <div className="flex flex-col w-full pb-12">
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
          {isLoaded && coursesLoaded ? (
            <div className="flex pl-24 text-slate-50 pt-12 w-full">
              <div className="flex flex-col w-full">
                <div className="flex items-center">
                  <span className="text-5xl font-bold">
                    Enter your CMS Details
                  </span>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <div className="bg-transparent rounded-full hover:bg-slate-800 text-slate-100 px-4 py-3 ml-2 text-lg font-bold">
                        <HelpCircle />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="w-96 flex space-y-2 flex-col bg-slate-800 text-slate-50 border-slate-700 text-md">
                      <span>
                        To find these details, follow the instructions in{" "}
                        <a
                          href="https://youtu.be/ls1VsCPRH0I"
                          className="text-blue-400 ml-1 inline items-center"
                        >
                          this quick, 1-minute-long video.
                          <ArrowUpRightFromCircle className="inline w-4 h-4 ml-1 mr-1" />
                        </a>
                      </span>
                      <span>
                        To automate enrolling and unenrolling, ChronoFactorem
                        needs these details to perform these actions on your
                        behalf.
                      </span>
                      <span>
                        ChronoFactorem does not collect, transmit, retain, or
                        store any of these details. These details do not leave
                        this webpage. All of ChronoFactorem's code is written,
                        and deployed publicly, and can be viewed and verified by
                        anyone that wishes to.
                      </span>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Button
                        className="bg-transparent py-6 rounded-full hover:bg-slate-800 text-slate-100 mx-2 text-lg font-bold"
                        onClick={() => {
                          if (allowEdit) fetchEnrolledSections();
                          setAllowEdit(!allowEdit);
                        }}
                      >
                        {allowEdit ? <Save /> : <Pencil />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-800 text-slate-50 border-slate-700 text-md">
                      {allowEdit ? "Save CMS Details" : "Edit CMS Details"}
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex w-full space-x-4">
                  <div className="flex flex-col w-1/5">
                    <Label
                      htmlFor="webservicetoken"
                      className="mt-4 mb-1 text-lg"
                    >
                      Web Service Token
                    </Label>
                    <Input
                      ref={tokenRef}
                      id="webservicetoken"
                      placeholder="Web Service Token"
                      className="text-xl bg-slate-800 ring-slate-700 ring-offset-slate-700 border-slate-700"
                      disabled={!allowEdit}
                    />
                  </div>
                  <div className="flex flex-col w-1/5">
                    <Label htmlFor="sessionkey" className="mt-4 mb-1 text-lg">
                      Session Cookie
                    </Label>
                    <Input
                      ref={cookieRef}
                      id="sessioncookie"
                      placeholder="Session Cookie"
                      className="text-xl bg-slate-800 ring-slate-700 ring-offset-slate-700 border-slate-700"
                      disabled={!allowEdit}
                    />
                  </div>
                  <div className="flex flex-col w-1/5">
                    <Label htmlFor="sessionkey" className="mt-4 mb-1 text-lg">
                      Session Key
                    </Label>
                    <Input
                      ref={sesskeyRef}
                      id="sesskey"
                      placeholder="Session Key"
                      className="text-xl bg-slate-800 ring-slate-700 ring-offset-slate-700 border-slate-700"
                      disabled={!allowEdit}
                    />
                  </div>
                </div>
                <div className="flex relative h-fit">
                  {allowEdit && (
                    <div className="flex justify-center items-center absolute bg-slate-950/60 w-3/4 h-full">
                      <span className="text-3xl z-10 font-bold">
                        Enter your CMS details, and hit save to continue
                      </span>
                    </div>
                  )}
                  <div className={`w-full flex ${allowEdit ? "blur-sm" : ""}`}>
                    {enrolledLoaded ? (
                      <div className="flex flex-col pl-2 text-md py-8 w-1/4">
                        <div className="flex pb-4">
                          <span className="text-3xl font-bold">
                            Enrolled Sections
                          </span>
                          <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                              <Button
                                className="ml-4 bg-transparent py-4 px-4 hover:bg-slate-800 rounded-full w-fit text-blue-50 text-md"
                                onClick={() => fetchEnrolledSections()}
                              >
                                <RotateCw className="w-5 h-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-800 text-slate-50 border-slate-700 text-md">
                              Refetch Enrolled Sections
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                              <Button
                                className="ml-4 bg-transparent py-4 px-4 hover:bg-red-800 rounded-full w-fit text-slate-50 hover:text-red-50 text-md"
                                onClick={() => unenrollAllSections()}
                              >
                                <Trash className="w-5 h-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-800 text-slate-50 border-slate-700 text-md">
                              Unenrol from these Sections
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        {enrolledCourses.map((section) => (
                          <>
                            <span className="py-1">
                              {section.displayname
                                .replace(/&lt;/g, "<")
                                .replace(/&gt;/g, ">")
                                .replace(/&quot;/g, '"')
                                .replace(/&#39;/g, "'")
                                .replace(/&amp;/g, "&")}
                            </span>
                          </>
                        ))}
                        {enrolledCourses.length === 0 && (
                          <>
                            <div className="flex flex-col items-center">
                              <Bird className="text-slate-300 w-36 h-36 mb-4" />
                              <span className="text-xl text-slate-200">
                                CMS is empty, or your CMS credentials are wrong,
                                or... CMS is being slow. Try again in a few
                                seconds, or check on CMS directly.
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-1/4 pt-48">
                        <Spinner />
                      </div>
                    )}
                    {sectionNameListLoaded ? (
                      <div className="relative flex flex-col ml-8 text-md py-8 h-fit w-1/4">
                        {enrollingInProgress && (
                          <div className="absolute bg-slate-950/80 flex items-center justify-center w-full h-full">
                            <div className="flex flex-col items-center justify-center">
                              <Spinner />
                              <span className="text-slate-300 pt-4 text-xl">
                                Enrolling in sections...
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="flex pb-4">
                          <span className="text-3xl font-bold">
                            Sections to enroll in
                          </span>
                          <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                              <Button
                                className="ml-4 bg-transparent py-4 px-4 hover:bg-green-800 rounded-full w-fit text-green-50 text-md"
                                onClick={() => enrollAllSections()}
                              >
                                <Plus className="w-5 h-5" strokeWidth={2.5} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-800 text-slate-50 border-slate-700 text-md">
                              Enroll in these sections
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        {sectionNameList.map((section) => (
                          <span className="py-1">{section}</span>
                        ))}
                        {sectionNameList.length === 0 && (
                          <>
                            <div className="flex flex-col items-center">
                              <Bird className="text-slate-300 w-36 h-36 mb-4" />
                              <span className="text-xl text-slate-200">
                                No sections to enroll in
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-1/4 pt-48">
                        <Spinner />
                      </div>
                    )}

                    {errors.length > 0 && (
                      <div className="flex flex-col ml-8 text-md py-8 w-1/4">
                        <div className="flex pb-4 items-center">
                          <span className="text-3xl font-bold">Errors</span>
                          <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                              <div className="bg-transparent rounded-full hover:bg-slate-800 text-slate-100 px-4 py-3 ml-2 text-lg font-bold">
                                <HelpCircle />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="w-96 bg-slate-800 text-slate-50 border-slate-700 text-md">
                              ChronoFactorem wasn't able to enroll in these
                              sections. Either these sections don't exist, or
                              something else wen't wrong. You should try
                              manually enrolling in these sections.
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        {errors.map((section) => (
                          <span className="py-1">{section}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              <Spinner />
            </div>
          )}
        </div>
        <span className="fixed bottom-0 bg-slate-800 w-full text-center py-1 text-md tracking-tight lg:text-lg text-slate-400">
          Powered by CRUx: The Programming and Computing Club of BITS Hyderabad
        </span>
      </TooltipProvider>
    </>
  );
};

export default CMS;
