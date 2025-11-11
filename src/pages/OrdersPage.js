"use client"

import { useEffect, useState } from "react"
import { getAllOrders, getFilteredOrders, deleteOrder } from "../services/ordersService"
import { itemProgressService } from "../services/itemProgressService"
import { useNavigate } from "react-router-dom"
import OrderFilters from "../OrderFilters"
import {
  Box,
  Heading,
  Button,
  Checkbox,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Card,
  CardBody,
  Badge,
  Flex,
  VStack,
  HStack,
  useColorModeValue,
  Container,
  Stat,
  StatLabel,
  StatNumber,
  IconButton,
  Tooltip,
  Text,
  CircularProgress,
  CircularProgressLabel,
  Progress,
} from "@chakra-ui/react"

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [selectedOrders, setSelectedOrders] = useState([])
  const [newStatus, setNewStatus] = useState("")
  const [progressData, setProgressData] = useState({})
  const navigate = useNavigate()
  const toast = useToast()

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, purple.50, pink.50)",
    "linear(to-br, gray.900, purple.900, blue.900)",
  )
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  // Load orders and progress data
  const loadOrders = () => {
    getAllOrders()
      .then((ordersData) => {
        setOrders(ordersData)
        // Load progress data for all orders
        const allProgress = {}
        ordersData.forEach((order) => {
          const itemCount = order.items?.length || 0
          allProgress[order.id] = itemProgressService.getCompletionStats(order.id, itemCount)
        })
        setProgressData(allProgress)
      })
      .catch(console.error)
  }

  // Load orders on component mount only
  useEffect(() => {
    loadOrders()
  }, [])

  // Refresh progress data every 5 seconds
  useEffect(() => {
    if (orders.length === 0) return

    const allProgress = {}
    orders.forEach((order) => {
      const itemCount = order.items?.length || 0
      allProgress[order.id] = itemProgressService.getCompletionStats(order.id, itemCount)
    })
    setProgressData(allProgress)

    const interval = setInterval(() => {
      if (orders.length > 0) {
        const latestProgress = {}
        orders.forEach((order) => {
          const itemCount = order.items?.length || 0
          latestProgress[order.id] = itemProgressService.getCompletionStats(order.id, itemCount)
        })
        setProgressData(latestProgress)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [orders.length])

  // Filter callback
  const handleFilter = (filters) => {
    getFilteredOrders(filters)
      .then((filteredOrders) => {
        setOrders(filteredOrders)
        // Update progress data for filtered orders
        const allProgress = {}
        filteredOrders.forEach((order) => {
          const itemCount = order.items?.length || 0
          allProgress[order.id] = itemProgressService.getCompletionStats(order.id, itemCount)
        })
        setProgressData(allProgress)
      })
      .catch(() => toast({ status: "error", title: "Failed to filter orders" }))
    setSelectedOrders([])
  }

  // Toggle selection for individual order
  const toggleOrderSelection = (orderId) => {
    setSelectedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  // Select / Deselect all currently visible orders
  const toggleSelectAll = () => {
    const allVisibleIds = orders.map((o) => o.id)
    const allSelected = allVisibleIds.every((id) => selectedOrders.includes(id))

    if (allSelected) {
      setSelectedOrders((prev) => prev.filter((id) => !allVisibleIds.includes(id)))
    } else {
      setSelectedOrders((prev) => [...new Set([...prev, ...allVisibleIds])])
    }
  }

  // Bulk update
  const handleBulkUpdate = () => {
    if (!newStatus || selectedOrders.length === 0) {
      toast({ status: "warning", title: "Select a status and orders first" })
      return
    }

    const updates = selectedOrders.map((id) => ({
      id,
      status: newStatus,
    }))

    const token = localStorage.getItem("token")

    fetch(`https://localhost:7223/api/orders/bulk-update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(updates),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Bulk update failed")
        return res.text()
      })
      .then(() => {
        toast({ status: "success", title: "✨ Status updated successfully!" })
        setSelectedOrders([])
        setNewStatus("")
        loadOrders()
      })
      .catch((err) => toast({ status: "error", title: err.message }))
  }

  const handleDeleteOrder = (orderId) => {
    if (window.confirm("Delete this order? This action cannot be undone.")) {
      deleteOrder(orderId).then(() => {
        // Clear progress data for deleted order
        itemProgressService.clearOrderProgress(orderId)
        toast({ status: "success", title: "🗑️ Order deleted successfully!" })
        loadOrders()
      })
    }
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

  const getCompletionColor = (percentage) => {
    if (percentage === 100) return "green"
    if (percentage >= 50) return "yellow"
    return "red"
  }

  const getProgressSummary = () => {
    let totalItems = 0
    let completedItems = 0

    orders.forEach((order) => {
      const stats = progressData[order.id]
      if (stats) {
        totalItems += stats.total
        completedItems += stats.completed
      }
    })

    return {
      totalItems,
      completedItems,
      percentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
    }
  }

  const areAllItemsMeasured = (order) => {
    if (!order.items || order.items.length === 0) return false

    return order.items.every((item, index) => {
      if (item.type !== "Carpet") return true // Non-carpet items don't need measurement

      const storageKey = `order_${order.id}_item_${index}_measured`
      const stored = localStorage.getItem(storageKey)
      return stored !== null ? JSON.parse(stored) : item.isMeasured || false
    })
  }

  const overallProgress = getProgressSummary()

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="8xl" py={8}>
        {/* Header Section */}
        <Card mb={8} bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
          <Box h="4px" bgGradient="linear(to-r, blue.400, purple.400, pink.400)" />
          <CardBody p={8}>
            <Flex justify="space-between" align="center" mb={6}>
              <VStack align="start" spacing={2}>
                <HStack>
                  <Text fontSize="4xl">🛍️</Text>
                  <Heading size="2xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                    Orders Management
                  </Heading>
                </HStack>
                <Text color={textColor} fontSize="lg">
                  Manage all your orders in one beautiful place
                </Text>
              </VStack>

              <VStack align="end" spacing={3}>
                <Stat textAlign="right">
                  <StatLabel color={textColor}>Total Orders</StatLabel>
                  <StatNumber fontSize="3xl" bgGradient="linear(to-r, green.400, blue.500)" bgClip="text">
                    {orders.length}
                  </StatNumber>
                </Stat>

                {/* Overall Progress */}
                <Card bg="blue.50" borderRadius="lg" p={3} borderWidth="2px" borderColor="blue.200">
                  <VStack spacing={2}>
                    <Text fontSize="sm" fontWeight="bold" color="blue.600">
                      Overall Progress
                    </Text>
                    <HStack spacing={3}>
                      <CircularProgress
                        value={overallProgress.percentage}
                        size="50px"
                        color={getCompletionColor(overallProgress.percentage)}
                        thickness="8px"
                      >
                        <CircularProgressLabel fontSize="xs" fontWeight="bold">
                          {overallProgress.percentage}%
                        </CircularProgressLabel>
                      </CircularProgress>
                      <VStack spacing={0} align="start">
                        <Text fontSize="sm" fontWeight="bold" color="blue.700">
                          {overallProgress.completedItems}/{overallProgress.totalItems}
                        </Text>
                        <Text fontSize="xs" color="blue.500">
                          items done
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </Card>

                <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="sm">
                  {selectedOrders.length} selected
                </Badge>
              </VStack>
            </Flex>

            {/* Action Buttons */}
            <HStack spacing={4} justify="center">
              <Button
                leftIcon={<Text fontSize="xl">➕</Text>}
                colorScheme="teal"
                size="lg"
                onClick={() => navigate("/create")}
                bgGradient="linear(to-r, teal.400, teal.600)"
                _hover={{
                  bgGradient: "linear(to-r, teal.500, teal.700)",
                  transform: "translateY(-2px)",
                  shadow: "xl",
                }}
                transition="all 0.2s"
                borderRadius="full"
                px={8}
                py={6}
                fontSize="lg"
                fontWeight="bold"
              >
                Create New Order
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Filters Section */}
        <Card mb={6} bg={cardBg} shadow="xl" borderRadius="2xl">
          <CardBody p={6}>
            <HStack mb={4}>
              <Text fontSize="xl">🔍</Text>
              <Heading size="md">Filters & Search</Heading>
            </HStack>
            <OrderFilters onFilter={handleFilter} />
          </CardBody>
        </Card>

        {/* Bulk Actions */}
        <Card mb={6} bg={cardBg} shadow="xl" borderRadius="2xl">
          <CardBody p={6}>
            <HStack mb={4}>
              <Text fontSize="xl">⚡</Text>
              <Heading size="md">Bulk Actions</Heading>
            </HStack>
            <HStack spacing={4} wrap="wrap">
              <Checkbox
                isChecked={orders.length > 0 && orders.every((o) => selectedOrders.includes(o.id))}
                onChange={toggleSelectAll}
                colorScheme="blue"
                size="lg"
              >
                <Text fontWeight="medium">Select All ({orders.length})</Text>
              </Checkbox>

              <Select
                placeholder="-- Choose Status --"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                width="200px"
                borderRadius="xl"
                bg="white"
              >
                <option value="Pending">⏳ Pending</option>
                <option value="Ready">📦 Ready</option>
                <option value="Completed">✅ Completed</option>
                <option value="Cancelled">❌ Cancelled</option>
              </Select>

              <Button
                leftIcon={<Text fontSize="lg">🚀</Text>}
                colorScheme="blue"
                onClick={handleBulkUpdate}
                isDisabled={selectedOrders.length === 0 || !newStatus}
                bgGradient="linear(to-r, blue.400, blue.600)"
                _hover={{
                  bgGradient: "linear(to-r, blue.500, blue.700)",
                  transform: "translateY(-2px)",
                  shadow: "lg",
                }}
                transition="all 0.2s"
                borderRadius="xl"
                px={6}
                fontWeight="bold"
              >
                Update {selectedOrders.length} Orders
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Orders Table */}
        <Card bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
          <CardBody p={0}>
            <Box overflowX="auto">
              <Table variant="simple" size="lg">
                <Thead bg="gray.50">
                  <Tr>
                    <Th borderColor={borderColor} py={4}>
                      <Checkbox
                        isChecked={orders.length > 0 && orders.every((o) => selectedOrders.includes(o.id))}
                        onChange={toggleSelectAll}
                        colorScheme="blue"
                      />
                    </Th>
                    <Th borderColor={borderColor} color="blue.500" fontSize="md" fontWeight="bold">
                      Order ID
                    </Th>
                    <Th borderColor={borderColor} color="blue.500" fontSize="md" fontWeight="bold">
                      Customer
                    </Th>
                    <Th borderColor={borderColor} color="blue.500" fontSize="md" fontWeight="bold">
                      Items Progress
                    </Th>
                    <Th borderColor={borderColor} color="blue.500" fontSize="md" fontWeight="bold">
                      Status
                    </Th>
                    <Th borderColor={borderColor} color="blue.500" fontSize="md" fontWeight="bold">
                      Actions
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {orders.map((order) => {
                    const itemStats = progressData[order.id] || {
                      completed: 0,
                      total: order.items?.length || 0,
                      percentage: 0,
                    }
                    return (
                      <Tr
                        key={order.id}
                        _hover={{
                          bg: "blue.50",
                          transform: "scale(1.01)",
                          transition: "all 0.2s",
                        }}
                        bg={selectedOrders.includes(order.id) ? "blue.50" : "transparent"}
                      >
                        <Td borderColor={borderColor} py={4}>
                          <Checkbox
                            isChecked={selectedOrders.includes(order.id)}
                            onChange={() => toggleOrderSelection(order.id)}
                            colorScheme="blue"
                          />
                        </Td>
                        <Td borderColor={borderColor}>
                          <HStack>
                            <Text fontSize="lg">📋</Text>
                            <Text fontWeight="bold" color="blue.500">
                              #{order.orderNumber}
                            </Text>
                          </HStack>
                        </Td>
                        <Td borderColor={borderColor}>
                          <Text fontWeight="medium" color={textColor}>
                            Customer #{order.customerId}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor}>
                          <VStack spacing={2} align="start">
                            <HStack spacing={3}>
                              <CircularProgress
                                value={itemStats.percentage}
                                size="45px"
                                color={getCompletionColor(itemStats.percentage)}
                                thickness="8px"
                              >
                                <CircularProgressLabel fontSize="xs" fontWeight="bold">
                                  {itemStats.percentage}%
                                </CircularProgressLabel>
                              </CircularProgress>
                              <VStack spacing={0} align="start">
                                <Text fontSize="sm" fontWeight="bold" color={textColor}>
                                  {itemStats.completed}/{itemStats.total} items
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {itemStats.percentage === 100
                                    ? "All done! 🎉"
                                    : itemStats.completed > 0
                                      ? "In progress ⏳"
                                      : "Not started 📋"}
                                </Text>
                              </VStack>
                            </HStack>
                            {itemStats.total > 0 && (
                              <Progress
                                value={itemStats.percentage}
                                size="sm"
                                colorScheme={getCompletionColor(itemStats.percentage)}
                                borderRadius="full"
                                w="120px"
                                bg="gray.200"
                              />
                            )}
                            {areAllItemsMeasured(order) && (
                              <Badge
                                colorScheme="green"
                                px={2}
                                py={0.5}
                                borderRadius="full"
                                fontSize="xs"
                                fontWeight="bold"
                              >
                                ✅ All Measured
                              </Badge>
                            )}
                          </VStack>
                        </Td>
                        <Td borderColor={borderColor}>
                          <Badge
                            colorScheme={getStatusColor(order.status)}
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="sm"
                            fontWeight="bold"
                          >
                            {getStatusIcon(order.status)} {order.status}
                          </Badge>
                        </Td>
                        <Td borderColor={borderColor}>
                          <HStack spacing={2}>
                            <Tooltip label="View Details">
                              <IconButton
                                icon={<Text fontSize="lg">👁️</Text>}
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => navigate(`/order/${order.id}`)}
                                borderRadius="full"
                                _hover={{ transform: "scale(1.1)" }}
                              />
                            </Tooltip>
                            <Tooltip label="Edit Order">
                              <IconButton
                                icon={<Text fontSize="lg">✏️</Text>}
                                size="sm"
                                colorScheme="yellow"
                                variant="ghost"
                                onClick={() => navigate(`/edit/${order.id}`)}
                                borderRadius="full"
                                _hover={{ transform: "scale(1.1)" }}
                              />
                            </Tooltip>
                            <Tooltip label="Delete Order">
                              <IconButton
                                icon={<Text fontSize="lg">🗑️</Text>}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDeleteOrder(order.id)}
                                borderRadius="full"
                                _hover={{ transform: "scale(1.1)" }}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    )
                  })}
                </Tbody>
              </Table>

              {orders.length === 0 && (
                <Box p={12} textAlign="center">
                  <VStack spacing={4}>
                    <Text fontSize="6xl">📦</Text>
                    <Text fontSize="xl" fontWeight="bold" color={textColor}>
                      No orders found
                    </Text>
                    <Text color="gray.500">Create your first order to get started!</Text>
                    <Button
                      leftIcon={<Text fontSize="lg">➕</Text>}
                      colorScheme="teal"
                      onClick={() => navigate("/create")}
                      borderRadius="full"
                      px={6}
                    >
                      Create First Order
                    </Button>
                  </VStack>
                </Box>
              )}
            </Box>
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}

export default OrdersPage
