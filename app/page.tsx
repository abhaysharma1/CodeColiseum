"use client";

import React from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import darkLogo from "@/public/icons/Black-Logo-Transparent.png";
import lightLogo from "@/public/icons/Light-Logo-Transparent.png";
import codingPage from "@/public/images/codingPage.png";
import codingList from "@/public/images/codingList.png";
import examsList from "@/public/images/examsList.png";
import codeExecution from "@/public/images/codeExecution.png";
import codeSubmission from "@/public/images/codeSubmission.png";

import AnimatedContent from "@/components/animatedContent";

import { Mirage } from "ldrs/react";
import "ldrs/react/Mirage.css"; //
import TiltedCard from "@/components/titledCard";
import GlassSurface from "@/components/GlassSurface";
import GradientText from "@/components/GradientText";
import { useAuth } from "@/context/authcontext";

import { MdArrowOutward } from "react-icons/md";

const navbar = [
  {
    name: "Home",
    link: "/",
  },
  {
    name: "Problems List",
    link: "/problemlist",
  },
  {
    name: "Features",
    link: "/about",
  },
  {
    name: "Contact Us",
    link: "/contactus",
  },
];

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center w-full h-screen justify-center">
        <Mirage size={60} speed={2.5} color="white" />
        <h1 className="ml-2 text-white text-xl">Loading Awesomeness</h1>
      </div>
    );
  }

  return (
    <div className="animate-fade animate-once animate-duration-1500 bg-[#18181B]">
      <AuroraBackground className="h-[90vh]">
        <div className=" h-full w-full  flex-col gap-4 px-4">
          <div className="w-full h-[90px] flex items-center justify-between animate-fade-down animate-once animate-duration-[400ms] animate-delay-400">
            <div>
              <Image
                src={theme === "light" ? darkLogo : lightLogo}
                alt="Logo"
                className="h-[90px] w-fit"
              />
            </div>
            <div>
              <GlassSurface
                width={550}
                height={60}
                borderRadius={30}
                displace={15}
                distortionScale={-150}
                redOffset={5}
                greenOffset={15}
                blueOffset={25}
                brightness={60}
                opacity={0}
                mixBlendMode="screen"
              >
                <div className="w-[550px] h-[60px] flex  items-center justify-between px-10 text-white">
                  {navbar.map((item, index) => (
                    <div key={index}>
                      <Link
                        href={item.link}
                        className={`hover:bg-background/20 py-3 px-5 rounded-3xl`}
                      >
                        {item.name}
                      </Link>
                    </div>
                  ))}
                </div>
              </GlassSurface>
            </div>

            <div className="mr-7 ">
              {user ? (
                <Button
                  className="rounded-2xl mr-2 text-foreground"
                  variant={"ghost"}
                  asChild
                >
                  <Link href={"/dashboard"}>Dashboard</Link>
                </Button>
              ) : (
                <div>
                  <Button className="rounded-2xl mr-2" asChild>
                    <Link href={"/signup"}>SignUp</Link>
                  </Button>
                  <Button
                    className="rounded-2xl text-white"
                    variant={"outline"}
                    asChild
                  >
                    <Link href={"/login"}>Login</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="w-full h-[calc(100vh-90px)] flex justify-center items-center flex-col pb-[90px]">
            <div className="text-3xl md:text-5xl font-bold dark:text-white text-center">
              Coding Platform with everything you need
            </div>
            <div className="font-extralight text-base md:text-3xl dark:text-neutral-200 py-4">
              and more
            </div>
            <Button
              className="bg-black dark:bg-white rounded-xl px-4 py-2"
              asChild
            >
              <Link href={"/problemlist"}>Problems</Link>
            </Button>
          </div>
        </div>
      </AuroraBackground>
      <div className="px-9 bg-[#18181B]">
        <AnimatedContent
          distance={30}
          direction="vertical"
          reverse={false}
          duration={0.6}
          ease="power2.out"
          initialOpacity={0.6}
          animateOpacity
          scale={1}
          threshold={0.2}
          delay={0.3}
        >
          <Image
            src={codingPage}
            alt="codingpage SS"
            className=" rounded-xl "
          />
        </AnimatedContent>
      </div>
      <div className="px-9 bg-[#18181B]">
        <h1 className="w-full flex justify-center text-4xl pt-6">
          <GradientText
            colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
            animationSpeed={3}
            showBorder={false}
          >
            Features
          </GradientText>
        </h1>
        <div className="w-full px-60 mt-10 ">
          <div className="flex justify-between w-full">
            <AnimatedContent
              distance={20}
              direction="horizontal"
              reverse={true}
              duration={0.8}
              ease="power2.out"
              initialOpacity={0.3}
              animateOpacity
              scale={1}
              threshold={0.2}
              delay={0.1}
              className="w-[calc(100%-480px)]"
            >
              <div className="flex flex-col justify-center h-[250px] ">
                <h1 className="text-xl">Vast Library</h1>
                <p className="mt-1 ml-3 text-sm">
                  Explore a growing collection of carefully designed challenges
                  across data structures, algorithms, and real-world scenarios.
                  Whether you’re practicing for interviews or building
                  fundamentals, you’ll always find the right problem at the
                  right difficulty.
                </p>
              </div>
            </AnimatedContent>

            <AnimatedContent
              distance={20}
              direction="horizontal"
              reverse={false}
              duration={0.8}
              ease="power2.out"
              initialOpacity={0.3}
              animateOpacity
              scale={1}
              threshold={0.2}
              delay={0.1}
            >
              <TiltedCard
                imageSrc={codingList.src}
                altText="CodingList"
                captionText="Vast Library"
                containerHeight="300px"
                containerWidth="300px"
                imageHeight="250px"
                imageWidth="480px"
                rotateAmplitude={12}
                scaleOnHover={1.2}
                showMobileWarning={false}
                showTooltip={true}
                displayOverlayContent={true}
              />
            </AnimatedContent>
          </div>

          <div className="flex justify-between w-full mt-10">
            <div>
              <AnimatedContent
                distance={20}
                direction="horizontal"
                reverse={true}
                duration={0.8}
                ease="power2.out"
                initialOpacity={0.3}
                animateOpacity
                scale={1}
                threshold={0.2}
                delay={0.1}
              >
                <TiltedCard
                  imageSrc={examsList.src}
                  altText="CodingList"
                  captionText="Create Exams"
                  containerHeight="300px"
                  containerWidth="300px"
                  imageHeight="250px"
                  imageWidth="480px"
                  rotateAmplitude={12}
                  scaleOnHover={1.2}
                  showMobileWarning={false}
                  showTooltip={true}
                  displayOverlayContent={true}
                />
              </AnimatedContent>
            </div>
            <AnimatedContent
              distance={20}
              direction="horizontal"
              reverse={false}
              duration={0.8}
              ease="power2.out"
              initialOpacity={0.3}
              animateOpacity
              scale={1}
              threshold={0.2}
              delay={0.1}
              className="w-[calc(100%-480px)]"
            >
              <div className="flex flex-col justify-center h-[250px] text-right">
                <h1 className="text-xl ">
                  Create & Take Coding Exams With Ease
                </h1>
                <p className="mt-1 mr-3">
                  Teachers can effortlessly build custom exams, and students can
                  take them in a smooth, distraction-free interface. Automatic
                  evaluation ensures fast grading and a clear understanding of
                  each submission.
                </p>
              </div>
            </AnimatedContent>
          </div>

          <div className="flex justify-between w-full">
            <AnimatedContent
              distance={20}
              direction="horizontal"
              reverse={true}
              duration={0.8}
              ease="power2.out"
              initialOpacity={0.3}
              animateOpacity
              scale={1}
              threshold={0.2}
              delay={0.1}
              className="w-[calc(100%-480px)]"
            >
              <div className="flex flex-col justify-center h-[250px] ">
                <h1 className="text-xl">Fast & Secure Code Execution</h1>
                <p className="mt-1 ml-3 text-sm">
                  Write and run code instantly with a high-performance sandbox.
                  No setup, no delays — just clean, reliable execution that
                  supports multiple languages.
                </p>
              </div>
            </AnimatedContent>
            <div>
              <AnimatedContent
                distance={20}
                direction="horizontal"
                reverse={false}
                duration={0.8}
                ease="power2.out"
                initialOpacity={0.3}
                animateOpacity
                scale={1}
                threshold={0.2}
                delay={0.1}
              >
                <TiltedCard
                  imageSrc={codeExecution.src}
                  altText="CodingList"
                  captionText="Run Instantly"
                  containerHeight="300px"
                  containerWidth="300px"
                  imageHeight="250px"
                  imageWidth="480px"
                  rotateAmplitude={12}
                  scaleOnHover={1.2}
                  showMobileWarning={false}
                  showTooltip={true}
                  displayOverlayContent={true}
                />
              </AnimatedContent>
            </div>
          </div>
          <div className="flex justify-between w-full mt-10">
            <div>
              <AnimatedContent
                distance={20}
                direction="horizontal"
                reverse={true}
                duration={0.8}
                ease="power2.out"
                initialOpacity={0.3}
                animateOpacity
                scale={1}
                threshold={0.2}
                delay={0.1}
              >
                <TiltedCard
                  imageSrc={codeSubmission.src}
                  altText="CodingList"
                  captionText="Track Performance"
                  containerHeight="300px"
                  containerWidth="300px"
                  imageHeight="250px"
                  imageWidth="480px"
                  rotateAmplitude={12}
                  scaleOnHover={1.2}
                  showMobileWarning={false}
                  showTooltip={true}
                  displayOverlayContent={true}
                />
              </AnimatedContent>
            </div>
            <AnimatedContent
              distance={20}
              direction="horizontal"
              reverse={false}
              duration={0.8}
              ease="power2.out"
              initialOpacity={0.3}
              animateOpacity
              scale={1}
              threshold={0.2}
              delay={0.1}
              className="w-[calc(100%-480px)]"
            >
              <div className="flex flex-col justify-center h-[250px] text-right ">
                <h1 className="text-xl ">
                  Track Your Progress & Improve Faster
                </h1>
                <p className="mt-1 mr-3">
                  Intuitive dashboards show what you’ve solved, your success
                  rate, weak areas, and overall improvement. Perfect for anyone
                  who wants to stay consistent and see real progress.
                </p>
              </div>
            </AnimatedContent>
          </div>
        </div>
      </div>

      <AnimatedContent
        distance={150}
        direction="vertical"
        reverse={false}
        duration={1.2}
        ease="power3.out"
        initialOpacity={0.2}
        animateOpacity
        scale={1.1}
        threshold={0.2}
        delay={0}
      >
        <div className="w-full flex h-[300px] bg-background mt-5">
          <div className="h-[300px] w-[60%] flex items-center opacity-80">
            <Image
              src={theme === "light" ? darkLogo : lightLogo}
              alt="Logo"
              className="h-[300px] w-fit"
            />
          </div>
          <div className="h-[300px] w-[40%] pt-20 px-10 text-foreground/80 flex flex-col gap-2 ">
            <h1>Made by @Abhay Sharma</h1>
            <div className="flex items-center gap-2 w-[160px]">
              <Link
                href={"https://www.github.com/abhaysharma1"}
                className="w-fit hover:underline underline-offset-1 flex items-center gap-1"
                target="_blank"
              >
                Github
                <MdArrowOutward />
              </Link>
              <hr className="bg-white/70 w-full"></hr>
            </div>
            <div className="flex items-center gap-2 w-[160px]">
              <Link
                href={"https://www.linkedin.com/in/abhay-sharma-63b821277/"}
                className="w-fit hover:underline underline-offset-1 flex items-center gap-1"
                target="_blank"
              >
                LinkedIn
                <MdArrowOutward />
              </Link>
              <hr className="bg-white/70 w-full"></hr>
            </div>
            <div className=" flex flex-col w-full h-full mb-4 justify-end">
              <h1 className="mb-3">
                The <span className="italic">starry heavens</span> above me and
                the <span className="italic">moral law</span> within me.
              </h1>
              <hr className="bg-white/70 w-full"></hr>
              <div className="w-full justify-end flex text-xs mt-1">
                ©Abhay Sharma 2025
              </div>
            </div>
          </div>
        </div>
      </AnimatedContent>
    </div>
  );
}
