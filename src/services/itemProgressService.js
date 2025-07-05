// Frontend-only service to track item completion progress using localStorage
class ItemProgressService {
  constructor() {
    this.storageKey = "orderItemProgress"
  }

  // Get all progress data from localStorage
  getAllProgress() {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error("Error reading progress from localStorage:", error)
      return {}
    }
  }

  // Get progress for a specific order
  getOrderProgress(orderId) {
    const allProgress = this.getAllProgress()
    return allProgress[orderId] || {}
  }

  // Save progress for a specific order
  saveOrderProgress(orderId, itemsProgress) {
    try {
      const allProgress = this.getAllProgress()
      allProgress[orderId] = itemsProgress
      localStorage.setItem(this.storageKey, JSON.stringify(allProgress))
    } catch (error) {
      console.error("Error saving progress to localStorage:", error)
    }
  }

  // Update completion status for a specific item in an order
  updateItemCompletion(orderId, itemIndex, isCompleted) {
    const orderProgress = this.getOrderProgress(orderId)
    orderProgress[itemIndex] = isCompleted
    this.saveOrderProgress(orderId, orderProgress)
  }

  // Get completion stats for an order
  getCompletionStats(orderId, totalItems) {
    const orderProgress = this.getOrderProgress(orderId)
    let completed = 0

    for (let i = 0; i < totalItems; i++) {
      if (orderProgress[i] === true) {
        completed++
      }
    }

    const percentage = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0

    return {
      completed,
      total: totalItems,
      percentage,
    }
  }

  // Check if a specific item is completed
  isItemCompleted(orderId, itemIndex) {
    const orderProgress = this.getOrderProgress(orderId)
    return orderProgress[itemIndex] === true
  }

  // Mark all items as completed for an order
  markAllCompleted(orderId, totalItems) {
    const orderProgress = {}
    for (let i = 0; i < totalItems; i++) {
      orderProgress[i] = true
    }
    this.saveOrderProgress(orderId, orderProgress)
  }

  // Clear progress for an order (useful when order is deleted)
  clearOrderProgress(orderId) {
    const allProgress = this.getAllProgress()
    delete allProgress[orderId]
    localStorage.setItem(this.storageKey, JSON.stringify(allProgress))
  }

  // Get progress summary for dashboard
  getProgressSummary() {
    const allProgress = this.getAllProgress()
    const summary = {
      totalOrders: Object.keys(allProgress).length,
      fullyCompleted: 0,
      inProgress: 0,
      notStarted: 0,
    }

    Object.values(allProgress).forEach((orderProgress) => {
      const completedItems = Object.values(orderProgress).filter((status) => status === true).length
      const totalItems = Object.keys(orderProgress).length

      if (completedItems === 0) {
        summary.notStarted++
      } else if (completedItems === totalItems) {
        summary.fullyCompleted++
      } else {
        summary.inProgress++
      }
    })

    return summary
  }
}

// Export singleton instance
export const itemProgressService = new ItemProgressService()
export default itemProgressService
