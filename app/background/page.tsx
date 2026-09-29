import type { Metadata } from "next";
import BackgroundClient from "./BackgroundClient";

export const metadata: Metadata = {
  title: "Background Questionnaire",
};

export default function BackgroundPage() {
  return <BackgroundClient />;
}
