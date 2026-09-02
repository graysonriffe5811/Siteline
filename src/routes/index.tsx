import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { FieldApp } from "@/components/instrument/field-app";
import { useSurvey } from "@/lib/survey/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  useEffect(() => {
    void Promise.resolve(useSurvey.persist.rehydrate()).then(() => {
      useSurvey.getState().setHydrated();
    });
  }, []);
  return <FieldApp />;
}
