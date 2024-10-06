"use client";

import createEmptyProjectUseCase, { FormValues } from "@/application/use_cases/create_empty_project.use_case";
import { convertFormKeys, emptyForm } from "@/core/constants/empty_form";
import Button from "@/presentation/components/button";
import Popup from "@/presentation/components/popup";
import { Input } from "@/presentation/shadcn/input";
import { Label } from "@/presentation/shadcn/label";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Components from ".";

export default function CreateProjectButton() {
  const [popup, setPopup] = useState(false);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClickNext = async () => {
    try {
      setPopup(false);
      setLoading(true);
      const { projectID } = await createEmptyProjectUseCase(form);
      router.push(`/project/${projectID}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
      >
        <div className="flex flex-col gap-4">
          {Object.keys(emptyForm).map((key, index) => {
            const type = key === "supabaseUrl" || key === "PROJECT_NAME" ? "text" : "password";
            return (
              <div key={index} className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="picture">{convertFormKeys(key as keyof typeof emptyForm)}</Label>
                <Input type={type} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            );
          })}
        </div>
      </Popup>
      {loading && <Components.CreateProjectLoader />}
    </>
  );
}
