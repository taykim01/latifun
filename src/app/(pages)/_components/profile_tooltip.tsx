export default function ProfileTooltip() {
    return (
        <div className="absolute top-10 w-full rounded-lg bg-gray-white flex flex-col text-body-regular text-gray-800 shadow-lg">
            <div className="p-3 hover:bg-gray-100 transition-all duration-300">Profile</div>
            <hr className="border-gray-200" />
            <div className="p-3 hover:bg-gray-100 transition-all duration-300">Settings</div>
            <hr className="border-gray-200" />
            <div className="p-3 hover:bg-gray-100 transition-all duration-300">Log Out</div>
        </div>
    );
}
