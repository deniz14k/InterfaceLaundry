"use client"

import { useState, useEffect } from "react"
import {
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Button,
  useColorModeValue,
  SimpleGrid,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  IconButton,
  Tooltip,
  Box,
  Divider,
} from "@chakra-ui/react"
import { getAvailableTimeSlots } from "../services/schedulingService"

export default function TimeSlotManager() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [timeSlots, setTimeSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  useEffect(() => {
    loadTimeSlots()
  }, [selectedDate])

  const loadTimeSlots = async () => {
    setLoading(true)
    setError("")

    try {
      const slots = await getAvailableTimeSlots(selectedDate, "Both")
      setTimeSlots(slots)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value)
    setSelectedDate(newDate)
  }

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot)
    setIsEditing(true)
    onOpen()
  }

  const handleCreateNew = () => {
    setSelectedSlot({
      id: null,
      startTime: "",
      endTime: "",
      maxOrders: 5,
      currentOrders: 0,
      isActive: true,
      slotType: "Both",
      description: "",
    })
    setIsEditing(false)
    onOpen()
  }

  const getSlotStatusColor = (slot) => {
    if (!slot.isActive) return "gray"
    if (slot.currentOrders >= slot.maxOrders) return "red"
    if (slot.currentOrders >= slot.maxOrders * 0.8) return "yellow"
    return "green"
  }

  const getSlotStatusText = (slot) => {
    if (!slot.isActive) return "Inactive"
    if (slot.currentOrders >= slot.maxOrders) return "Full"
    return `${slot.currentOrders}/${slot.maxOrders} booked`
  }

  // Generate next 30 days for date selection
  const getAvailableDates = () => {
    const dates = []
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  return (
    <>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Time Slot Management
            </Text>
            <Text fontSize="sm" color="gray.500">
              Manage availability and capacity for pickup/delivery slots
            </Text>
          </VStack>
          <Button
            leftIcon={<Text fontSize="lg">➕</Text>}
            colorScheme="blue"
            onClick={handleCreateNew}
            borderRadius="full"
          >
            Create Slot
          </Button>
        </HStack>

        {/* Date Selector */}
        <Card bg={cardBg} borderRadius="lg">
          <CardBody p={4}>
            <HStack spacing={4}>
              <FormControl maxW="300px">
                <FormLabel fontSize="sm" fontWeight="bold">
                  Select Date
                </FormLabel>
                <Select value={selectedDate.toISOString().split("T")[0]} onChange={handleDateChange} size="md">
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

              <Button leftIcon={<Text fontSize="lg">🔄</Text>} onClick={loadTimeSlots} variant="outline" size="md">
                Refresh
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Loading State */}
        {loading && (
          <Box textAlign="center" py={8}>
            <Spinner size="lg" color="blue.500" />
            <Text mt={4} color={textColor}>
              Loading time slots...
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
        {!loading && !error && (
          <VStack spacing={4} align="stretch">
            <Text fontWeight="bold" color={textColor}>
              Time Slots for {selectedDate.toLocaleDateString()}
            </Text>

            {timeSlots.length === 0 ? (
              <Card bg="gray.50" borderRadius="lg" borderWidth="2px" borderStyle="dashed">
                <CardBody p={8} textAlign="center">
                  <VStack spacing={3}>
                    <Text fontSize="4xl">📅</Text>
                    <Text fontSize="lg" color="gray.600" fontWeight="medium">
                      No time slots for this date
                    </Text>
                    <Text color="gray.500" fontSize="sm">
                      Click "Create Slot" to add new time slots
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {timeSlots.map((slot) => (
                  <Card
                    key={slot.id}
                    bg={cardBg}
                    borderWidth="2px"
                    borderColor={`${getSlotStatusColor(slot)}.200`}
                    borderRadius="lg"
                    cursor="pointer"
                    _hover={{
                      shadow: "md",
                      transform: "translateY(-2px)",
                      borderColor: `${getSlotStatusColor(slot)}.400`,
                    }}
                    transition="all 0.2s"
                    onClick={() => handleSlotClick(slot)}
                  >
                    <CardBody p={4}>
                      <VStack spacing={3}>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="bold" fontSize="lg" color={textColor}>
                            {slot.displayTime}
                          </Text>
                          <Badge colorScheme={getSlotStatusColor(slot)} px={2} py={1} borderRadius="full" fontSize="xs">
                            {getSlotStatusText(slot)}
                          </Badge>
                        </HStack>

                        <Divider />

                        <VStack spacing={2} w="full">
                          <HStack justify="space-between" w="full">
                            <Text fontSize="sm" color="gray.500">
                              Capacity:
                            </Text>
                            <Text fontSize="sm" fontWeight="medium">
                              {slot.currentOrders}/{slot.maxOrders}
                            </Text>
                          </HStack>

                          <HStack justify="space-between" w="full">
                            <Text fontSize="sm" color="gray.500">
                              Type:
                            </Text>
                            <Badge colorScheme="blue" px={2} py={1} borderRadius="full" fontSize="xs">
                              {slot.slotType}
                            </Badge>
                          </HStack>

                          {slot.description && (
                            <Box w="full">
                              <Text fontSize="sm" color="gray.500" mb={1}>
                                Description:
                              </Text>
                              <Text fontSize="sm" color={textColor}>
                                {slot.description}
                              </Text>
                            </Box>
                          )}
                        </VStack>

                        <HStack spacing={2} w="full">
                          <Button
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            flex={1}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSlotClick(slot)
                            }}
                          >
                            Edit
                          </Button>

                          <Tooltip label={slot.isActive ? "Disable Slot" : "Enable Slot"}>
                            <IconButton
                              size="sm"
                              colorScheme={slot.isActive ? "red" : "green"}
                              variant="outline"
                              icon={<Text fontSize="sm">{slot.isActive ? "🚫" : "✅"}</Text>}
                              onClick={(e) => {
                                e.stopPropagation()
                                // Handle enable/disable
                                toast({
                                  status: "info",
                                  title: "Feature coming soon",
                                  description: "Enable/disable functionality will be added",
                                })
                              }}
                            />
                          </Tooltip>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </VStack>
        )}
      </VStack>

      {/* Edit/Create Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? "Edit Time Slot" : "Create New Time Slot"}</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {selectedSlot && (
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Start Time</FormLabel>
                    <Input
                      type="time"
                      value={selectedSlot.startTime ? new Date(selectedSlot.startTime).toTimeString().slice(0, 5) : ""}
                      onChange={(e) => {
                        const date = new Date(selectedDate)
                        const [hours, minutes] = e.target.value.split(":")
                        date.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)
                        setSelectedSlot((prev) => ({ ...prev, startTime: date.toISOString() }))
                      }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>End Time</FormLabel>
                    <Input
                      type="time"
                      value={selectedSlot.endTime ? new Date(selectedSlot.endTime).toTimeString().slice(0, 5) : ""}
                      onChange={(e) => {
                        const date = new Date(selectedDate)
                        const [hours, minutes] = e.target.value.split(":")
                        date.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)
                        setSelectedSlot((prev) => ({ ...prev, endTime: date.toISOString() }))
                      }}
                    />
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={2} spacing={4}>
                  <FormControl>
                    <FormLabel>Max Orders</FormLabel>
                    <NumberInput
                      value={selectedSlot.maxOrders}
                      onChange={(valueString, valueNumber) =>
                        setSelectedSlot((prev) => ({ ...prev, maxOrders: valueNumber || 1 }))
                      }
                      min={1}
                      max={20}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Slot Type</FormLabel>
                    <Select
                      value={selectedSlot.slotType}
                      onChange={(e) => setSelectedSlot((prev) => ({ ...prev, slotType: e.target.value }))}
                    >
                      <option value="Both">Both (Pickup & Delivery)</option>
                      <option value="Pickup">Pickup Only</option>
                      <option value="Delivery">Delivery Only</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Description (Optional)</FormLabel>
                  <Input
                    value={selectedSlot.description || ""}
                    onChange={(e) => setSelectedSlot((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., Morning slot, Weekend special, etc."
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="active-switch" mb="0" flex={1}>
                    Active Slot
                  </FormLabel>
                  <Switch
                    id="active-switch"
                    colorScheme="green"
                    isChecked={selectedSlot.isActive}
                    onChange={(e) => setSelectedSlot((prev) => ({ ...prev, isActive: e.target.checked }))}
                  />
                </FormControl>

                {isEditing && (
                  <Alert status="info" borderRadius="lg">
                    <AlertIcon />
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="bold">
                        Current Bookings: {selectedSlot.currentOrders}
                      </Text>
                      <Text fontSize="xs">Be careful when reducing capacity below current bookings</Text>
                    </VStack>
                  </Alert>
                )}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => {
                // Handle save
                toast({
                  status: "info",
                  title: "Feature coming soon",
                  description: "Save functionality will be implemented",
                })
                onClose()
              }}
            >
              {isEditing ? "Update Slot" : "Create Slot"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
