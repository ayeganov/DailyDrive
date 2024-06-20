import React, { useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Chore } from "./types";


interface ChoreFormProps
{
  onAddChore: (chore: Chore) => void;
}


const ChoreForm: React.FC<ChoreFormProps> = ({ onAddChore }) =>
{
  const [choreName, setChoreName] = useState("");

  const handleSubmit = async (e: React.FormEvent) =>
  {
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

    try
    {
      const response = await axios.post<Chore>("/backend/api/v1/chores", newChore);
      onAddChore(response.data);
      setChoreName("");
    }
    catch (error)
    {
      console.error("Error adding chore: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        id="chore_name"
        value={choreName}
        onChange={(e) => setChoreName(e.target.value)}
        placeholder="Enter chore name"
        required
      />
      <button type="submit">Add Chore</button>
    </form>
  );

};


export default ChoreForm;
