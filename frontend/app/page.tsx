"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      router.push("/auth/login");
    }
  }, [countdown, router]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a]">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] animate-pulse-slow rounded-full bg-gradient-to-br from-purple-500/30 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[600px] w-[600px] animate-pulse-slower rounded-full bg-gradient-to-br from-pink-500/30 to-transparent blur-3xl" />
        <div className="absolute top-1/3 right-1/3 h-[400px] w-[400px] animate-pulse-slowest rounded-full bg-gradient-to-br from-indigo-500/20 to-transparent blur-3xl" />
      </div>

      {/* Animated grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(167,139,250,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(167,139,250,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />

      {/* Main content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
        {/* Logo/Brand */}
        <div className="mb-12 animate-fade-in-down">
          <div className="relative">
            <div className="absolute -inset-1 animate-pulse-slow rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-30 blur" />
            <div className="relative rounded-lg bg-[#111] px-8 py-4">
              <h1 className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
                Premium Education Systems
              </h1>
            </div>
          </div>
        </div>

        {/* Welcome message */}
        <div className="max-w-2xl animate-fade-in-up space-y-6 text-center">
          <h2 className="text-5xl font-light tracking-tight text-white sm:text-6xl lg:text-7xl">
            Welcome to
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text font-semibold text-transparent">
              Your School
            </span>
          </h2>

          <p className="mx-auto max-w-lg text-lg leading-relaxed text-zinc-400 sm:text-xl">
            Streamline your school management with our comprehensive platform
            designed for modern education.
          </p>

          {/* Redirect indicator */}
          <div className="flex flex-col items-center gap-6 pt-8">
            {/* Animated spinner */}
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-purple-500" />
              <div className="absolute inset-2 rounded-full border-4 border-pink-500/20" />
              <div className="absolute inset-2 animate-spin-slow rounded-full border-4 border-transparent border-t-pink-500" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-300">
                Redirecting you to login...
              </p>
              <p className="text-3xl font-bold tabular-nums text-white">
                {countdown}
              </p>
            </div>

            {/* Manual link */}
            <button
              onClick={() => router.push("/auth/login")}
              className="group relative mt-4 overflow-hidden rounded-full px-8 py-3 text-sm font-medium transition-all hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 opacity-100 transition-opacity group-hover:opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative flex items-center gap-2 text-white">
                Continue to Login
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-20 grid max-w-4xl animate-fade-in-up gap-6 sm:grid-cols-3" style={{ animationDelay: "200ms" }}>
          {[
            {
              icon: "📊",
              title: "Analytics",
              description: "Real-time insights and reporting",
            },
            {
              icon: "👥",
              title: "User Management",
              description: "Seamless role-based access",
            },
            {
              icon: "🔒",
              title: "Secure",
              description: "Enterprise-grade security",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-purple-500/50 hover:bg-zinc-900/80"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-3 text-3xl">{feature.icon}</div>
                <h3 className="mb-2 font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating particles - only render on client to avoid hydration mismatch */}
      {mounted && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 animate-float rounded-full bg-purple-400/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${10 + Math.random() * 20}s`,
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        @keyframes pulse-slower {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.08);
          }
        }

        @keyframes pulse-slowest {
          0%,
          100% {
            opacity: 0.15;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.1);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          50% {
            transform: translateY(-100vh) translateX(50px);
            opacity: 0.2;
          }
          90% {
            opacity: 0.1;
          }
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }

        .animate-pulse-slowest {
          animation: pulse-slowest 8s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}