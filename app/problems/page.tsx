"use client";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import DetailsBlock from "./detailsBlock";
import CodingBlock from "./codingBlock";
import axios from "axios";

interface descriptionData {
  id: string;
  number: number;
  difficulty: string;
  description: string;
  title: string;
}

function QuestionSolvingPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [descriptionData, setDescriptionData] = useState<descriptionData>({
    id: "hhh",
    number: 0,
    difficulty: "",
    description: "",
    title: "",
  });


  const getProblemDescription = async () => {
    const response = await axios.post(
      `/api/problems/getproblems?page=1&limit=1`,
      {
        searchValue: id,
      }
    );
    setDescriptionData(response.data as descriptionData);
  };

  useEffect(() => {
    getProblemDescription();
  }, []);

  return (
    <div className="flex justify-center">
      <div>
        <DetailsBlock data={descriptionData} />
      </div>
      <div>
        <CodingBlock />
      </div>
    </div>
  );
}

export default QuestionSolvingPage;
