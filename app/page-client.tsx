"use client";

import FooterComponent from "@/components/FooterComponent";
import HeaderComponent from "@/components/HeaderComponent";
import Image from "next/image";
import Link from "next/link";

const HomePage = ({ covers }: { covers: string[] }) => {
    return (
        <main className="flex flex-col items-center justify-between min-h-screen">
            <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                <HeaderComponent/>
                <section className="mt-[80px] h-[474.5px] bg-kai-blue relative">
                    <svg className="fill-kai-white absolute top-0 left-0 z-[9]" width={470} height={480} viewBox="30 30 470 480">
                        <path d="M263.99507085643864,54.92380365578147C228.71554734031628,107.04128157732593 232.9250359416718,151.44136372971863 193.13534606695418,175.09468063257341C112.95461080303964,222.90244403368249 30.76935715752721,177.29965085233107 5.512425549394126,259.2844526596837C-20.345861573218322,343.2737728486342 45.903470938591084,424.4567673033477 184.61614294516326,475.2713082768535C346.3807763401109,534.7052782912302 511.5530909837749,372.9406448962826 472.7656602998562,252.56931608133087C440.6933661942904,152.84452659683714 496.2185253645513,109.1460258780037 462.8432943109468,54.92380365578147C408.1199424933251,-33.77613472992401 301.7802423495584,-1.002259190798932 263.99507085643864,54.92380365578147Z"></path>
                    </svg>
                    <Image className="absolute top-[180px] left-[120px] z-[9]" src="/images/logo.png" width={234} height={184} alt="logo.png"/>
                    <svg className="absolute left-[400px] top-[150px] scale-150" width="390" height="260" viewBox="0 0 390 200" fill="white">
                        <defs>
                            <clipPath id="headerClip">
                                <path d="M138.55220064208316,17.020119055131527C134.3397713775161,18.755767928309034 130.18979185199797,20.62643276076146 126.11339240981738,22.60422023513537C112.46470347023734,29.22654794927265 99.01082998879387,33.86998008800265 83.60504569907623,32.23783405332548C63.68026782863469,30.126943367580715 40.646246756246974,27.994809782950487 26.474512683744674,42.15939254632142C16.08005017651987,52.54872099975784 14.087864839146045,68.74656817579138 15.542209689876294,83.37116258146449C16.996452751569223,97.99576463893467 21.283272384510795,112.35697955815674 21.13104260023318,127.05295717595638C20.937129651424527,145.77962229956742 13.585262790952505,163.58554970236364 9.467488471117512,181.85492621661348C5.349612865652904,200.12430273086338 5.072134540376853,221.09877355470866 16.996151311037337,235.53932945432703C32.82137801908885,254.70455591738164 62.73607886002777,253.90364795638064 86.19739641703254,245.70141151593023C109.65881002422682,237.4990982554645 131.66628221162313,223.5755460929381 156.44934078842755,221.70366774587956C194.4740437106785,218.83153380014335 229.68529854753686,244.9216427518281 267.816926373164,244.5935244308261C316.0331157029295,244.17871386675725 356.09781198791256,197.25275263737984 356.9902667538127,149.04069578143904C357.8825986882336,100.82863902617976 325.66198631307094,55.931218130908995 283.344122733784,32.818163257504665C261.2057673629821,20.72671519951136 238.34935557552532,8.928348789876948 213.05623716678707,5.392613649502862C187.59054475831525,1.832813204621938 162.09717247735549,7.318749077306927 138.55220064208316,17.020119055131527Z"></path>
                            </clipPath>
                        </defs>
                        <image className="object-fill object-[50%_90%]" xlinkHref="images/header-image.webp" x="0" y="-130" height="465" width="390" clipPath="url(#headerClip)"/>
                    </svg>
                    <div className="absolute top-1/2 left-[85%] -translate-x-1/2 -translate-y-1/2 text-center">
                        <h3 className="text-white w-[200px]">SPREADING JOY THROUGH ART</h3>
                        <Link href="/products">
                            <div className="px-4 py-2 mt-4 rounded bg-kai-white text-kai-blue">
                                <h3>SHOP NOW</h3>
                            </div>
                        </Link>
                    </div>
                </section>
                <section id="products" className="w-full h-[60vw] flex flex-col justify-start items-center pt-6">
                    <h2 className="text-center w-fit h-fit">OUR PRODUCTS</h2>
                    <h3 className="my-2 text-center w-fit h-fit">JEWELLERY • HANDMADE • CONFIDENCE</h3>
                    <div className="w-[90%] h-[40vw] grid grid-cols-3 grid-rows-2 gap-5 my-4">
                        <div className="relative bg-kai-white">
                            <Link href={"/products?type=earrings"}>
                                <Image className="absolute object-cover w-full h-full" src={covers[0]} width={0} height={0} alt="placeholder" sizes="30vw" draggable={false}/>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-kai-white w-[60%] h-[30%] opacity-80 flex flex-col justify-center items-center">
                                    <h3 className="text-center w-fit h-fit">EARRINGS</h3>
                                </div>
                            </Link>
                        </div>
                        <div className="relative col-span-2 bg-kai-white">
                            <Link href={"/products?type=sets"}>
                                <Image className="absolute object-cover w-full h-full" src="https://via.placeholder.com/600x200" width={0} height={0} alt="placeholder" sizes="30vw" draggable={false}/>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-kai-white w-[60%] h-[30%] opacity-80 flex flex-col justify-center items-center">
                                    <h3 className="text-center w-fit h-fit">EARRING AND NECKLACE SETS</h3>
                                </div>
                            </Link>
                        </div>
                        <div className="relative bg-kai-white">
                            <Link href={"/products?type=necklaces"}>
                                <Image className="absolute object-cover w-full h-full" src="https://via.placeholder.com/600x400" width={0} height={0} alt="placeholder" sizes="30vw" draggable={false}/>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-kai-white w-[60%] h-[30%] opacity-80 flex flex-col justify-center items-center">
                                    <h3 className="text-center w-fit h-fit">NECKLACES</h3>
                                </div>
                            </Link>
                        </div>
                        <div className="relative bg-kai-white">
                            <Link href={"/products?collection=recent"}>
                                <Image className="absolute object-cover w-full h-full" src={covers[1]} width={0} height={0} alt="placeholder" sizes="30vw" draggable={false}/>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-kai-white w-[60%] h-[30%] opacity-80 flex flex-col justify-center items-center">
                                    <h3 className="text-center w-fit h-fit">RECENT ADDITION</h3>
                                </div>
                            </Link>
                        </div>
                        <div className="relative bg-kai-white">
                            <Image className="absolute object-cover w-full h-full" src="https://via.placeholder.com/600x400" width={0} height={0} alt="placeholder" sizes="30vw" draggable={false}/>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-kai-white w-[60%] h-[30%] opacity-80 flex flex-col justify-center items-center">
                                <h3 className="text-center w-fit h-fit">COLLECTIONS</h3>
                            </div>
                        </div>
                    </div>
                </section>
                <section id="about" className="w-full h-[60vw] flex flex-col justify-start items-center pt-6 bg-kai-grey">
                    <h2 className="mb-4 text-center w-fit h-fit">ABOUT US</h2>
                    <div className="w-[90%] h-[40vw] grid grid-cols-3 grid-rows-1 gap-2 my-4">
                        <div className="relative w-full h-full">
                            <Image className="h-[40vw] w-full object-cover" src={"/images/story.webp"} width={0} height={0} alt="story.webp" sizes="30vw" draggable={false}/>
                            <div className="z-10 absolute w-[13vw] h-[16vw] -right-[25%] -bottom-[2%] border shadow flex bg-kai-white justify-center -rotate-[20deg]">
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
                            <div className="z-10 absolute w-[13vw] h-[16vw] -right-[25%] -top-[5%] shadow flex bg-kai-white justify-center rotate-[20deg]">
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
                <FooterComponent/>
            </div>
        </main>
    );
}

export default HomePage