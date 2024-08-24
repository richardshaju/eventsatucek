import React from "react";
import { resolveClubIcon } from "@/lib/utils";
import { IoLocationSharp } from "react-icons/io5";
import { IoIosCloud } from "react-icons/io";
import { IoCloudOfflineSharp } from "react-icons/io5";
import { BsClock } from "react-icons/bs";
import Image from "next/image";
import moment from "moment";
import { FaCalendarAlt } from "react-icons/fa";
import Link from "next/link";
import { Button } from "./button";

function Card({
  id,
  title,
  img,
  date,
  isOnline,
  venue,
  club,
}: {
  id?: string;
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  img?: React.ReactNode;
  date?: string;
  isOnline?: boolean;
  venue?: string;
  club: string;
}) {
  const dt = moment(date, "DD/MM/YYYY HH:mm:s");
  const clubIcon = resolveClubIcon(club, false);

  return (
    <div className="px-5 py-5 bg-[#0c0c0c] rounded-lg flex gap-7">
      <div>{img}</div>
      <div className="text-white text-left w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{title}</h1>
            <p className="text-base  mb-3">{club}</p>
          </div>
          <Image
            className="rounded-full w-14 sm:w-14 sm:h-14 md:w-16 md:h-16"
            src={clubIcon}
            alt={club + "logo"}
          />
        </div>
        <p className="flex items-center mb-1 text-sm md:text-base">
          <FaCalendarAlt className="mr-2" />
          {dt?.format("dddd, Do MMM YYYY")} ({dt?.fromNow()})
        </p>
        <p className="flex break-words items-center mb-1 text-sm md:text-base">
          <IoLocationSharp className="mr-2" />{" "}
          {venue == "" ? "Will be updated." : venue}
        </p>
        {isOnline ? (
          <p className="flex items-center mb-1 text-sm md:text-base">
            <IoIosCloud className="mr-2" /> Online
          </p>
        ) : (
          <p className="flex items-center mb-1 text-sm md:text-base">
            <IoCloudOfflineSharp className="mr-2" /> Offline{" "}
          </p>
        )}
        <p className="flex items-center mb-1 text-sm md:text-base">
          {" "}
          <BsClock className="mr-2" />
          {dt?.format("h:mm a")}
        </p>
        <div className="hidden md:flex flex-row gap-3 mt-3 items-center justify-center">
          <Link href={"/e/" + id}>
          <Button variant={"outline"}>View More</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Card;
