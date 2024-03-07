import React from 'react'

const FooterComponent = () => {
  return (
    <footer className="w-full h-[60px] bg-kai-blue text-white">
        <div className="w-full h-full py-2 px-4 flex justify-between items-center">
            <div className="flex flex-col">
                <h3 className="ml-[2vw] w-fit text-white">©2024 KAI Studios</h3>
                <h3 className="ml-[2vw] w-fit text-white">Designed and built by Alyssa Png and Jarrell Khoo</h3>
            </div>
        </div>
    </footer>
  )
}

export default FooterComponent