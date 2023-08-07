import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMemo } from "react";

export function TimetableGrid({
  isVertical,
  handleUnitClick,
  timetableDetailsSections,
}: {
  isVertical: boolean;
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
  timetableDetailsSections: {
    id: string;
    roomTime: string[];
    courseId: string;
    type: string;
    number: number;
    instructors: string[];
  }[];
}) {
  const timetableGrid = useMemo(() => {
    const daysOfWeek = ["M", "T", "W", "Th", "F", "S"];
    const grid: ({
      id: string;
      courseId: string;
      room: string;
      code: string;
      type: string;
      number: number;
      instructors: string[];
    } | null)[] = Array(11 * 6);
    for (let i = 0; i < grid.length; i++) {
      grid[i] = null;
    }
    for (let i = 0; i < timetableDetailsSections.length; i++) {
      for (let j = 0; j < timetableDetailsSections[i].roomTime.length; j++) {
        const [code, room, day, hour] =
          timetableDetailsSections[i].roomTime[j].split(":");
        const remainder = daysOfWeek.indexOf(day);
        const quotient = parseInt(hour) - 1;
        grid[
          isVertical ? remainder + quotient * 6 : quotient + remainder * 11
        ] = {
          id: timetableDetailsSections[i].id,
          courseId: timetableDetailsSections[i].courseId,
          room: room,
          code: code,
          type: timetableDetailsSections[i].type,
          number: timetableDetailsSections[i].number,
          instructors: timetableDetailsSections[i].instructors,
        };
      }
    }

    return grid;
  }, [isVertical, timetableDetailsSections]);

  return (
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
        //   <div className="mb-4 flex items-center justify-between w-full">
        //     <span className="text-slate-600">6 - 7PM</span>
        //     <span className="font-bold">11</span>
        //   </div>
        //   {/* <div className="mb-4 flex flex-col">
        // <span className="font-bold">12</span>
        // <span className="text-slate-600">7 - 8PM</span>
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
              isVertical ? "grid-rows-11" : "grid-cols-11 mb-[-1rem]"
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
                      isVertical ? "h-fit pl-3 pb-2 pt-1" : "pl-3 pb-2 pt-2"
                    }`}
                    onClick={(event) => handleUnitClick(e, event, true)}
                  >
                    <div className="flex h-full text-sm flex-col">
                      <span className="font-bold">
                        {e.code} {e.type}
                        {e.number}
                      </span>
                      <span className="text-slate-300">{e.room}</span>
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
                  isVertical ? "pl-3 pb-10 pt-3" : "pl-3 pt-20 pb-5"
                }`}
              ></div>
            )
          )}
          {/* {JSON.stringify(timetableDetails)} */}
        </div>
      </div>
    </div>
  );
}
