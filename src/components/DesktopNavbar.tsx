import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import React from "react";
import Link from "next/link";
import { ModeToggle } from "./ModeToggle";
import { BellIcon, HomeIcon, UserIcon } from "lucide-react";
import { SignInButton, UserButton } from "@clerk/nextjs";

export default async function DesktopNavbar() {
  const user = await currentUser();
  console.log("user is here", user);
  return (
    <div className="hidden md:flex grow-0 items-center space-x-4 ml-auto">
      <ModeToggle />
      <Button variant="ghost" className="flex items-center gap-2" asChild>
        <Link href="/">
          <HomeIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      {user ? (
        <>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href="/notifications">
              <BellIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Notifications</span>
            </Link>
          </Button>

          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href={`/profile/${user.username ?? user.emailAddresses[0].emailAddress.split("@")[0]}`}>
              <UserIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Profile</span>
            </Link>
          </Button>

          <UserButton />
        </>
      ) : (
        <SignInButton mode="modal">
            <Button>Sign In</Button>
        </SignInButton>
      )}
    </div>
  );
}
