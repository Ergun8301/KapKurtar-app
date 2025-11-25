import React from "react";
import { LucideIcon } from "lucide-react";

interface BottomNavItemProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

/**
 * Composant pour un onglet de la bottom navigation
 * Affiche une icône et un label avec état actif/inactif
 */
const BottomNavItem: React.FC<BottomNavItemProps> = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors duration-200 focus:outline-none active:bg-transparent ${
        isActive ? "text-[#00A690]" : "text-[#00615F]"
      }`}
      style={{
        WebkitTapHighlightColor: "transparent",
        outline: "none",
      }}
    >
      <Icon
        className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"}`}
      />
      <span
        className={`text-xs mt-1 ${
          isActive ? "font-semibold" : "font-normal"
        }`}
      >
        {label}
      </span>
    </button>
  );
};

export default BottomNavItem;
