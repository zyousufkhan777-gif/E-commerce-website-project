import React from 'react'
import Tapbar from '../Layout/Tapbar'
import Navbar from './Navbar'

const Header = () => {
  return (
    <header className=' border-b border-gray-200'>
    <Tapbar /> 
    <Navbar />
    </header>
  )
}

export default Header