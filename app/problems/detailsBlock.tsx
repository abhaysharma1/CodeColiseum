'use client'
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface descriptionData {
    id:string,
    number: number,
    difficulty: string,
    description: string,
    title: string
}

function DetailsBlock({data}:{data:descriptionData}) {
  return (
    <div>
      <div title="tab navbar" className="w-[calc(50vw-2.5rem)] h-[calc(100vh-2.5rem)] m-5 outline-1 outline-offset-8 rounded-md py-3 px-5 box-border bg-accent/30">
        <Tabs defaultValue="description" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="testcases">Test Cases</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="my-4 mx-1">
            <div className="text-white">
                {data.title}
                hello
            </div>
          </TabsContent>
          <TabsContent value="testcases">
            Change your password here.
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default DetailsBlock;
