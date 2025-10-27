import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

function createTest() {
  return (
      <div>
        <SiteHeader name={"Create Test"} />
        <div className="w-full h-full p-4">
          <Label className="text-xl">Create Your Test</Label>
          <div >
            <Label>Name</Label>
            <Input className="w-[10rem]"/>
          </div>
        </div>
      </div>
  );
}

export default createTest;
