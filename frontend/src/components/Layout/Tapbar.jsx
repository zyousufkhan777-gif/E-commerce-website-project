import React from 'react'
import { TbBrandMeta } from "react-icons/tb";
import { IoLogoInstagram } from "react-icons/io5";
import { RiTwitterXFill } from "react-icons/ri";

const Tapbar = () => {
  return (
    <div className='bg-[#e73010] text-white'>
    <div className='container mx-auto flex justify-between items-center py-3 px-4'>
      <div className='hidden md:flex items-center space-x-4'>
        <a href="#" className='hover:text-gray-300'>
        <TbBrandMeta className="h-6 w-6 " />
        </a>
      
      <a href="#" className='hover:text-gray-300'>
      <IoLogoInstagram className="h-6 w-6 " />
        </a>
        <a href="#" className='hover:text-gray-300'>
        <RiTwitterXFill  className="h-5 w-5 " />
        </a> 
        </div>

        <div className="text-sm text-center flex-grow">
          <span>we ship world wide - fast and reliable shipping!</span>
        </div>

        <div className="text-sm hidden md:block ">
          <a href="tel:+1234567890" className='hover:text-gray-300'>
            +1 (234) 567-890
          </a>
        </div>
    </div>
    </div >
  )
}

export default Tapbar