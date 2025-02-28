"use client"

import { cn } from "@/lib/utils"
import useAuthStore from "@/store"
import { Building2, CheckCheck, Hotel, LogInIcon, Newspaper, MessageCircleQuestion as QuestionCircle, BookTemplate as Temple } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import axios from "axios"


export function MainNav() {
  const pathname = usePathname()
  const {admin, clearToken, setAdmin, collaborator, setCollaborator} = useAuthStore()

  const routes = [
    {
      label: 'Hotels',
      icon: Hotel,
      href: '/hotels',
      visible: admin 
    },
    {
      label: 'Temples',
      icon: Temple,
      href: '/temples',
      visible: admin || collaborator
    },
    {
      label: 'Queries',
      icon: QuestionCircle,
      href: '/queries',
      visible: admin || collaborator
    },
    {
      label: 'News',
      icon: Newspaper,
      href: '/news',
      visible: admin || collaborator
    },
    {
      label: 'Bookings',
      icon: CheckCheck,
      href: '/bookings',
      visible: admin 
    },
    {
      label: 'Hotel Login',
      icon: LogInIcon,
      href: '/hotelBooking',
      visible: !collaborator
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-yellow-300 text-black">
        <div className="flex items-center gap-2 px-4 py-8 border-b">
          <Building2 className="h-8 w-8" />
          <span className="text-xl font-bold">haridwarlive.in</span>
        </div>
      </div>
      
      <nav className="flex flex-col gap-2 px-2">
        {routes.map((route) => (
          
            (admin || collaborator) 
            ? <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              pathname === route.href ? "bg-accent" : "transparent",
              route.visible ? "flex" : "hidden"
            )}
          >
            <route.icon className="h-5 w-5" />
            {route.label}
          </Link>
          : (!admin && !collaborator) 
            ? <span key={route.href}></span>
            : <div key={route.href} className="bg-gray-100 rounded-lg w-full h-10"></div>
        ))}
         
        <div className="p-4">
          <Link href={(!admin && !collaborator) ? "/hotelBooking" : "/login"}><Button 
          onClick={async ()=>{
            await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/logout`, {
              withCredentials: true
            })
            clearToken()
            setAdmin(false)
            setCollaborator(false)

          }}
          variant="destructive">Logout</Button></Link>
        </div>
      </nav>

      
    </div>
  )
}