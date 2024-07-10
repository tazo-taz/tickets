import Link from 'next/link'
import React from 'react'

export default function Header({ currentUser }) {
  const links = [
    currentUser && { label: "Sign out", href: "/auth/signout" },
    !currentUser && { label: "Sign in", href: "/auth/signin" },
    !currentUser && { label: "Sign up", href: "/auth/signup" },
    currentUser && { label: "Sell tickets", href: "/tickets/new" },
    currentUser && { label: "My orders", href: "/orders" },
  ].filter(a => a).map(({ label, href }) => {
    return <li key={href}><Link to={href} href={
      href
    }>{label}</Link></li>
  })
  return (
    <div>
      <span>Header</span>
      <ul>
        {links}
      </ul>
    </div>
  )
}
