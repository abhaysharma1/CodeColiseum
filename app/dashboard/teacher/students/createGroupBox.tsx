import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React, { ChangeEvent, Dispatch, SetStateAction } from "react";
import { RxCross2 } from "react-icons/rx";

interface newgroupdataprops {
  groupName: string;
  description: string;
  emails: string[];
  creatorId?: string;
}

function CreateGroupBox({
  setShowCreateGroupBox,
  setNewGroupData,
  loading,
  createNewGroup
}: {
  setShowCreateGroupBox: Dispatch<SetStateAction<boolean>>;
  setNewGroupData: Dispatch<SetStateAction<newgroupdataprops>>;
  loading: boolean;
  createNewGroup:()=>Promise<void>
}) {

  const handleChange = (event: ChangeEvent<HTMLInputElement>|ChangeEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    const { name, value } = event.target;
    setNewGroupData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full h-[85vh] absolute flex justify-center items-center bg-[#0a0a0ae9] z-2 animate-fade animate-once box-border">
      <div className="w-[37%] h-[63%] bg-background outline-1 outline-white/40 outline-offset-4 rounded-md p-7">
        <div className="w-full flex justify-end">
          <RxCross2
            className="size-4"
            onClick={() => setShowCreateGroupBox(false)}
          />
        </div>
        <div>
          <Label className="text-xl mt-1">
            Enter Some More Details about the group
          </Label>
          <div className=" my-7 ">
            <Label className="mb-2">Group Name</Label>
            <Input
              placeholder="Enter Group Name"
              className="w-[60%]"
              onChange={handleChange}
              name="groupName"
            />
            <Label className="mb-2 mt-5">Group Description</Label>
            <Textarea
              placeholder="Enter Group Description"
              className="w-[80%]"
              name="description"
              onChange={handleChange}
            />
          </div>
          <div className="w-full flex justify-end pr-10">
            <Button disabled={loading} onClick={createNewGroup}>{loading ? "Please Wait" : "Create Group"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupBox;
