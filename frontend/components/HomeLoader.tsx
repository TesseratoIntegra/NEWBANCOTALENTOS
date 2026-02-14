'use client'
import { useState } from "react"
import Image from "next/image";

export default function HomeLoader() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <style global jsx>{`
        @keyframes pulse-scale {
          0% {
            transform: scale(0);
          }
          100% {
            transform: scale(5);
          }
        }

        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes scaled {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.5);
          }
        }

        .pulse-scale {
          animation: pulse-scale 2s infinite ease-in-out;
        }

        .ani-scale {
          animation: scaled 5s ease-in-out;
        }

        .pulse-scale-element {
          animation: pulse-scale 9s infinite ease-in-out;
        }
      `}</style>

      <div className="w-full h-screen bg-white dark:bg-black flex justify-center place-items-center ani-scale">
        <div>
          <div className="w-56 h-56 absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 z-40">
            <Image
              className="w-full h-full hidden dark:inline"
              src='/img/base-overlay-dark.png'
              width={1000}
              height={1000}
              alt=''
              onLoad={() => setLoaded(true)}
            />
            <Image
              className="w-full h-full dark:hidden inline"
              src='/img/base-overlay-light.png'
              width={1000}
              height={1000}
              alt=''
              onLoad={() => setLoaded(true)}
            />
          </div>

          {loaded && (
            <>
              <div className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 w-52 h-52 max-w-52 max-h-52 z-30 overflow-hidden">
                <div className="w-52 h-52 z-20 bg-radial from-indigo-700 dark:from-indigo-500 from-70% to-white dark:to-black pulse-scale rounded-full flex justify-center place-items-center">
                  <div className="w-32 h-32 z-20 bg-radial from-white dark:from-black from-0% to-blue-700 dark:to-blue-500 pulse-scale rounded-full">
                  </div>
                </div>
              </div>
              <div className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 w-52 h-52 max-w-52 max-h-52 z-20 overflow-hidden bg-white dark:bg-black">
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
