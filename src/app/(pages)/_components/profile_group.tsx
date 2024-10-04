"use client";

import { useState } from "react";
import ProfileTooltip from "./profile_tooltip";

export default function ProfileGroup() {
    const [tooltip, setTooltip] = useState(false);
    const toggleTooltip = () => setTooltip(!tooltip);
    return (
        <div
            className="cursor-pointer flex items-center gap-2 relative hover:bg-gray-100 p-1 rounded-lg mt-[-4px] ml-[-4px]"
            onClick={toggleTooltip}
        >
            <div className="rounded-full w-8 h-8 bg-gray-300"></div>
            <div className="text-title-4">김태은</div>
            {tooltip && <ProfileTooltip />}
        </div>
    );
}
