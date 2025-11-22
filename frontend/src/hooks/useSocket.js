import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export function useSocket(eventName, callback) {
  const socketRef = useRef(null)

  useEffect(() => {
    // Create socket connection
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      })

      const socket = socketRef.current

      socket.on('connect', () => {
        console.log('Socket connected')
      })

      socket.on('disconnect', () => {
        console.log('Socket disconnected')
      })

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
      })
    }

    const socket = socketRef.current

    // Listen for the specified event
    if (eventName && callback) {
      socket.on(eventName, callback)
    }

    // Cleanup
    return () => {
      if (eventName && callback) {
        socket.off(eventName, callback)
      }
    }
  }, [eventName, callback])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  return socketRef.current
}
