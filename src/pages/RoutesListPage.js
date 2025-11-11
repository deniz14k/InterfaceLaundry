import { useEffect, useState } from "react"
import { getAllRoutes, deleteRoute } from "../services/RouteService"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Button,
  Text,
  VStack,
  Card,
  CardBody,
  Heading,
  HStack,
  Badge,
  useColorModeValue,
  Container,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  IconButton,
  Tooltip,
  useToast,
  Avatar,
} from "@chakra-ui/react"

export default function RoutesListPage() {
  const [routes, setRoutes] = useState([])
  const navigate = useNavigate()
  const toast = useToast()

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, purple.50, pink.50)",
    "linear(to-br, gray.900, purple.900, blue.900)",
  )
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  useEffect(() => {
    loadRoutes()
  }, [])

  async function loadRoutes() {
    try {
      const data = await getAllRoutes()
      setRoutes(data)
    } catch (e) {
      console.error("Error loading routes:", e)
      toast({ status: "error", title: "Could not load routes" })
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(`Stergi ruta #${id}?`)) return
    try {
      await deleteRoute(id)
      setRoutes((rs) => rs.filter((r) => r.id !== id))
      toast({ status: "success", title: "🗑️ Ruta a fost stearsa cu succes!" })
    } catch (e) {
      console.error("Delete failed:", e)
      toast({ status: "error", title: e.message })
    }
  }

  const getRouteStatusColor = (route) => {
    if (route.isStarted) return "green"
    if (route.orders?.length > 0) return "blue"
    return "gray"
  }

  const getRouteStatusText = (route) => {
    if (route.isStarted) return "🟢 Active"
    if (route.orders?.length > 0) return "📋 Ready"
    return "⚪ Empty"
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="7xl" py={8}>
        {/* Header Section */}
        <Card mb={8} bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
          <Box h="4px" bgGradient="linear(to-r, blue.400, purple.400, pink.400)" />
          <CardBody p={8}>
            <Flex justify="space-between" align="center" mb={6}>
              <VStack align="start" spacing={2}>
                <HStack>
                  <Text fontSize="4xl">🚚</Text>
                  <Heading size="2xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                    Rute de traseu
                  </Heading>
                </HStack>
                <Text color={textColor} fontSize="lg">
                  Acceseaza si monitorizeaza toate rutele tale
                </Text>
              </VStack>

              <VStack align="end" spacing={2}>
                <Stat textAlign="right">
                  <StatLabel color={textColor}>Toate Rutele</StatLabel>
                  <StatNumber fontSize="3xl" bgGradient="linear(to-r, green.400, blue.500)" bgClip="text">
                    {routes.length}
                  </StatNumber>
                </Stat>
                <Badge colorScheme="green" px={3} py={1} borderRadius="full" fontSize="sm">
                  {routes.filter((r) => r.isStarted).length} active
                </Badge>
              </VStack>
            </Flex>

            {/* Action Buttons */}
            <HStack spacing={4} justify="center">
              <Button
                leftIcon={<Text fontSize="xl">➕</Text>}
                colorScheme="teal"
                size="lg"
                onClick={() => navigate("/routes/manual")}
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
                Creeaza o ruta noua
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Routes List */}
        {routes.length === 0 ? (
          <Card bg={cardBg} shadow="xl" borderRadius="2xl">
            <CardBody p={12} textAlign="center">
              <VStack spacing={6}>
                <Text fontSize="8xl">🗺️</Text>
                <Heading size="lg" color={textColor}>
                  Nu exista rute creeate
                </Heading>
                <Text color="gray.500" fontSize="lg">
                  Creeaza prima ruta 
                </Text>
                <Button
                  leftIcon={<Text fontSize="xl">🚀</Text>}
                  colorScheme="teal"
                  size="lg"
                  onClick={() => navigate("/routes/manual")}
                  borderRadius="full"
                  px={8}
                  py={4}
                  fontSize="lg"
                  fontWeight="bold"
                >
                  Creeaza ruta 
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={6} align="stretch">
            {routes.map((route) => (
              <Card
                key={route.id}
                bg={cardBg}
                shadow="xl"
                borderRadius="2xl"
                _hover={{
                  shadow: "2xl",
                  transform: "translateY(-4px)",
                  transition: "all 0.3s",
                }}
                transition="all 0.3s"
              >
                <CardBody p={8}>
                  <Flex justify="space-between" align="center">
                    <HStack spacing={6}>
                      <Avatar
                        size="xl"
                        bg={getRouteStatusColor(route) === "green" ? "green.500" : "blue.500"}
                        color="white"
                        name={`#${route.id}`}
                        fontSize="2xl"
                        fontWeight="bold"
                      />
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <Badge
                            colorScheme={getRouteStatusColor(route)}
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="sm"
                            fontWeight="bold"
                          >
                            {getRouteStatusText(route)}
                          </Badge>
                          <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                            Route #{route.id}
                          </Text>
                        </HStack>
                        <HStack spacing={4}>
                          <HStack>
                            <Text fontSize="lg">👨‍✈️</Text>
                            <Text fontWeight="medium" color={textColor}>
                              {route.driverName || "Unassigned"}
                            </Text>
                          </HStack>
                          <HStack>
                            <Text fontSize="lg">📅</Text>
                            <Text color="gray.500">{new Date(route.createdAt).toLocaleDateString()}</Text>
                          </HStack>
                        </HStack>
                        <HStack spacing={4}>
                          <Stat size="sm">
                            <StatLabel color={textColor}>Opriri</StatLabel>
                            <StatNumber color="blue.500">{route.orders?.length || 0}</StatNumber>
                          </Stat>
                          <Stat size="sm">
                            <StatLabel color={textColor}>Completat</StatLabel>
                            <StatNumber color="green.500">
                              {route.orders?.filter((o) => o.isCompleted).length || 0}
                            </StatNumber>
                          </Stat>
                        </HStack>
                      </VStack>
                    </HStack>

                    <VStack spacing={3}>
                      <HStack spacing={2}>
                        <Tooltip label="Open Route Dashboard">
                          <IconButton
                            icon={<Text fontSize="xl">🗺️</Text>}
                            colorScheme="blue"
                            size="lg"
                            onClick={() => navigate(`/driver/route/${route.id}`)}
                            borderRadius="full"
                            _hover={{ transform: "scale(1.1)" }}
                          />
                        </Tooltip>
                        <Tooltip label="Delete Route">
                          <IconButton
                            icon={<Text fontSize="xl">🗑️</Text>}
                            colorScheme="red"
                            size="lg"
                            onClick={() => handleDelete(route.id)}
                            borderRadius="full"
                            _hover={{ transform: "scale(1.1)" }}
                          />
                        </Tooltip>
                      </HStack>
                      <Button
                        leftIcon={<Text fontSize="lg">🚀</Text>}
                        colorScheme="purple"
                        size="sm"
                        onClick={() => navigate(`/driver/route/${route.id}`)}
                        borderRadius="full"
                        px={4}
                        fontWeight="bold"
                      >
                        Acceseaza Ruta
                      </Button>
                    </VStack>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}
      </Container>
    </Box>
  )
}
