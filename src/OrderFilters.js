"use client"

import { useState } from "react"
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  HStack,
  VStack,
  Card,
  CardBody,
  Heading,
  Text,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Badge,
  IconButton,
  Tooltip,
  Flex,
  Divider,
} from "@chakra-ui/react"

function OrderFilters({ onFilter }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [status, setStatus] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")
  const inputBg = useColorModeValue("gray.50", "gray.700")

  const handleSubmit = (e) => {
    e.preventDefault()
    onFilter({ searchTerm, status, fromDate, toDate })
  }

  const handleClear = () => {
    setSearchTerm("")
    setStatus("")
    setFromDate("")
    setToDate("")
    onFilter({ searchTerm: "", status: "", fromDate: "", toDate: "" })
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "yellow"
      case "ready":
        return "blue"
      case "completed":
        return "green"
      case "cancelled":
        return "red"
      default:
        return "gray"
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "⏳"
      case "ready":
        return "📦"
      case "completed":
        return "✅"
      case "cancelled":
        return "❌"
      default:
        return "📋"
    }
  }

  const hasActiveFilters = searchTerm || status || fromDate || toDate

  return (
    <Card bg={cardBg} shadow="lg" borderRadius="xl" overflow="hidden">
      <CardBody p={6}>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6}>
            {/* Header */}
            <Flex justify="space-between" align="center" w="full">
              <HStack>
                <Text fontSize="xl">🔍</Text>
                <Heading size="md" color={textColor}>
                  Search & Filter Orders
                </Heading>
              </HStack>
              {hasActiveFilters && (
                <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="sm">
                  {[searchTerm, status, fromDate, toDate].filter(Boolean).length} active filter
                  {[searchTerm, status, fromDate, toDate].filter(Boolean).length !== 1 ? "s" : ""}
                </Badge>
              )}
            </Flex>

            {/* Search and Status Row */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
              <FormControl>
                <FormLabel color={textColor} fontWeight="bold" fontSize="sm">
                  🔎 Search Orders
                </FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Text fontSize="lg">🔍</Text>
                  </InputLeftElement>
                  <Input
                    type="text"
                    placeholder="Search by Order ID or Phone Number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="lg"
                    borderRadius="lg"
                    bg={inputBg}
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
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Enter order ID (e.g., "123") or phone number
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="bold" fontSize="sm">
                  📊 Order Status
                </FormLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  size="lg"
                  borderRadius="lg"
                  bg={inputBg}
                  border="2px solid"
                  borderColor="gray.200"
                  _focus={{
                    borderColor: "blue.400",
                    bg: "white",
                  }}
                  _hover={{ borderColor: "gray.300" }}
                  placeholder="All Statuses"
                >
                  <option value="">🌟 All Statuses</option>
                  <option value="Pending">⏳ Pending</option>
                  <option value="Ready">📦 Ready</option>
                  <option value="Completed">✅ Completed</option>
                  <option value="Cancelled">❌ Cancelled</option>
                </Select>
                {status && (
                  <HStack mt={2}>
                    <Text fontSize="xs" color="gray.500">
                      Filtering by:
                    </Text>
                    <Badge colorScheme={getStatusColor(status)} px={2} py={1} borderRadius="full" fontSize="xs">
                      {getStatusIcon(status)} {status}
                    </Badge>
                  </HStack>
                )}
              </FormControl>
            </SimpleGrid>

            {/* Date Range Row */}
            <Box w="full">
              <FormLabel color={textColor} fontWeight="bold" fontSize="sm" mb={3}>
                📅 Date Range Filter
              </FormLabel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl>
                  <FormLabel color="gray.600" fontSize="xs" fontWeight="medium">
                    From Date
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Text fontSize="sm">📅</Text>
                    </InputLeftElement>
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      size="lg"
                      borderRadius="lg"
                      bg={inputBg}
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: "blue.400",
                        bg: "white",
                      }}
                      _hover={{ borderColor: "gray.300" }}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.600" fontSize="xs" fontWeight="medium">
                    To Date
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Text fontSize="sm">📅</Text>
                    </InputLeftElement>
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      size="lg"
                      borderRadius="lg"
                      bg={inputBg}
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: "blue.400",
                        bg: "white",
                      }}
                      _hover={{ borderColor: "gray.300" }}
                    />
                  </InputGroup>
                </FormControl>
              </SimpleGrid>
              {(fromDate || toDate) && (
                <Box mt={2} p={3} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                  <HStack spacing={2}>
                    <Text fontSize="xs" color="blue.600" fontWeight="medium">
                      📊 Date Range:
                    </Text>
                    <Text fontSize="xs" color="blue.700">
                      {fromDate || "Beginning"} → {toDate || "Now"}
                    </Text>
                  </HStack>
                </Box>
              )}
            </Box>

            <Divider />

            {/* Action Buttons */}
            <Flex justify="space-between" align="center" w="full" direction={{ base: "column", md: "row" }} gap={4}>
              <HStack spacing={2}>
                <Text fontSize="sm" color="gray.500">
                  Quick Filters:
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="yellow"
                  onClick={() => {
                    setStatus("Pending")
                    onFilter({ searchTerm, status: "Pending", fromDate, toDate })
                  }}
                  borderRadius="full"
                  fontSize="xs"
                  leftIcon={<Text fontSize="xs">⏳</Text>}
                >
                  Pending
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => {
                    setStatus("Ready")
                    onFilter({ searchTerm, status: "Ready", fromDate, toDate })
                  }}
                  borderRadius="full"
                  fontSize="xs"
                  leftIcon={<Text fontSize="xs">📦</Text>}
                >
                  Ready
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="green"
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0]
                    setFromDate(today)
                    setToDate(today)
                    onFilter({ searchTerm, status, fromDate: today, toDate: today })
                  }}
                  borderRadius="full"
                  fontSize="xs"
                  leftIcon={<Text fontSize="xs">📅</Text>}
                >
                  Today
                </Button>
              </HStack>

              <HStack spacing={3}>
                {hasActiveFilters && (
                  <Tooltip label="Clear all filters">
                    <IconButton
                      icon={<Text fontSize="lg">🗑️</Text>}
                      onClick={handleClear}
                      variant="ghost"
                      colorScheme="gray"
                      size="lg"
                      borderRadius="full"
                      _hover={{
                        bg: "red.50",
                        color: "red.500",
                        transform: "scale(1.1)",
                      }}
                      transition="all 0.2s"
                    />
                  </Tooltip>
                )}

                <Button
                  type="submit"
                  size="lg"
                  bgGradient="linear(to-r, blue.400, purple.500)"
                  color="white"
                  _hover={{
                    bgGradient: "linear(to-r, blue.500, purple.600)",
                    transform: "translateY(-2px)",
                    shadow: "lg",
                  }}
                  _active={{
                    transform: "translateY(0)",
                  }}
                  transition="all 0.2s"
                  borderRadius="lg"
                  fontWeight="bold"
                  px={8}
                  leftIcon={<Text fontSize="lg">🔍</Text>}
                >
                  Apply Filters
                </Button>
              </HStack>
            </Flex>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <Box w="full" p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                <VStack spacing={2} align="start">
                  <Text fontSize="sm" fontWeight="bold" color="blue.700">
                    🎯 Active Filters:
                  </Text>
                  <HStack spacing={2} wrap="wrap">
                    {searchTerm && (
                      <Badge colorScheme="blue" px={2} py={1} borderRadius="full" fontSize="xs">
                        🔍 Search: "{searchTerm}"
                      </Badge>
                    )}
                    {status && (
                      <Badge colorScheme={getStatusColor(status)} px={2} py={1} borderRadius="full" fontSize="xs">
                        {getStatusIcon(status)} Status: {status}
                      </Badge>
                    )}
                    {fromDate && (
                      <Badge colorScheme="purple" px={2} py={1} borderRadius="full" fontSize="xs">
                        📅 From: {fromDate}
                      </Badge>
                    )}
                    {toDate && (
                      <Badge colorScheme="purple" px={2} py={1} borderRadius="full" fontSize="xs">
                        📅 To: {toDate}
                      </Badge>
                    )}
                  </HStack>
                </VStack>
              </Box>
            )}
          </VStack>
        </form>
      </CardBody>
    </Card>
  )
}

export default OrderFilters
