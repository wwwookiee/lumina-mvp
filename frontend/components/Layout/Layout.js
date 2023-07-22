"use client"

import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import LumiBalance from '../LumiBalance/LumiBalance'

import { Flex } from '@chakra-ui/react'

const Layout = ({ children }) => {
  return (
    <Flex widh="100%">
      <Flex direction="column" width="100%">
          <Header />
              <Flex direction="column" p="2rem">
                  {children}
              </Flex>
          <Footer />
      </Flex>
    </Flex>
  )
}

export default Layout