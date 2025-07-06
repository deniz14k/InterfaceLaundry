"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Heading,
  useToast,
  useColorModeValue,
  Select,
  Alert,
  AlertIcon,
  Badge,
} from "@chakra-ui/react"
import { createSchedulingRequest } from "../services/schedulingService"
import TimeSlotPicker from "./TimeSlotPicker"

export default function SchedulingRequestForm({ orderId, customerPhone, customerName, onRequestCreated, onCancel }) {
  const [requestType, setRequestType] = useState("Pickup")
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [customDateTime, setCustomDateTime] = useState("")
  const [customerNotes, setCustomerNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")

  const toast = useToast()

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  // 🔍 DEBUG: Log what phone number we're getting
  useEffect(() => {
    const debugText = `Debug Info:
    - customerPhone prop: "${customerPhone}"
    - customerName prop: "${customerName}"
    - orderId: ${orderId}`

    setDebugInfo(debugText)
    console.log("SchedulingRequestForm Debug:", {
      customerPhone,
      customerName,
      orderId,
    })
  }, [customerPhone, customerName, orderId])

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot)
  }

  // Clean and validate phone number
  const cleanPhoneNumber = (phone) => {
    if (!phone) return ""
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, "")
    // Limit to 20 characters to match database constraint
    return cleaned.substring(0, 20)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedSlot && !customDateTime) {
      toast({
        status: "warning",
        title: "Please select a time slot or enter a custom time",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const cleanedPhone = cleanPhoneNumber(customerPhone)

      if (!cleanedPhone) {
        toast({
          status: "error",
          title: "Phone number is required",
          description: `No phone number provided. Debug: "${customerPhone}"`,
        })
        setIsSubmitting(false)
        return
      }

      const requestData = {
        orderId: orderId,
        timeSlotId: selectedSlot?.isCustom ? null : selectedSlot?.id,
        requestedDateTime: selectedSlot?.isCustom ? new Date(customDateTime).toISOString() : selectedSlot?.startTime,
        requestType: requestType,
        customerPhone: cleanedPhone,
        customerName: customerName || "Customer",
        customerNotes: customerNotes || null,
      }

      console.log("Submitting scheduling request:", requestData)

      const result = await createSchedulingRequest(requestData)

      toast({
        status: "success",
        title: "🎉 Scheduling request submitted!",
        description: "We'll confirm your time slot shortly via SMS",
        duration: 5000,
      })

      if (onRequestCreated) {
        onRequestCreated(result)
      }
    } catch (error) {
      console.error("Error creating scheduling request:", error)
      toast({
        status: "error",
        title: "Failed to submit request",
        description: error.message || "Please try again",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card bg={cardBg} shadow="xl" borderRadius="2xl">
      <CardBody p={8}>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <VStack spacing={2}>
              <HStack>
                <Text fontSize="3xl">📅</Text>
                <Heading size="lg" color={textColor}>
                  Schedule Your Service
                </Heading>
              </HStack>
              <Text color="gray.500" textAlign="center">
                Choose your preferred time for pickup or delivery
              </Text>
            </VStack>

            {/* 🔍 DEBUG INFO - Remove this after fixing */}
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              <Box>
                <Text fontSize="sm" fontWeight="bold">
                  Debug Info:
                </Text>
                <Text fontSize="xs" whiteSpace="pre-line">
                  {debugInfo}
                </Text>
              </Box>
            </Alert>

            {/* Request Type */}
            <FormControl isRequired>
              <FormLabel color={textColor} fontWeight="bold">
                Service Type
              </FormLabel>
              <Select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                size="lg"
                borderRadius="xl"
                bg="gray.50"
              >
                <option value="Pickup">🏠 Pickup from your location</option>
                <option value="Delivery">🚚 Delivery to your location</option>
              </Select>
            </FormControl>

            {/* Time Slot Selection */}
            <Box>
              <TimeSlotPicker
                onSlotSelect={handleSlotSelect}
                selectedSlot={selectedSlot}
                requestType={requestType}
                disabled={isSubmitting}
              />
            </Box>

            {/* Custom Time Input (shown when custom slot is selected) */}
            {selectedSlot?.isCustom && (
              <Card bg="blue.50" borderRadius="lg" borderWidth="2px" borderColor="blue.200">
                <CardBody p={4}>
                  <VStack spacing={4}>
                    <HStack>
                      <Text fontSize="lg">⏰</Text>
                      <Text fontWeight="bold" color="blue.700">
                        Custom Time Request
                      </Text>
                    </HStack>

                    <FormControl isRequired>
                      <FormLabel fontSize="sm" color="blue.600">
                        Preferred Date & Time
                      </FormLabel>
                      <Input
                        type="datetime-local"
                        value={customDateTime}
                        onChange={(e) => setCustomDateTime(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        size="lg"
                        borderRadius="lg"
                        bg="white"
                      />
                    </FormControl>

                    <Alert status="info" borderRadius="lg">
                      <AlertIcon />
                      <Text fontSize="sm">
                        Custom times are subject to availability and staff confirmation. We'll contact you within 2
                        hours to confirm.
                      </Text>
                    </Alert>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Selected Slot Summary */}
            {selectedSlot && !selectedSlot.isCustom && (
              <Card bg="green.50" borderRadius="lg" borderWidth="2px" borderColor="green.200">
                <CardBody p={4}>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" color="green.700">
                        Selected Time Slot
                      </Text>
                      <Text color="green.600">
                        {selectedSlot.displayDate} at {selectedSlot.displayTime}
                      </Text>
                    </VStack>
                    <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                      ✓ Confirmed
                    </Badge>
                  </HStack>
                </CardBody>
              </Card>
            )}

            {/* Customer Notes */}
            <FormControl>
              <FormLabel color={textColor} fontWeight="bold">
                Special Instructions (Optional)
              </FormLabel>
              <Textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Any special instructions for pickup/delivery (e.g., gate code, parking instructions, etc.)"
                size="lg"
                borderRadius="xl"
                bg="gray.50"
                rows={3}
              />
            </FormControl>

            {/* Customer Info Display */}
            <Card bg="gray.50" borderRadius="lg">
              <CardBody p={4}>
                <VStack spacing={2}>
                  <Text fontWeight="bold" color={textColor}>
                    Contact Information
                  </Text>
                  <HStack spacing={4}>
                    <Text color={cleanPhoneNumber(customerPhone) ? "green.600" : "red.600"}>
                      📞 {cleanPhoneNumber(customerPhone) || "❌ No phone provided"}
                    </Text>
                    <Text color="gray.600">👤 {customerName || "Customer"}</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    We'll send SMS updates to this number
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            {/* Submit Buttons */}
            <HStack spacing={4}>
              <Button
                type="submit"
                isLoading={isSubmitting}
                loadingText="Submitting Request..."
                colorScheme="blue"
                size="lg"
                borderRadius="full"
                bgGradient="linear(to-r, blue.400, blue.600)"
                _hover={{
                  bgGradient: "linear(to-r, blue.500, blue.700)",
                  transform: "translateY(-2px)",
                  shadow: "xl",
                }}
                transition="all 0.2s"
                py={6}
                fontSize="lg"
                fontWeight="bold"
                flex={1}
                leftIcon={<Text fontSize="xl">📅</Text>}
              >
                Submit Request
              </Button>

              <Button
                onClick={onCancel}
                variant="outline"
                colorScheme="gray"
                size="lg"
                borderRadius="full"
                py={6}
                fontSize="lg"
                fontWeight="bold"
                flex={1}
              >
                Cancel
              </Button>
            </HStack>
          </VStack>
        </form>
      </CardBody>
    </Card>
  )
}
