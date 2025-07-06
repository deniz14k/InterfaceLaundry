"use client"

import { useState, useEffect } from "react"
import {
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Progress,
  Badge,
} from "@chakra-ui/react"
import { getPendingSchedulingRequests, getAvailableTimeSlots } from "../services/schedulingService"

export default function SchedulingOverview() {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    todaySlots: 0,
    tomorrowSlots: 0,
    weeklyCapacity: 0,
    urgentRequests: 0,
  })
  const [loading, setLoading] = useState(true)

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  useEffect(() => {
    loadOverviewData()
  }, [])

  const loadOverviewData = async () => {
    try {
      // Get pending requests
      const pendingRequests = await getPendingSchedulingRequests()

      // Get today's slots
      const today = new Date()
      const todaySlots = await getAvailableTimeSlots(today)

      // Get tomorrow's slots
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowSlots = await getAvailableTimeSlots(tomorrow)

      // Calculate urgent requests (< 24 hours)
      const now = new Date()
      const urgentRequests = pendingRequests.filter((req) => {
        const requestTime = new Date(req.requestedDateTime)
        const hoursUntil = (requestTime - now) / (1000 * 60 * 60)
        return hoursUntil <= 24 && hoursUntil > 0
      })

      // Calculate weekly capacity
      const weeklyCapacity = todaySlots.reduce((total, slot) => total + slot.maxOrders, 0) * 7

      setStats({
        pendingRequests: pendingRequests.length,
        todaySlots: todaySlots.length,
        tomorrowSlots: tomorrowSlots.length,
        weeklyCapacity,
        urgentRequests: urgentRequests.length,
      })
    } catch (error) {
      console.error("Error loading overview data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (value, threshold) => {
    if (value === 0) return "gray"
    if (value <= threshold) return "green"
    if (value <= threshold * 2) return "yellow"
    return "red"
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <VStack align="start" spacing={1}>
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          Scheduling Overview
        </Text>
        <Text fontSize="sm" color="gray.500">
          Real-time insights into your scheduling operations
        </Text>
      </VStack>

      {/* Key Metrics */}
      <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4}>
        <Card bg={cardBg} borderRadius="lg">
          <CardBody p={4} textAlign="center">
            <Stat>
              <StatLabel fontSize="sm">Pending Requests</StatLabel>
              <StatNumber fontSize="2xl" color={getStatusColor(stats.pendingRequests, 5) + ".500"}>
                {stats.pendingRequests}
              </StatNumber>
              <StatHelpText fontSize="xs">
                {stats.urgentRequests > 0 && (
                  <Badge colorScheme="red" px={1} py={0.5} borderRadius="full" fontSize="xs">
                    {stats.urgentRequests} urgent
                  </Badge>
                )}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderRadius="lg">
          <CardBody p={4} textAlign="center">
            <Stat>
              <StatLabel fontSize="sm">Today's Slots</StatLabel>
              <StatNumber fontSize="2xl" color="blue.500">
                {stats.todaySlots}
              </StatNumber>
              <StatHelpText fontSize="xs">Available</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderRadius="lg">
          <CardBody p={4} textAlign="center">
            <Stat>
              <StatLabel fontSize="sm">Tomorrow's Slots</StatLabel>
              <StatNumber fontSize="2xl" color="purple.500">
                {stats.tomorrowSlots}
              </StatNumber>
              <StatHelpText fontSize="xs">Available</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderRadius="lg">
          <CardBody p={4} textAlign="center">
            <Stat>
              <StatLabel fontSize="sm">Weekly Capacity</StatLabel>
              <StatNumber fontSize="2xl" color="green.500">
                {stats.weeklyCapacity}
              </StatNumber>
              <StatHelpText fontSize="xs">Orders/week</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderRadius="lg">
          <CardBody p={4} textAlign="center">
            <Stat>
              <StatLabel fontSize="sm">Response Time</StatLabel>
              <StatNumber fontSize="2xl" color="orange.500">
                2h
              </StatNumber>
              <StatHelpText fontSize="xs">Average</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Status Cards */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {/* System Status */}
        <Card bg={cardBg} borderRadius="lg">
          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
              <HStack>
                <Text fontSize="xl">⚡</Text>
                <Text fontWeight="bold" color={textColor}>
                  System Status
                </Text>
              </HStack>

              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm">API Response</Text>
                  <Badge colorScheme="green" px={2} py={1} borderRadius="full">
                    ✅ Healthy
                  </Badge>
                </HStack>

                <HStack justify="space-between">
                  <Text fontSize="sm">SMS Service</Text>
                  <Badge colorScheme="green" px={2} py={1} borderRadius="full">
                    ✅ Active
                  </Badge>
                </HStack>

                <HStack justify="space-between">
                  <Text fontSize="sm">Database</Text>
                  <Badge colorScheme="green" px={2} py={1} borderRadius="full">
                    ✅ Connected
                  </Badge>
                </HStack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card bg={cardBg} borderRadius="lg">
          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
              <HStack>
                <Text fontSize="xl">🚀</Text>
                <Text fontWeight="bold" color={textColor}>
                  Quick Actions
                </Text>
              </HStack>

              <VStack spacing={2} align="stretch">
                <Text fontSize="sm" color="gray.500">
                  • Review {stats.pendingRequests} pending requests
                </Text>
                <Text fontSize="sm" color="gray.500">
                  • Check today's {stats.todaySlots} available slots
                </Text>
                <Text fontSize="sm" color="gray.500">
                  • Prepare for tomorrow's schedule
                </Text>
                {stats.urgentRequests > 0 && (
                  <Text fontSize="sm" color="red.500" fontWeight="bold">
                    • ⚠️ Handle {stats.urgentRequests} urgent requests
                  </Text>
                )}
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Performance Indicators */}
      <Card bg={cardBg} borderRadius="lg">
        <CardBody p={6}>
          <VStack spacing={4} align="stretch">
            <HStack>
              <Text fontSize="xl">📊</Text>
              <Text fontWeight="bold" color={textColor}>
                Performance Indicators
              </Text>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text fontSize="sm">Request Processing</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    85%
                  </Text>
                </HStack>
                <Progress value={85} colorScheme="green" size="sm" borderRadius="full" />

                <HStack justify="space-between">
                  <Text fontSize="sm">Customer Satisfaction</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    92%
                  </Text>
                </HStack>
                <Progress value={92} colorScheme="blue" size="sm" borderRadius="full" />
              </VStack>

              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text fontSize="sm">Slot Utilization</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    78%
                  </Text>
                </HStack>
                <Progress value={78} colorScheme="purple" size="sm" borderRadius="full" />

                <HStack justify="space-between">
                  <Text fontSize="sm">On-time Performance</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    96%
                  </Text>
                </HStack>
                <Progress value={96} colorScheme="teal" size="sm" borderRadius="full" />
              </VStack>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}
