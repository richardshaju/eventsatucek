"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

import Card from "@/components/ui/card";
import Footer from "@/components/ui/Footer";
import Loading from "@/components/ui/Loading";
import CardGrid from "@/components/ui/CardGrid";
import { Navbar } from "@/components/ui/navbar";
import ShareButton from "@/components/ui/ShareButton";
import { RsvpDialog } from "@/components/dialog/rsvp-dialog";
import { SigninDialog } from "@/components/dialog/signin-dialog";
import { useAuthContext } from "@/components/context/auth";
import { getUserEventStatus } from "@/components/fb/db";

import { BsClock } from "react-icons/bs";
import { IoIosCloud } from "react-icons/io";
import { FaCalendarAlt } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import { IoShareSocialSharp } from "react-icons/io5";
import { IoCloudOfflineSharp } from "react-icons/io5";


import { getImgLink, getEvent, getMoreClubEvents } from "@/lib/data";
import { resolveClubIcon } from "@/lib/utils";
import { Event_User } from "@/lib/types";

import { InfoIcon, Loader2 } from "lucide-react";
import moment from "moment";
import NotFound from "@/app/not-found";
import { HashLoader } from "react-spinners";

function Page({ params }: { params: { id: string } }) {
  const { theme } = useTheme();

  const themeToDark = theme == "dark" ? false : true;
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const s = useSearchParams()
  const user = useAuthContext()
  const [open, setOpen] = useState(false);
  const [openSignin, setOpenSignin] = useState(false);
  const [moreEvents, setMoreEvents] = useState<string[][]>([]);

  const [date, setDate] = useState<any>();
  const [clubIcon, setClubIcon] = useState<any[]>();

  const handleClubIcon = async(d:string[])=>{
    
  }

  const createLinkElements = (text: string): (JSX.Element | string)[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
  
    return text.split(urlRegex).map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="underline text-slate-300 hover:no-underline">
            {part}
          </a>
        );
      } else {
        return part;
      }
    });
  };

  useEffect(() => {
    getEvent(params.id)
      .then((evnt) => {
        const d = evnt[0]

        setData(d);
        setDate(moment(d[7], "DD/MM/YYYY HH:mm:ss"))

        const clubList  = d[6].split(",")
        let logoList:any[] = []
        clubList.forEach(async (cl:string)=>{
          logoList.push(await resolveClubIcon(cl.trim(), themeToDark))
        })
        setClubIcon(logoList)

        if(s.has("rsvp")) setOpen(true)
      })
  }, []);

  
  useEffect(() => {
    if(!data[6]) return
    getMoreClubEvents(data[6] ? data[6] : "*", params.id)
    .then((upcomingEvents) => {
      setMoreEvents(upcomingEvents);
      setLoading(false);
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });
  }, [data]);


  function UserEventInteractionPanel(){

    const [userStatus, setUserStatus] = useState<Event_User['status'] | null>();
  
    useEffect(() =>{
      if(!data) return
      if(!user) {
        setUserStatus(null)
        return
      }
      if(data[12] == "No RSVP"){
        setUserStatus(null)
        return
      }
      
      getUserEventStatus(user, params.id).then((d)=>{
        if(d?.exists()){
          setUserStatus(d.data()?.status)
        }else setUserStatus(null)
      })
    },[])

    return <div className="flex items-center justify-center mt-5">
      {(()=>{
        switch (userStatus) {
          case "Attended":
            return <div className="border rounded-lg bg-success gap-3 flex flex-row p-3"><InfoIcon/> Wohooo! You have already attended this event.</div>
          case "Registered":
              return <div><div className="border rounded-lg bg-secondary gap-3 flex flex-row p-3"><InfoIcon/> You just RSVP&apos;d this event!</div><small className="text-muted-foreground flex justify-center mt-1">Check your mail for further info.</small></div>
          case "Missed":
              return <div className="border rounded-lg bg-destructive gap-3 flex flex-row p-3"><InfoIcon/>You missed this event.</div>
          case null:
            return (!date?.isBefore() && data[12] != "No RSVP") ? <button onClick={()=>{
              if(!user) {
                setOpenSignin(true)
                return
              }
              setOpen(true)
            }} 
              className="inline-flex hover:scale-105 transition-all scale-100 h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
              Register Now!
            </button>: 
            (data[12] != "No RSVP")?<div className="border rounded-lg bg-secondary gap-3 flex flex-row p-3"><InfoIcon/> This event is over.</div>:null
          default:
            return <HashLoader color={theme=="light"? undefined:"white"}/>
          }
      })()}
    </div>

      
  }


  if(!data) return <NotFound/>

  return data.length == 0 ? (
    <Loading msg="Loading..." />
  ) : (
    <div className="flex flex-col min-h-[50rem] dark:bg-[#0a0a0a]">
      <Navbar />
      <SigninDialog open={openSignin} setOpen={setOpenSignin}/>
      <RsvpDialog open={open} setOpen={setOpen} evnt={data}/>
      <div className=" mt-36 flex-1  justify-center px-5 md:px-20 mb-7">
        <div className="h-fit flex md:m-3 flex-col md:flex-row min:w-[22rem] md:w-auto overflow-hidden  shadow-lg rounded-xl dark:bg-[#0c0c0c] ">
          <div className="absolute group z-10 w-10 hover:w-24 flex p-2 m-3 bg-white rounded-full text-black  shadow-lg  transition-width duration-300 ease-in-out">
            <IoShareSocialSharp className="w-5 h-5 group-hover:fixed " />
            <div className="group-hover:flex  hidden ml-5  ">
              <ShareButton
                date={date?.format("dddd, Do MMM")}
                time={date?.format("h:mm a")}
                title={data[3]}
                location={data[10]}
                type={data[8]}
                about={data[4]}
              />
            </div>
          </div>
          <Image
            width={500}
            height={500}
            referrerPolicy={"no-referrer"}
            src={getImgLink(data[5])}
            alt="Event Poster"
          ></Image>

          <div className="p-9">
            <div className="flex flex-row gap-2">
             {clubIcon && clubIcon.length>1 && clubIcon.map((cl,i)=> <Image
                className="rounded-full w-8 md:w-10"
                key={`cIcon${i}`}
                referrerPolicy={"no-referrer"}
                src={cl}
                alt="Club Icon"
              ></Image>)}
            </div>
            <div className="flex justify-between items-center">
              <p className="flex flex-col mb-1"> 
                <span className="font-bold text-2xl md:text-3xl">{data[3]}</span>
                <small className="text-muted-foreground">{data[6]}</small>
              </p>
              {clubIcon && clubIcon.length==1 && <Image
                className="rounded-full w-12 md:w-20 absolute md:right-28 right-7"
                referrerPolicy={"no-referrer"}
                src={clubIcon[0]}
                alt="Club Icon"
              ></Image>}
            </div>
            <div className="text-sm md:text-[15px]">
              <p className="flex items-center mb-1 ">
                <FaCalendarAlt className="mr-2 text-sm md:text-[]" />
                {date?.format("dddd, Do MMM")} ({date?.calendar()})
              </p>
              <p className="flex items-center mb-1">
                <IoLocationSharp className="mr-2 text-sm md:text-[]" />{" "}
                {data[10] == "" ? "Will be Updated." : data[10]}
              </p>
              {data[8] == "Online" ? (
                <p className="flex items-center mb-1">
                  <IoIosCloud className="mr-2 text-sm md:text-[]" /> Online
                </p>
              ) : (
                <p className="flex items-center mb-1">
                  <IoCloudOfflineSharp className="mr-2 text-sm md:text-[]" />{" "}
                  Offline{" "}
                </p>
              )}
              <p className="flex items-center mb-1">
                {" "}
                <BsClock className="mr-2 text-sm md:text-[]" /> {date?.format("h:mm a")}
              </p>
              <h4 className="my-2 font-semibold">About</h4>
              <p className="whitespace-break-spaces">{createLinkElements(data[4])}</p>
            </div>


            <UserEventInteractionPanel/>

          </div>
        </div>
      </div>
      <div className="flex justify-center flex-col items-center ">
        {!loading ? (
          moreEvents.length > 0 ? (
            <>
              <h1 className="text-lg md:text-3xl font-semibold mt-10 mb-8 p-3">
                Upcoming Events from {data ? data[6] : null}
              </h1>
              <CardGrid>
                {moreEvents.map((evnt, i) => (
                  <Link key={evnt[1]} href={`/event/${evnt[1]}`}>
                    <Card
                      key={evnt[1]}
                      title={evnt[3]}
                      description={evnt[4]}
                      club={evnt[6]}
                      header={
                        <Image
                          width={500}
                          height={500}
                          referrerPolicy={"no-referrer"}
                          src={getImgLink(evnt[5])}
                          alt="Event Poster"
                          className="opacity-50 group-hover:opacity-100 transition duration-300 ease-in-out"
                        ></Image>
                      }
                      date={evnt[7]}
                      isOnline={evnt[8] == "Online" ? true : false}
                      venue={evnt[10]}
                    />
                  </Link>
                ))}
              </CardGrid>
            </>
          ) : null
        ) : (
          <div className="flex justify-center items-center p-5">
            {" "}
            <Loader2 size={30} className="animate-spin" />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Page;