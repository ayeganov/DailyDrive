import React, { useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Chore } from "./types";



interface ChoreFormProps {
  onAddChore: (chore: Chore) => void;
}


const ChoreForm: React.FC<ChoreFormProps> = ({ onAddChore }) => {
  const [choreName, setChoreName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newChore: Chore = {
      id: uuidv4(),
      name: choreName,
      statuses: {
        Monday: "_",
        Tuesday: "_",
        Wednesday: "_",
        Thursday: "_",
        Friday: "_",
        Saturday: "_",
        Sunday: "_",
      },
    };

    try {
      const response = await axios.post<Chore>("/backend/api/v1/chores", newChore);
      onAddChore(response.data);
      setChoreName("");
    }
    catch (error) {
      console.error("Error adding chore: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className=" flex items-center">
      <input
        className="bg-white rounded-md p-2 outline-none border-purple-400 border-2 placeholder:text-gray-400 text-purple-700"
        type="text"
        id="chore_name"
        value={choreName}
        onChange={(e) => setChoreName(e.target.value)}
        placeholder="Enter chore name"
        required
      />
      <button type="submit" className="flex justify-center items-center transition duration-200 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-600 focus:ring-opacity-50  p-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-white text-center ml-2">Add Chore</button>
    </form>
  );

};


export default ChoreForm;
