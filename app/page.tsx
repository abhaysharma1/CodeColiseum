import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="h-screen w-full flex justify-center items-center bg-black">
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
      <Button asChild className="mx-10">
        <Link href="/signup">SignUp</Link>
      </Button>
    </div>
  );
}
