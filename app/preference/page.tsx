"use client";

import { PersonalInformations } from "./components/PersonalInformations";
import { PreviewOtherCountryDate } from "./components/PreviewOtherCountryDate";
import { TimezoneCountryForm } from "./components/TimezoneCountryForm";

export default function Preference() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
      <h1 className="text-2xl font-semibold">Preference</h1>
      <div className="flex items-stretch gap-6 w-full flex-wrap lg:flex-nowrap">
        <div className="flex-1 flex">
          <TimezoneCountryForm />
        </div>
        <div className="flex-1 flex">
          <PreviewOtherCountryDate />
        </div>
      </div>
      <div className="flex items-stretch gap-6 w-full flex-wrap lg:flex-nowrap">
        <div className="flex-1 flex">
          <PersonalInformations />
        </div>
      </div>
    </div>
  );
}
