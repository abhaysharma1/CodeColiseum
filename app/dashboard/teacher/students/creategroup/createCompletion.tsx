import { Spinner } from "@/components/ui/shadcn-io/spinner";
import React from "react";
import { RxCross1 } from "react-icons/rx";

interface CreateGroupResponse {
  notFoundMembers: string[];
  notStudents: string[];
  alreadyMembers: string[];
  addedCount: number;
}

interface ApiResponse {
  status: number;
  statusText: string;
  data: CreateGroupResponse;
}

function CreateCompletion({
  creatingGroup,
  data,
}: {
  creatingGroup: boolean;
  data: ApiResponse | undefined;
}) {
  return (
    <div className="min-w-[20vw] min-h-[30vh] max-w-[40vw] max-h-[50vh] ">
      {creatingGroup ? (
        <Spinner variant="ring" />
      ) : (
        <div className="bg-background w-full h-full p-5 rounded-md">
          <div className="w-full justify-between flex ">
            <p>Group Creation Status</p>
            <RxCross1 />
          </div>
          <div>
            {data?.status == 200 ? (
              <div>
                <div>Group Created Successfully</div>
                <div className="rounded-md  overflow-scroll bg-background/30">
                  {data.data.notFoundMembers.length > 0 &&
                    data.data.notFoundMembers.map((item) => <div>{item}</div>)}
                </div>
              </div>
            ) : (
              <div>
                Group Couldn't be Created
                {data?.statusText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateCompletion;
