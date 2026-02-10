"use client";

interface ErrorStateProps {
  code: number;
  message: string;
}

export function ErrorState({ code, message }: ErrorStateProps) {
  // Map our official codes to visual styles
  const getErrorType = (code: number) => {
    switch (code) {
      case 2: return "Database Error"; // 
      case 4: return "Authentication Failed"; // 
      case 6: return "Not Found"; // 
      default: return "Error";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-red-100 shadow-sm">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
        
      </div>
      <h2 className="text-xl font-bold text-slate-800">{getErrorType(code)}</h2>
      <p className="text-slate-500 mt-2 text-center max-w-xs">
        {message} 
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium"
      >
        Try Again
      </button>
    </div>
  );
}