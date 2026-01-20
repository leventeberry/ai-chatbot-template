 "use client"

 import { useEffect } from "react"
 import { useRouter } from "next/navigation"

 const AUTH_TOKEN_KEY = "auth_token"
 const AUTH_WIDGET_KEY = "auth_widget_id"

 export function RedirectIfAuthed() {
   const router = useRouter()

   useEffect(() => {
     if (typeof window === "undefined") return
     const token = localStorage.getItem(AUTH_TOKEN_KEY)
     const widgetId = localStorage.getItem(AUTH_WIDGET_KEY)
     if (token && widgetId) {
       router.replace("/dashboard")
     }
   }, [router])

   return null
 }
