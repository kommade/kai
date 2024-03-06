import Image from "next/image";
import Link from "next/link";

const HomePage: React.FC = () => {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                <header className="fixed top-0 left-0 w-full h-[100px] bg-kai-blue text-white shadow z-[2024] bg-opacity-50">
                    <div className="w-full h-[100px] px-[20px] flex justify-between items-center">
                        <h1 className="w-fit ml-[30px]">KAI<br />studios</h1>
                        <nav className="flex justify-end items-center">
                            <ul className="flex gap-4 mr-[30px] font-['Breathing'] text-[12px] items-center">
                                <li className="group">
                                    <a href="#products">Our Products</a>
                                    <ul className="absolute hidden bg-kai-blue text-white shadow z-[2024] bg-opacity-50 mt-2 p-2 space-y-3 group-hover:block">
                                        <li><a>Earrings</a></li>
                                        <li><a>Necklaces</a></li>
                                        <li><a>Sets</a></li>
                                    </ul>
                                </li>
                                <li><a href="#about">About us</a></li>
                                <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width={32} height={32} version="1.0" viewBox="-4.8 -1.1 837.0 802.8" fill="white" zoomAndPan="magnify"><g id="__id174_s7c1xijv3h"><path d="M763.14,489.45c19.89-106.85,42.96-213.1,63.07-319.88c6.01-32.2-12.17-73.38-47.34-78.5 c-15.51-4.3-33.69,12.24-27.31,28.05c2,13.28,17.14,14.77,27.31,18.18c3.12,8.61,8.83,17.51,5.19,27.08 c-2.24,11.46-4.57,22.91-6.83,34.37H259.35c-10.24,0-18.55,8.3-18.55,18.55c0,10.25,8.31,18.55,18.55,18.55h510.5 c-13.85,69.5-27.86,138.99-41.51,208.56c-3.04,14.47-5.19,29.38-11.28,43.04c-10.91,4.23-23.08,2.08-34.43,2.67 c-134.67-0.37-269.35-0.07-403.94-0.15c-34.21-145.88-67.97-291.83-102.25-437.71c-4.38-27.53-27.9-52.9-57.13-51.87 C84.36,0.55,49.33-1.09,14.46,1.36c-19.22,6.6-19.22,35.02-0.37,42.22c36.8,3.49,73.98-0.96,110.78,2.15 c8.83,4.3,7.2,16.55,10.61,24.56c40.22,173.41,80.8,346.74,121.76,520.07c5.27,28.27,32.2,50.83,61.44,48.01 c143.8-0.22,287.6,0.52,431.32-0.37c27.45,0.89,27.6-44.45,0.15-43.78c-128.96-0.89-257.99-0.22-386.95-0.37 c-19.37-0.45-39.03,1.78-58.17-2.08c-8.53-18.03-10.83-38.21-15.95-57.28c138.61,0,277.21,0.07,415.82,0 C731.83,536.79,759.13,516.38,763.14,489.45z"/><path d="M334.56,654.77c-25.38,4.97-46.45,26.12-51.35,51.49c-8.31,34.95,16.62,73.09,52.09,79.1 c36.73,8.46,76.13-19.89,79.25-57.51C421.52,684.3,377.3,643.86,334.56,654.77z M366.76,732.16c-7.12,11.72-25.23,14.02-34.21,3.12 c-12.32-10.91-5.57-32.72,9.79-36.58C360.6,691.72,379.67,716.8,366.76,732.16z"/><path d="M661.71,654.62c-48.6,7.42-70.79,73.24-37.4,108.93c30.13,38.14,98.32,26.34,113.16-20.26 C757.05,696.91,710.6,642.3,661.71,654.62z M687.01,738.39c-22.78,17.73-49.34-22.71-24.26-36.8 C685.53,683.78,712.24,724.29,687.01,738.39z"/></g></svg>
                            </ul>
                        </nav>
                    </div>
                </header>
                <section className="h-[474.5px] bg-kai-blue relative">
                    <svg className="fill-[#f2f1eb] absolute top-0 left-0 z-[1001]" width={470} height={480} viewBox="30 30 470 480">
                        <path d="M263.99507085643864,54.92380365578147C228.71554734031628,107.04128157732593 232.9250359416718,151.44136372971863 193.13534606695418,175.09468063257341C112.95461080303964,222.90244403368249 30.76935715752721,177.29965085233107 5.512425549394126,259.2844526596837C-20.345861573218322,343.2737728486342 45.903470938591084,424.4567673033477 184.61614294516326,475.2713082768535C346.3807763401109,534.7052782912302 511.5530909837749,372.9406448962826 472.7656602998562,252.56931608133087C440.6933661942904,152.84452659683714 496.2185253645513,109.1460258780037 462.8432943109468,54.92380365578147C408.1199424933251,-33.77613472992401 301.7802423495584,-1.002259190798932 263.99507085643864,54.92380365578147Z"></path>
                    </svg>
                    <img className="absolute top-[180px] left-[120px] z-[1002]" src="images/logo.png"/>
                    <svg className="absolute left-[400px] top-[150px] scale-150" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="390" height="260" viewBox="0 0 390 200" fill="white">
                        <defs>
                            <clipPath id="headerClip">
                                <path d="M138.55220064208316,17.020119055131527C134.3397713775161,18.755767928309034 130.18979185199797,20.62643276076146 126.11339240981738,22.60422023513537C112.46470347023734,29.22654794927265 99.01082998879387,33.86998008800265 83.60504569907623,32.23783405332548C63.68026782863469,30.126943367580715 40.646246756246974,27.994809782950487 26.474512683744674,42.15939254632142C16.08005017651987,52.54872099975784 14.087864839146045,68.74656817579138 15.542209689876294,83.37116258146449C16.996452751569223,97.99576463893467 21.283272384510795,112.35697955815674 21.13104260023318,127.05295717595638C20.937129651424527,145.77962229956742 13.585262790952505,163.58554970236364 9.467488471117512,181.85492621661348C5.349612865652904,200.12430273086338 5.072134540376853,221.09877355470866 16.996151311037337,235.53932945432703C32.82137801908885,254.70455591738164 62.73607886002777,253.90364795638064 86.19739641703254,245.70141151593023C109.65881002422682,237.4990982554645 131.66628221162313,223.5755460929381 156.44934078842755,221.70366774587956C194.4740437106785,218.83153380014335 229.68529854753686,244.9216427518281 267.816926373164,244.5935244308261C316.0331157029295,244.17871386675725 356.09781198791256,197.25275263737984 356.9902667538127,149.04069578143904C357.8825986882336,100.82863902617976 325.66198631307094,55.931218130908995 283.344122733784,32.818163257504665C261.2057673629821,20.72671519951136 238.34935557552532,8.928348789876948 213.05623716678707,5.392613649502862C187.59054475831525,1.832813204621938 162.09717247735549,7.318749077306927 138.55220064208316,17.020119055131527Z"></path>
                            </clipPath>
                        </defs>
                        <image className="object-fill object-[50%_90%]" xlinkHref="images/header-image.webp" x="0" y="-130" height="465" width="390" clipPath="url(#headerClip)"/>
                    </svg>
                    <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 text-center">
                        <h3 className="text-white">SPREADING JOY WITH OUR ART</h3>
                        <Link href="../productpage">
                            <div className="bg-white text-black rounded px-4 py-2 mt-4">
                                <h3>SHOP NOW</h3>
                            </div>
                        </Link>
                    </div>
                </section>
                <section id="products" className="w-full h-[60vw] flex flex-col justify-start items-center pt-6">
                    <h2 className="text-center w-fit h-fit">OUR PRODUCTS</h2>
                    <h3 className="text-center w-fit h-fit my-2">JEWELLERY • HANDMADE • CONFIDENCE</h3>
                    <div className="w-[90%] h-[40vw] grid grid-cols-3 grid-rows-2 gap-5 my-4">
                        <div className="bg-white relative">
                            <Image className="absolute w-full h-full" src="https://via.placeholder.com/600x400" width={0} height={0} alt="placeholder" sizes="30vw" draggable={false}/>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-[60%] h-[30%] opacity-80 flex flex-col justify-center items-center">
                                <h3 className="text-center w-fit h-fit">OUR</h3>
                                <h3 className="text-center w-fit h-fit">EARRINGS</h3>
                            </div>
                        </div>
                        <div className="bg-white col-span-2 relative">
                            <Image className="w-full h-full absolute" src="https://via.placeholder.com/600x200" width={0} height={0} alt="placeholder" sizes="30vw" draggable={false}/>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-[60%] h-[30%] opacity-80 flex flex-col justify-center items-center">
                                <h3 className="text-center w-fit h-fit">OUR</h3>
                                <h3 className="text-center w-fit h-fit">NECKLACES</h3>
                            </div>
                        </div>
                        <div className="bg-white relative">
                            <Image className="absolute w-full h-full" src="https://via.placeholder.com/600x400" width={0} height={0} alt="placeholder" sizes="30vw" draggable={false}/>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-[60%] h-[30%] opacity-80 flex flex-col justify-center items-center">
                                <h3 className="text-center w-fit h-fit">OUR EARRING</h3>
                                <h3 className="text-center w-fit h-fit">AND NECKLACE SETS</h3>
                            </div>
                        </div>
                        <div className="bg-white relative">
                            <Image className="absolute w-full h-full" src="https://via.placeholder.com/600x400" width={0} height={0} alt="placeholder" sizes="30vw" draggable={false}/>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-[60%] h-[30%] opacity-80 flex flex-col justify-center items-center">
                                <h3 className="text-center w-fit h-fit">MOST</h3>
                                <h3 className="text-center w-fit h-fit">RECENT</h3>
                            </div>
                        </div>
                        <div className="bg-white relative">
                            <Image className="absolute w-full h-full" src="https://via.placeholder.com/600x400" width={0} height={0} alt="placeholder" sizes="30vw" draggable={false}/>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-[60%] h-[30%] opacity-80 flex flex-col justify-center items-center">
                                <h3 className="text-center w-fit h-fit">开始 (KĀI SHǏ)</h3>
                                <h3 className="text-center w-fit h-fit">COLLECTIONS</h3>
                            </div>
                        </div>
                    </div>
                </section>
                <section id="about" className="w-full h-[60vw] flex flex-col justify-start items-center pt-6 bg-[#d9d9d9]">
                    <h2 className="text-center w-fit h-fit mb-4">ABOUT US</h2>
                    <div className="w-[90%] h-[40vw] grid grid-cols-3 grid-rows-1 gap-2 my-4">
                        <div className="relative w-full h-full">
                            <Image className="h-[40vw] w-full object-cover" src={"/images/story.webp"} width={0} height={0} alt="story.webp" sizes="30vw" draggable={false}/>
                            <div className="z-10 absolute w-[13vw] h-[16vw] -right-[25%] -bottom-[2%] border shadow flex bg-[#f2f1eb] justify-center -rotate-[20deg]">
                                <Image
                                    className="h-full w-full object-cover p-[5%] pb-[30%]"
                                    src={"/images/kai.webp"}
                                    width={0}
                                    height={0}
                                    sizes={"15vw"}
                                    alt="kai.webp"
                                    draggable={false} />
                            </div>
                        </div>
                       <div className="relative w-full h-full">
                            <Image className="h-[40vw] w-full object-cover" src={"/images/logo.webp"} width={0} height={0} alt="logo.webp" sizes="30vw" draggable={false} />
                            <div className="z-10 absolute w-[13vw] h-[16vw] -right-[25%] -top-[5%] shadow flex bg-[#f2f1eb] justify-center rotate-[20deg]">
                                <Image
                                    className="h-full w-full object-cover p-[5%] pb-[30%]"
                                    src={"/images/rose.jpeg"}
                                    width={0}
                                    height={0}
                                    sizes={"15vw"}
                                    alt="rose.jpeg"
                                    draggable={false} />
                            </div>
                       </div>
                        <Image className="h-[40vw] w-full object-cover" src={"/images/products.webp"} width={0} height={0} alt="products.webp" sizes="30vw" draggable={false}/>
                    </div>
                </section>
                <footer className="w-full h-[60px] bg-kai-blue text-white">
                    <div className="w-full h-full py-2 px-4 flex justify-between items-center">
                        <div className="flex flex-col">
                            <h3 className="ml-[2vw] w-fit text-white">©2024 KAI Studios</h3>
                            <h3 className="ml-[2vw] w-fit text-white">Designed and built by Alyssa Png and Jarrell Khoo</h3>
                        </div>
                    </div>
                </footer>
            </div>
        </main>
    );
}

export default HomePage