import { createToastFn } from "@chakra-ui/toast"

// Create the toaster instance
export const toaster = createToastFn({
  placement: "bottom-right"
})

// Export the Toaster component
export function Toaster() {
  return <toaster.ToastContainer />
} 