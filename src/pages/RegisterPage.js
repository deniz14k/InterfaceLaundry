"use client"

import { useState, useContext } from "react"
import {
  Box,
  Input,
  Button,
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Card,
  CardBody,
  VStack,
  Text,
  useColorModeValue,
  Container,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Progress,
  HStack,
  Divider,
} from "@chakra-ui/react"
import { AuthContext } from "../contexts/authContext"
import { useNavigate } from "react-router-dom"

const API_BASE_URL = "https://localhost:7223"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, purple.50, pink.50)",
    "linear(to-br, gray.900, purple.900, blue.900)",
  )
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  const passwordsMatch = password === confirm || confirm === ""
  const passwordStrength = getPasswordStrength(password)

  function getPasswordStrength(pwd) {
    let score = 0
    if (pwd.length >= 8) score += 25
    if (/[A-Z]/.test(pwd)) score += 25
    if (/[0-9]/.test(pwd)) score += 25
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25
    return score
  }

  const getStrengthColor = (strength) => {
    if (strength < 25) return "red"
    if (strength < 50) return "orange"
    if (strength < 75) return "yellow"
    return "green"
  }

  const getStrengthText = (strength) => {
    if (strength < 25) return "Weak"
    if (strength < 50) return "Fair"
    if (strength < 75) return "Good"
    return "Strong"
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!passwordsMatch) {
      toast({ status: "warning", title: "Passwords do not match" })
      return
    }
    if (passwordStrength < 50) {
      toast({ status: "warning", title: "Please choose a stronger password" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/Account/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          confirmPassword: confirm,
        }),
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "Registration failed")
      }

      const { token } = await res.json()
      login(token)
      toast({
        status: "success",
        title: "🎉 Welcome to LaundryPro!",
        description: "Your account has been created successfully",
      })
      navigate("/")
    } catch (err) {
      toast({ status: "error", title: "Registration failed", description: err.message })
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
                <Box
                  bg="purple.500"
                  p={4}
                  borderRadius="2xl"
                  bgGradient="linear(to-r, purple.400, pink.500)"
                  shadow="lg"
                >
                  <Text fontSize="3xl" color="white">
                    ✨
                  </Text>
                </Box>
                <VStack spacing={2}>
                  <Heading size="xl" bgGradient="linear(to-r, purple.400, pink.500)" bgClip="text">
                    Join LaundryPro
                  </Heading>
                  <Text color={textColor} fontSize="lg">
                    Create your account and start your premium laundry experience
                  </Text>
                </VStack>
              </VStack>

              {/* Registration Form */}
              <Box w="full">
                <form onSubmit={handleSubmit}>
                  <VStack spacing={6}>
                    <FormControl isRequired>
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
                            borderColor: "purple.400",
                            bg: "white",
                            shadow: "0 0 0 1px var(--chakra-colors-purple-400)",
                          }}
                          _hover={{ borderColor: "gray.300" }}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color={textColor} fontWeight="bold">
                        🔒 Password
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Text fontSize="lg">🔑</Text>
                        </InputLeftElement>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          size="lg"
                          borderRadius="xl"
                          bg="gray.50"
                          border="2px solid"
                          borderColor="gray.200"
                          _focus={{
                            borderColor: "purple.400",
                            bg: "white",
                            shadow: "0 0 0 1px var(--chakra-colors-purple-400)",
                          }}
                          _hover={{ borderColor: "gray.300" }}
                        />
                        <InputRightElement width="4.5rem" h="full">
                          <Button h="1.75rem" size="sm" onClick={() => setShowPassword(!showPassword)} variant="ghost">
                            {showPassword ? "👁️" : "🙈"}
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                      {password && (
                        <Box mt={2}>
                          <HStack justify="space-between" mb={1}>
                            <Text fontSize="xs" color="gray.500">
                              Password Strength
                            </Text>
                            <Text fontSize="xs" color={`${getStrengthColor(passwordStrength)}.500`} fontWeight="bold">
                              {getStrengthText(passwordStrength)}
                            </Text>
                          </HStack>
                          <Progress
                            value={passwordStrength}
                            colorScheme={getStrengthColor(passwordStrength)}
                            size="sm"
                            borderRadius="full"
                          />
                        </Box>
                      )}
                    </FormControl>

                    <FormControl isRequired isInvalid={!passwordsMatch}>
                      <FormLabel color={textColor} fontWeight="bold">
                        🔒 Confirm Password
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Text fontSize="lg">✅</Text>
                        </InputLeftElement>
                        <Input
                          type="password"
                          placeholder="Confirm your password"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          size="lg"
                          borderRadius="xl"
                          bg="gray.50"
                          border="2px solid"
                          borderColor={!passwordsMatch ? "red.300" : "gray.200"}
                          _focus={{
                            borderColor: !passwordsMatch ? "red.400" : "purple.400",
                            bg: "white",
                            shadow: !passwordsMatch
                              ? "0 0 0 1px var(--chakra-colors-red-400)"
                              : "0 0 0 1px var(--chakra-colors-purple-400)",
                          }}
                          _hover={{ borderColor: !passwordsMatch ? "red.300" : "gray.300" }}
                        />
                      </InputGroup>
                      {!passwordsMatch && (
                        <FormErrorMessage>
                          <Text fontSize="sm">🚫 Passwords do not match</Text>
                        </FormErrorMessage>
                      )}
                    </FormControl>

                    <Button
                      type="submit"
                      size="lg"
                      width="full"
                      bgGradient="linear(to-r, purple.400, pink.500)"
                      color="white"
                      _hover={{
                        bgGradient: "linear(to-r, purple.500, pink.600)",
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
                      loadingText="Creating account..."
                      leftIcon={<Text fontSize="lg">🚀</Text>}
                      isDisabled={!passwordsMatch || passwordStrength < 50}
                    >
                      Create Account
                    </Button>
                  </VStack>
                </form>
              </Box>

              <Divider />

              {/* Sign In Link */}
              <VStack spacing={4} w="full">
                <Text color="gray.500" fontSize="sm">
                  Already have an account?
                </Text>
                <Button
                  variant="outline"
                  size="lg"
                  width="full"
                  onClick={() => navigate("/login")}
                  borderRadius="xl"
                  borderWidth="2px"
                  _hover={{
                    bg: "purple.50",
                    borderColor: "purple.400",
                    transform: "translateY(-1px)",
                  }}
                  transition="all 0.2s"
                  leftIcon={<Text fontSize="lg">🔐</Text>}
                >
                  Sign In Instead
                </Button>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}
