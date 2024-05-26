import React, { useState } from "react";
import axios from "axios";
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
      id: Date.now(),
      name: choreName,
      statuses: {
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
        Sunday: false,
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
