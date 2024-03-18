"use client";

import React from 'react'
import { Button } from "./ui/button"
import Link from "next/link"

const FooterComponent = () => {
  return (
    <footer className="w-full h-[60px] bg-kai-blue text-white">
        <div className="w-full h-full py-2 px-4 flex justify-between items-center">
            <div className="flex flex-col">
                <h3 className="ml-[2vw] w-fit text-white">©2024 KAI Studios</h3>
                <h3 className="ml-[2vw] w-fit text-white">Designed and built by Alyssa Png and <Button variant={"link"} className="p-0 text-white h-[16px]"><Link href={"https://github.com/kommade"} target="_blank" rel="noreferrer noopener"><h3 className="text-white">Jarrell Khoo</h3></Link></Button></h3>
            </div>
        </div>
    </footer>
  )
}

export default FooterComponent