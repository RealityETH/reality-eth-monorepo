import React from "react";
import { Select, SelectProps } from "../Select/Select";
import languages from "./languages.json";

export type Language = keyof typeof languages;

const options = Object.entries(languages).map(([lan, name]) => {
  return {
    label: name,
    value: lan as Language,
  };
});

type LanguageFieldProps = Omit<SelectProps<Language>, "label" | "options">;

export function LanguageField(props: LanguageFieldProps) {
  return <Select label="Language" options={options} {...props} />;
}
