"use client"

import {
  Flex,
  Spacer,
  Button,
  Text,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Badge,
  useColorModeValue,
  Box,
  Tooltip,
} from "@chakra-ui/react"
import { useContext } from "react"
import { AuthContext } from "../contexts/authContext"
import { useNavigate } from "react-router-dom"

export default function TopBar() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-r, blue.600, purple.600, pink.500)",
    "linear(to-r, blue.800, purple.800, pink.700)",
  )
  const textColor = "white"
  const hoverBg = useColorModeValue("whiteAlpha.200", "whiteAlpha.300")

  const getRoleColor = (role) => {
    switch (role) {
      case "Customer":
        return "green"
      case "Admin":
        return "red"
      case "Staff":
        return "blue"
      default:
        return "gray"
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case "Customer":
        return "👤"
      case "Admin":
        return "👑"
      case "Staff":
        return "👔"
      default:
        return "🔒"
    }
  }

  return (
    <Box
      bgGradient={bgGradient}
      color={textColor}
      px={6}
      py={4}
      shadow="lg"
      position="sticky"
      top={0}
      zIndex={1000}
      backdropFilter="blur(10px)"
    >
      <Flex align="center" maxW="8xl" mx="auto">
        {/* App Logo & Title */}
        <HStack
          spacing={3}
          cursor="pointer"
          onClick={() => navigate("/")}
          _hover={{
            transform: "scale(1.05)",
            transition: "all 0.2s",
          }}
          transition="all 0.2s"
        >
          <Box
            bg="whiteAlpha.200"
            p={2}
            borderRadius="xl"
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor="whiteAlpha.300"
          >
            <Text fontSize="2xl">🧺</Text>
          </Box>
          <Box>
            <Text fontSize="xl" fontWeight="bold" letterSpacing="tight">
              LaundrySystems
            </Text>
          </Box>
        </HStack>

        {/* User Greeting */}
        {user?.role === "Customer" && (
          <Box ml={8}>
            <Text fontSize="sm" opacity={0.8}>
              Welcome back,
            </Text>
            <Text fontWeight="bold" fontSize="lg">
              {user.name}! ✨
            </Text>
          </Box>
        )}

        {/* Navigation Links */}
        <HStack spacing={2} ml={8}>
          {/* Guest Links */}
          {!user && (
            <Tooltip label="Quick Phone Login" hasArrow>
              <Button
                leftIcon={<Text fontSize="lg">📱</Text>}
                size="md"
                variant="ghost"
                color={textColor}
                _hover={{ bg: hoverBg, transform: "translateY(-1px)" }}
                transition="all 0.2s"
                borderRadius="xl"
                fontWeight="medium"
                onClick={() => navigate("/phone-login")}
              >
                Phone OTP
              </Button>
            </Tooltip>
          )}

          {/* Customer Links */}
          {user?.role === "Customer" && (
            <>
              <Tooltip label="Create New Order" hasArrow>
                <Button
                  leftIcon={<Text fontSize="lg">➕</Text>}
                  size="md"
                  variant="ghost"
                  color={textColor}
                  _hover={{ bg: hoverBg, transform: "translateY(-1px)" }}
                  transition="all 0.2s"
                  borderRadius="xl"
                  fontWeight="medium"
                  onClick={() => navigate("/create-order")}
                >
                  New Order
                </Button>
              </Tooltip>
              <Tooltip label="View My Orders" hasArrow>
                <Button
                  leftIcon={<Text fontSize="lg">📋</Text>}
                  size="md"
                  variant="ghost"
                  color={textColor}
                  _hover={{ bg: hoverBg, transform: "translateY(-1px)" }}
                  transition="all 0.2s"
                  borderRadius="xl"
                  fontWeight="medium"
                  onClick={() => navigate("/my-orders")}
                >
                  My Orders
                </Button>
              </Tooltip>
            </>
          )}

          {/* Staff Links */}
          {user && user.role !== "Customer" && (
            <>
              <Tooltip label="Manage All Orders" hasArrow>
                <Button
                  leftIcon={<Text fontSize="lg">🛍️</Text>}
                  size="md"
                  variant="ghost"
                  color={textColor}
                  _hover={{ bg: hoverBg, transform: "translateY(-1px)" }}
                  transition="all 0.2s"
                  borderRadius="xl"
                  fontWeight="medium"
                  onClick={() => navigate("/")}
                >
                  Orders
                </Button>
              </Tooltip>
              <Tooltip label="Delivery Routes" hasArrow>
                <Button
                  leftIcon={<Text fontSize="lg">🚚</Text>}
                  size="md"
                  variant="ghost"
                  color={textColor}
                  _hover={{ bg: hoverBg, transform: "translateY(-1px)" }}
                  transition="all 0.2s"
                  borderRadius="xl"
                  fontWeight="medium"
                  onClick={() => navigate("/routes")}
                >
                  Routes
                </Button>
              </Tooltip>
              <Tooltip label="Route Planning Tools" hasArrow>
                <Button
                  leftIcon={<Text fontSize="lg">🛠️</Text>}
                  size="md"
                  variant="ghost"
                  color={textColor}
                  _hover={{ bg: hoverBg, transform: "translateY(-1px)" }}
                  transition="all 0.2s"
                  borderRadius="xl"
                  fontWeight="medium"
                  onClick={() => navigate("/routes/manual")}
                >
                  Route Planner
                </Button>
              </Tooltip>
            </>
          )}
        </HStack>

        <Spacer />

        {/* User Profile & Auth */}
        {user ? (
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              _hover={{ bg: hoverBg, transform: "translateY(-1px)" }}
              transition="all 0.2s"
              borderRadius="xl"
              p={2}
            >
              <HStack spacing={3}>
                <Avatar
                  size="sm"
                  name={user.name || user.email}
                  bg={`${getRoleColor(user.role)}.500`}
                  color="white"
                  fontSize="sm"
                  fontWeight="bold"
                />
                <Box textAlign="left">
                  <HStack spacing={2}>
                    <Text fontSize="sm" fontWeight="bold">
                      {user.name || "User"}
                    </Text>
                    <Badge
                      colorScheme={getRoleColor(user.role)}
                      size="sm"
                      borderRadius="full"
                      px={2}
                      py={1}
                      fontSize="xs"
                    >
                      {getRoleIcon(user.role)} {user.role}
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" opacity={0.8}>
                    {user.email}
                  </Text>
                </Box>
                <Text fontSize="sm" opacity={0.6}>
                  ▼
                </Text>
              </HStack>
            </MenuButton>
            <MenuList bg="white" color="gray.800" border="none" shadow="xl" borderRadius="xl" p={2} minW="200px">
              <MenuDivider />
              <MenuItem
                icon={<Text fontSize="lg">🚪</Text>}
                borderRadius="lg"
                _hover={{ bg: "red.50", color: "red.600" }}
                fontWeight="medium"
                onClick={() => {
                  logout()
                  navigate("/login")
                }}
              >
                Sign Out
              </MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <Button
            leftIcon={<Text fontSize="lg">🔐</Text>}
            colorScheme="whiteAlpha"
            variant="solid"
            size="md"
            onClick={() => navigate("/login")}
            _hover={{
              transform: "translateY(-2px)",
              shadow: "lg",
            }}
            transition="all 0.2s"
            borderRadius="xl"
            fontWeight="bold"
            bg="whiteAlpha.200"
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor="whiteAlpha.300"
          >
            Sign In
          </Button>
        )}
      </Flex>
    </Box>
  )
}
