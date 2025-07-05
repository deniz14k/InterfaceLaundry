"use client"

import { useState, useContext } from "react"
import { AuthContext } from "../contexts/authContext"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import {
  Box,
  Input,
  Button,
  Heading,
  useToast,
  Card,
  CardBody,
  VStack,
  Text,
  useColorModeValue,
  Container,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Divider,
} from "@chakra-ui/react"

const API_BASE_URL = "https://localhost:7223"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useContext(AuthContext)
  const toast = useToast()
  const navigate = useNavigate()

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, purple.50, pink.50)",
    "linear(to-br, gray.900, purple.900, blue.900)",
  )
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast({ status: "warning", title: "Please fill in all fields" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/Account/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) throw new Error("Invalid credentials")
      const { token } = await res.json()

      // store token in context + localStorage
      login(token)

      // decode the token to inspect the role claim
      const decoded = jwtDecode(token)
      const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]

      toast({ status: "success", title: "🎉 Welcome back!", description: "Successfully signed in" })

      // redirect based on role
      if (role === "Customer") {
        navigate("/my-orders")
      } else {
        navigate("/")
      }
    } catch (err) {
      toast({ status: "error", title: "Login failed", description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center" p={4}>
      <Container maxW="md">
        <Card bg={cardBg} shadow="2xl" borderRadius="2xl" overflow="hidden">
          <Box h="4px" bgGradient="linear(to-r, blue.400, purple.400, pink.400)" />
          <CardBody p={10}>
            <VStack spacing={8}>
              {/* Header */}
              <VStack spacing={4} textAlign="center">
                <Box bg="blue.500" p={4} borderRadius="2xl" bgGradient="linear(to-r, blue.400, purple.500)" shadow="lg">
                  <Text fontSize="3xl" color="white">
                    🧺
                  </Text>
                </Box>
                <VStack spacing={2}>
                  <Heading size="xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                    Welcome Back
                  </Heading>
                  <Text color={textColor} fontSize="lg">
                    Sign in to your LaundrySystems account
                  </Text>
                </VStack>
              </VStack>

              {/* Login Form */}
              <Box w="full">
                <form onSubmit={handleSubmit}>
                  <VStack spacing={6}>
                    <FormControl>
                      <FormLabel color={textColor} fontWeight="bold">
                        📧 Email Address
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Text fontSize="lg">👤</Text>
                        </InputLeftElement>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          size="lg"
                          borderRadius="xl"
                          bg="gray.50"
                          border="2px solid"
                          borderColor="gray.200"
                          _focus={{
                            borderColor: "blue.400",
                            bg: "white",
                            shadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                          }}
                          _hover={{ borderColor: "gray.300" }}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textColor} fontWeight="bold">
                        🔒 Password
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Text fontSize="lg">🔑</Text>
                        </InputLeftElement>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          size="lg"
                          borderRadius="xl"
                          bg="gray.50"
                          border="2px solid"
                          borderColor="gray.200"
                          _focus={{
                            borderColor: "blue.400",
                            bg: "white",
                            shadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                          }}
                          _hover={{ borderColor: "gray.300" }}
                        />
                      </InputGroup>
                    </FormControl>

                    <Button
                      type="submit"
                      size="lg"
                      width="full"
                      bgGradient="linear(to-r, blue.400, purple.500)"
                      color="white"
                      _hover={{
                        bgGradient: "linear(to-r, blue.500, purple.600)",
                        transform: "translateY(-2px)",
                        shadow: "xl",
                      }}
                      _active={{
                        transform: "translateY(0)",
                      }}
                      transition="all 0.2s"
                      borderRadius="xl"
                      fontWeight="bold"
                      fontSize="lg"
                      py={6}
                      isLoading={loading}
                      loadingText="Signing in..."
                      leftIcon={<Text fontSize="lg">🚀</Text>}
                    >
                      Sign In
                    </Button>
                  </VStack>
                </form>
              </Box>

              <Divider />

              {/* Alternative Login */}
              <VStack spacing={4} w="full">
                <Text color="gray.500" fontSize="sm">
                  Alternative sign in methods
                </Text>
                <Button
                  variant="outline"
                  size="lg"
                  width="full"
                  onClick={() => navigate("/phone-login")}
                  borderRadius="xl"
                  borderWidth="2px"
                  _hover={{
                    bg: "blue.50",
                    borderColor: "blue.400",
                    transform: "translateY(-1px)",
                  }}
                  transition="all 0.2s"
                  leftIcon={<Text fontSize="lg">📱</Text>}
                >
                  Sign in with Phone OTP
                </Button>
              </VStack>

              {/* Footer */}
              <Text color="gray.500" fontSize="sm" textAlign="center">
                Don't have an account?{" "}
                <Text as="span" color="blue.500" fontWeight="bold" cursor="pointer">
                  Contact support
                </Text>
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}
