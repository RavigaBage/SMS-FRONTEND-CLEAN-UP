import React from "react";

interface ErrorMessageProps {
  errorDetail: any;
  className?: string; 
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  errorDetail,
  className,
}) => {
  if (!errorDetail) return null;

  const flattenError = (err: any): string[] => {
    if (!err) return [];
    if (typeof err === "string") return [err];
    if (Array.isArray(err)) return err.flatMap(flattenError);
    if (typeof err === "object")
      return Object.values(err).flatMap(flattenError);
    return [];
  };

  const messages = flattenError(errorDetail);

  if (!messages.length) return null;

  return (
    <ul
      className={`bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm space-y-1 ${className}`}
    >
      {messages.map((msg, idx) => (
        <li key={idx}>{msg}</li>
      ))}
    </ul>
  );
};

export const extractErrorDetail = (payload: any): any => {
  if (!payload) return null;
  if (typeof payload === "string") {
    try {
      return JSON.parse(payload);
    } catch {
      return payload;
    }
  }

  if (payload instanceof Error) {
    const message = payload.message;
    if (!message) return "An unexpected error occurred.";
    try {
      return JSON.parse(message);
    } catch {
      return message;
    }
  }

  if (payload.detail) return payload.detail;
  if (payload.error) return payload.error;
  if (payload.message) return payload.message;

  return payload;
};

export default ErrorMessage;
