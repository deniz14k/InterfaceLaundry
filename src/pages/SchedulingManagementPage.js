"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Badge,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
} from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { getPendingSchedulingRequests } from "../services/schedulingService"
import PendingRequestsManager from "../components/PendingRequestsManager"
import TimeSlotManager from "../components/TimeSlotManager"
import SchedulingOverview from "../components/SchedulingOverview"

export default function SchedulingManagementPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState(0)

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, purple.50, pink.50)",
    "linear(to-br, gray.900, purple.900, blue.900)",
  )
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  useEffect(() => {
    loadPendingRequests()
    // Refresh every 30 seconds
    const interval = setInterval(loadPendingRequests, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadPendingRequests = async () => {
    try {
      const requests = await getPendingSchedulingRequests()
      setPendingRequests(requests)
      setError("")
    } catch (err) {
      setError(err.message)
      console.error("Error loading pending requests:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestProcessed = (processedRequest) => {
    // Remove the processed request from pending list
    setPendingRequests((prev) => prev.filter((req) => req.id !== processedRequest.id))

    toast({
      status: "success",
      title: `Request ${processedRequest.status === "Confirmed" ? "approved" : "rejected"}`,
      description: `Scheduling request #${processedRequest.id} has been ${processedRequest.status.toLowerCase()}`,
    })
  }

  const getUrgentRequests = () => {
    const now = new Date()
    const urgent = pendingRequests.filter((req) => {
      const requestTime = new Date(req.requestedDateTime)
      const hoursUntil = (requestTime - now) / (1000 * 60 * 60)
      return hoursUntil <= 24 && hoursUntil > 0
    })
    return urgent
  }

  const getOverdueRequests = () => {
    const now = new Date()
    return pendingRequests.filter((req) => {
      const createdTime = new Date(req.createdAt)
      const hoursOld = (now - createdTime) / (1000 * 60 * 60)
      return hoursOld > 2 // Requests older than 2 hours
    })
  }

  if (loading) {
    return (
      <Box minH="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" />
          <Text fontSize="lg" fontWeight="medium" color={textColor}>
            Loading scheduling management...
          </Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="7xl" py={8}>
        {/* Header Section */}
        <Card mb={8} bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
          <Box h="4px" bgGradient="linear(to-r, blue.400, purple.400, pink.400)" />
          <CardBody p={8}>
            <VStack spacing={6}>
              <HStack>
                <Text fontSize="3xl">📅</Text>
                <Heading size="xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                  Scheduling Management
                </Heading>
              </HStack>
              <Text color={textColor} fontSize="lg" textAlign="center">
                Manage customer scheduling requests and time slots
              </Text>
              <Button
                leftIcon={<Text fontSize="xl">←</Text>}
                onClick={() => navigate("/")}
                colorScheme="blue"
                variant="ghost"
                size="lg"
                _hover={{ transform: "translateX(-4px)", transition: "all 0.2s" }}
                borderRadius="full"
                px={6}
              >
                Back to Dashboard
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <Card mb={6} bg={cardBg} shadow="xl" borderRadius="2xl">
          <CardBody p={6}>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
              <Stat textAlign="center">
                <StatLabel color={textColor}>Pending Requests</StatLabel>
                <StatNumber fontSize="3xl" color="yellow.500">
                  {pendingRequests.length}
                </StatNumber>
              </Stat>

              <Stat textAlign="center">
                <StatLabel color={textColor}>Urgent (&lt; 24h)</StatLabel>
                <StatNumber fontSize="3xl" color="red.500">
                  {getUrgentRequests().length}
                </StatNumber>
              </Stat>

              <Stat textAlign="center">
                <StatLabel color={textColor}>Overdue (&gt; 2h)</StatLabel>
                <StatNumber fontSize="3xl" color="orange.500">
                  {getOverdueRequests().length}
                </StatNumber>
              </Stat>

              <Stat textAlign="center">
                <StatLabel color={textColor}>Auto-refresh</StatLabel>
                <StatNumber fontSize="lg" color="green.500">
                  <HStack justify="center">
                    <Text>🔄</Text>
                    <Text>30s</Text>
                  </HStack>
                </StatNumber>
              </Stat>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert status="error" borderRadius="lg" mb={6}>
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">Failed to load scheduling data</Text>
              <Text fontSize="sm">{error}</Text>
            </VStack>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Card bg={cardBg} shadow="xl" borderRadius="2xl">
          <CardBody p={8}>
            <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed" colorScheme="blue">
              <TabList mb={6}>
                <Tab fontWeight="bold" fontSize="lg">
                  <HStack>
                    <Text>⏳</Text>
                    <Text>Pending Requests</Text>
                    {pendingRequests.length > 0 && (
                      <Badge colorScheme="yellow" borderRadius="full" px={2}>
                        {pendingRequests.length}
                      </Badge>
                    )}
                  </HStack>
                </Tab>

                <Tab fontWeight="bold" fontSize="lg">
                  <HStack>
                    <Text>📊</Text>
                    <Text>Overview</Text>
                  </HStack>
                </Tab>

                <Tab fontWeight="bold" fontSize="lg">
                  <HStack>
                    <Text>⚙️</Text>
                    <Text>Time Slots</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* Pending Requests Tab */}
                <TabPanel p={0}>
                  <PendingRequestsManager
                    requests={pendingRequests}
                    onRequestProcessed={handleRequestProcessed}
                    onRefresh={loadPendingRequests}
                  />
                </TabPanel>

                {/* Overview Tab */}
                <TabPanel p={0}>
                  <SchedulingOverview />
                </TabPanel>

                {/* Time Slots Management Tab */}
                <TabPanel p={0}>
                  <TimeSlotManager />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}
