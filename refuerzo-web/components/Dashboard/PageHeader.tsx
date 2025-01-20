"use client";

import React, { ReactElement } from "react";

interface ButtonProps {
  onClick?: () => void;
  className?: string;
  icon?: ReactElement;
  label: string;
}

interface PageHeaderProps {
  title: string;
  buttons?: ButtonProps[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, buttons = [] }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-4xl font-bold text-blue_principal">{title}</h1>
      <div className="flex items-center gap-4">
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={button.onClick}
            className={`flex items-center gap-2 ${button.className || ""}`}
          >
            {button.icon && React.cloneElement(button.icon, { size: 20 })}
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PageHeader;
