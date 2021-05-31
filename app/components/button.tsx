import React from 'react';

interface ButtonProps {
  onClick: () => void;
  text: string;
}

export const Button = ({ onClick, text }: ButtonProps) => <button onClick={onClick}>{text}</button>;
