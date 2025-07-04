"use client"

import { useLocation, useNavigate } from "react-router-dom"
import { useState, useContext, useEffect } from "react"
import { AuthContext } from "../contexts/authContext"
import { verifyOtp } from "../services/otpService"
import {
  Box,
  Heading,
  Input,
  Button,
  FormControl,
  FormLabel,
  Text,
  useToast,
  Card,
  CardBody,
  VStack,
  HStack,
  useColorModeValue,
  Container,
  InputGroup,
  InputLeftElement,
  PinInput,
  PinInputField,
  Divider,
} from "@chakra-ui/react"

export default function CodeVerifyPage() {
  const { state } = useLocation()
  const phone = state?.phone
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const toast = useToast()

  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const nameKey = `otp_name_${phone}`
  const savedName = localStorage.getItem(nameKey) || ""
  const [name, setName] = useState(savedName)
  const needsName = !savedName

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, purple.50, pink.50)",
    "linear(to-br, gray.900, purple.900, blue.900)",
  )
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  useEffect(() => {
    if (!phone) {
      navigate("/phone-login")
    }
  }, [phone, navigate])

  const handleVerify = async () => {
    if (needsName && !name.trim()) {
      toast({ status: "warning", title: "Please enter your name" })
      return
    }
    if (code.length !== 6) {
      toast({ status: "warning", title: "Please enter the complete 6-digit code" })
      return
    }

    setLoading(true)
    try {
      const { token } = await verifyOtp(phone, code, name)
      if (needsName) localStorage.setItem(nameKey, name)
      login(token)
      toast({
        status: "success",
        title: `🎉 Welcome, ${name}!`,
        description: "Successfully verified and signed in",
      })
      navigate("/my-orders")
    } catch (err) {
      toast({ status: "error", title: "Verification failed", description: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (!phone) return null

  return (
    <Box minH="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center" p={4}>
      <Container maxW="md">
        <Card bg={cardBg} shadow="2xl" borderRadius="2xl" overflow="hidden">
          <Box h="4px" bgGradient="linear(to-r, blue.400, purple.400, pink.400)" />
          <CardBody p={10}>
            <VStack spacing={8}>
              {/* Header */}
              <VStack spacing={4} textAlign="center">
                <Box bg="blue.500" p={4} borderRadius="2xl" bgGradient="linear(to-r, blue.400, cyan.500)" shadow="lg">
                  <Text fontSize="3xl" color="white">
                    🔐
                  </Text>
                </Box>
                <VStack spacing={2}>
                  <Heading size="xl" bgGradient="linear(to-r, blue.400, cyan.500)" bgClip="text">
                    Verify Your Code
                  </Heading>
                  <Text color={textColor} fontSize="lg" textAlign="center">
                    Enter the 6-digit code sent to
                  </Text>
                  <Text fontWeight="bold" color="blue.500" fontSize="lg">
                    {phone}
                  </Text>
                </VStack>
              </VStack>

              {/* Verification Form */}
              <Box w="full">
                <VStack spacing={6}>
                  <FormControl>
                    <FormLabel color={textColor} fontWeight="bold" textAlign="center" fontSize="lg">
                      🔢 Verification Code
                    </FormLabel>
                    <HStack justify="center" spacing={2}>
                      <PinInput
                        value={code}
                        onChange={setCode}
                        size="lg"
                        focusBorderColor="blue.400"
                        errorBorderColor="red.400"
                      >
                        <PinInputField
                          borderRadius="xl"
                          bg="gray.50"
                          border="2px solid"
                          borderColor="gray.200"
                          _hover={{ borderColor: "gray.300" }}
                          fontSize="xl"
                          fontWeight="bold"
                          textAlign="center"
                        />
                        <PinInputField
                          borderRadius="xl"
                          bg="gray.50"
                          border="2px solid"
                          borderColor="gray.200"
                          _hover={{ borderColor: "gray.300" }}
                          fontSize="xl"
                          fontWeight="bold"
                          textAlign="center"
                        />
                        <PinInputField
                          borderRadius="xl"
                          bg="gray.50"
                          border="2px solid"
                          borderColor="gray.200"
                          _hover={{ borderColor: "gray.300" }}
                          fontSize="xl"
                          fontWeight="bold"
                          textAlign="center"
                        />
                        <PinInputField
                          borderRadius="xl"
                          bg="gray.50"
                          border="2px solid"
                          borderColor="gray.200"
                          _hover={{ borderColor: "gray.300" }}
                          fontSize="xl"
                          fontWeight="bold"
                          textAlign="center"
                        />
                        <PinInputField
                          borderRadius="xl"
                          bg="gray.50"
                          border="2px solid"
                          borderColor="gray.200"
                          _hover={{ borderColor: "gray.300" }}
                          fontSize="xl"
                          fontWeight="bold"
                          textAlign="center"
                        />
                        <PinInputField
                          borderRadius="xl"
                          bg="gray.50"
                          border="2px solid"
                          borderColor="gray.200"
                          _hover={{ borderColor: "gray.300" }}
                          fontSize="xl"
                          fontWeight="bold"
                          textAlign="center"
                        />
                      </PinInput>
                    </HStack>
                    <Text fontSize="sm" color="gray.500" textAlign="center" mt={2}>
                      Check your SMS messages for the code
                    </Text>
                  </FormControl>

                  {needsName ? (
                    <FormControl>
                      <FormLabel color={textColor} fontWeight="bold">
                        👤 Your Name
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Text fontSize="lg">✨</Text>
                        </InputLeftElement>
                        <Input
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
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
                  ) : (
                    <Box bg="green.50" p={4} borderRadius="xl" w="full">
                      <HStack spacing={3} justify="center">
                        <Text fontSize="lg">👋</Text>
                        <Text fontWeight="bold" color="green.700">
                          Welcome back, {savedName}!
                        </Text>
                      </HStack>
                    </Box>
                  )}

                  <Button
                    size="lg"
                    width="full"
                    bgGradient="linear(to-r, blue.400, cyan.500)"
                    color="white"
                    _hover={{
                      bgGradient: "linear(to-r, blue.500, cyan.600)",
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
                    onClick={handleVerify}
                    isLoading={loading}
                    loadingText="Verifying..."
                    leftIcon={<Text fontSize="lg">🚀</Text>}
                    isDisabled={code.length !== 6 || (needsName && !name.trim())}
                  >
                    Verify & Sign In
                  </Button>
                </VStack>
              </Box>

              <Divider />

              {/* Resend Options */}
              <VStack spacing={4} w="full">
                <Text color="gray.500" fontSize="sm">
                  Didn't receive the code?
                </Text>
                <HStack spacing={4}>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => navigate("/phone-login")}
                    borderRadius="xl"
                    _hover={{
                      bg: "blue.50",
                      borderColor: "blue.400",
                      transform: "translateY(-1px)",
                    }}
                    transition="all 0.2s"
                    leftIcon={<Text fontSize="sm">📱</Text>}
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => navigate("/login")}
                    borderRadius="xl"
                    _hover={{
                      bg: "purple.50",
                      borderColor: "purple.400",
                      transform: "translateY(-1px)",
                    }}
                    transition="all 0.2s"
                    leftIcon={<Text fontSize="sm">📧</Text>}
                  >
                    Use Email
                  </Button>
                </HStack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}
