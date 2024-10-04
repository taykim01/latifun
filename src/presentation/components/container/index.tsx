import { ReactNode } from "react";

export default function Container(props: { children?: ReactNode }) {
    return (
        <div className="w-full h-full flex" style={{ backgroundColor: "#fefefe" }}>
            <aside className="min-w-[200px] shadow hover:shadow-lg transition-all duration-300 p-5 pt-8 flex flex-col justify-between">
                <div className="text-subheadline-1">Side Bar</div>
                <div>Log Out</div>
            </aside>
            <div className="w-full">
                <header className=" p-5 pt-8 flex justify-between items-center shadow-sm hover:shadow transition-all duration-300">
                    <div className="text-title-4 cursor-pointer">Latifun</div>
                </header>
                <div className="px-5 py-8">{props.children}</div>
            </div>
        </div>
    );
}
