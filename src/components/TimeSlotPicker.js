"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Badge,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Heading,
  Select,
  FormControl,
  FormLabel,
} from "@chakra-ui/react"
import { getAvailableTimeSlots } from "../services/schedulingService"

export default function TimeSlotPicker({
  onSlotSelect,
  selectedSlot,
  requestType = "Both",
  minDate = new Date(),
  disabled = false,
}) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [timeSlots, setTimeSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  // Load time slots when date changes
  useEffect(() => {
    loadTimeSlots()
  }, [selectedDate, requestType])

  const loadTimeSlots = async () => {
    setLoading(true)
    setError("")

    try {
      const slots = await getAvailableTimeSlots(selectedDate, requestType)
      setTimeSlots(slots)
    } catch (err) {
      setError(err.message)
      setTimeSlots([])
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value)
    setSelectedDate(newDate)
  }

  const handleSlotSelect = (slot) => {
    if (disabled || !slot.isAvailable) return
    onSlotSelect(slot)
  }

  const getSlotStatusColor = (slot) => {
    if (!slot.isAvailable) return "red"
    if (slot.availableSlots <= 2) return "yellow"
    return "green"
  }

  const getSlotStatusText = (slot) => {
    if (!slot.isAvailable) return "Full"
    if (slot.availableSlots === 1) return "1 spot left"
    return `${slot.availableSlots} spots available`
  }

  // Generate next 14 days for date selection
  const getAvailableDates = () => {
    const dates = []
    for (let i = 0; i < 14; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  return (
    <Card bg={cardBg} borderRadius="xl" shadow="md">
      <CardBody p={6}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack>
            <Text fontSize="2xl">📅</Text>
            <Heading size="md" color={textColor}>
              Select {requestType === "Both" ? "Pickup/Delivery" : requestType} Time
            </Heading>
          </HStack>

          {/* Date Selector */}
          <FormControl>
            <FormLabel color={textColor} fontWeight="bold">
              Choose Date
            </FormLabel>
            <Select
              value={selectedDate.toISOString().split("T")[0]}
              onChange={handleDateChange}
              size="lg"
              borderRadius="lg"
              bg="gray.50"
              disabled={disabled}
            >
              {getAvailableDates().map((date) => (
                <option key={date.toISOString()} value={date.toISOString().split("T")[0]}>
                  {date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Loading State */}
          {loading && (
            <Box textAlign="center" py={8}>
              <Spinner size="lg" color="blue.500" />
              <Text mt={4} color={textColor}>
                Loading available time slots...
              </Text>
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {/* Time Slots Grid */}
          {!loading && !error && timeSlots.length > 0 && (
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold" color={textColor}>
                Available Time Slots for {selectedDate.toLocaleDateString()}
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                {timeSlots.map((slot) => (
                  <Card
                    key={slot.id}
                    bg={selectedSlot?.id === slot.id ? "blue.50" : "white"}
                    borderWidth="2px"
                    borderColor={selectedSlot?.id === slot.id ? "blue.400" : slot.isAvailable ? "gray.200" : "red.200"}
                    cursor={disabled || !slot.isAvailable ? "not-allowed" : "pointer"}
                    opacity={disabled || !slot.isAvailable ? 0.6 : 1}
                    _hover={
                      !disabled && slot.isAvailable
                        ? {
                            borderColor: "blue.300",
                            shadow: "md",
                            transform: "translateY(-2px)",
                          }
                        : {}
                    }
                    transition="all 0.2s"
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <CardBody p={4}>
                      <VStack spacing={2}>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="bold" fontSize="lg" color={textColor}>
                            {slot.displayTime}
                          </Text>
                          {selectedSlot?.id === slot.id && (
                            <Badge colorScheme="blue" px={2} py={1} borderRadius="full">
                              ✓ Selected
                            </Badge>
                          )}
                        </HStack>

                        <Badge colorScheme={getSlotStatusColor(slot)} px={2} py={1} borderRadius="full" fontSize="xs">
                          {getSlotStatusText(slot)}
                        </Badge>

                        {slot.description && (
                          <Text fontSize="sm" color="gray.500" textAlign="center">
                            {slot.description}
                          </Text>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </VStack>
          )}

          {/* No Slots Available */}
          {!loading && !error && timeSlots.length === 0 && (
            <Card bg="gray.50" borderRadius="lg" borderWidth="2px" borderStyle="dashed">
              <CardBody p={8} textAlign="center">
                <VStack spacing={3}>
                  <Text fontSize="4xl">📅</Text>
                  <Text fontSize="lg" color="gray.600" fontWeight="medium">
                    No time slots available
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Please select a different date or contact us for custom scheduling
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Custom Time Request Option */}
          <Card bg="blue.50" borderRadius="lg" borderWidth="2px" borderColor="blue.200">
            <CardBody p={4}>
              <VStack spacing={3}>
                <HStack>
                  <Text fontSize="lg">💡</Text>
                  <Text fontWeight="bold" color="blue.700">
                    Need a different time?
                  </Text>
                </HStack>
                <Text fontSize="sm" color="blue.600" textAlign="center">
                  Don't see a suitable time slot? You can request a custom time and we'll do our best to accommodate
                  you.
                </Text>
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => onSlotSelect({ isCustom: true, requestedDate: selectedDate })}
                  disabled={disabled}
                >
                  Request Custom Time
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </CardBody>
    </Card>
  )
}
