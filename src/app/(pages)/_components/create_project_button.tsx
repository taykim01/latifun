"use client";

import createEmptyProjectUseCase from "@/application/use_cases/create_empty_project.use_case";
import Button from "@/presentation/components/button";
import Popup from "@/presentation/components/popup";
import React, { useState } from "react";

export default function CreateProjectButton() {
  const [popup, setPopup] = useState(false);

  const handleClickNext = () => {
    try {
      createEmptyProjectUseCase();
    } catch (error) {
      console.error(error);
    } finally {
      setPopup(false);
    }
  };

  return (
    <>
      <Button.Type1 label="Create New" onClick={() => setPopup(true)} />
      <Popup
        open={popup}
        onClose={() => setPopup(false)}
        title="Create A New Project"
        buttons={{
          back: {
            onClick: () => setPopup(false),
            text: "Cancel",
          },
          next: {
            onClick: handleClickNext,
            text: "Create",
          },
        }}
      ></Popup>
    </>
  );
}
