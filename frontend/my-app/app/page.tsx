"use client";

import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Code,
  FileText,
  Users,
  Shield,
  Menu,
  X,
  Calendar,
  Mail,
  MapPin,
  Phone,
  GraduationCap,
  User,
  UserCog,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";


// ============ NAVBAR COMPONENT ============
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isSignupDialogOpen, setIsSignupDialogOpen] = useState(false);
  const router = useRouter();

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    
    { name: "About", href: "#about" },
  ];

  const handleStudentLogin = () => {
    setIsLoginDialogOpen(false);
    router.push("/auth/student");
  };

  const handleTeacherLogin = () => {
    setIsLoginDialogOpen(false);
    router.push("/auth/teacher");
  };

  const handleStudentSignup = () => {
    setIsSignupDialogOpen(false);
    router.push("/auth/student?mode=signup");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        {/* College Header Bar - Main Navy Bar */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              {/* College Logo & Name */}
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/10 border-2 border-white/40 shadow-lg">
                  <GraduationCap className="w-8 h-8 text-amber-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-xl md:text-2xl text-white leading-tight tracking-wide">
                    Government College of Engineering, Chandrapur
                  </span>
                  <span className="text-sm text-amber-400 leading-tight font-medium">
                    A Virtual Lab for Computer Science & Engineering
                  </span>
                </div>
              </div>

              {/* Desktop Navigation Links - Right Side */}
              <div className="hidden lg:flex items-center">
                <div className="flex items-center bg-slate-800/50 rounded-l-none" style={{ clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)' }}>
                  <div className="flex items-center gap-6 pl-12 pr-6 py-2">
                    {navLinks.map((link) => (
                      <a
                        key={link.name}
                        href={link.href}
                        className="text-sm font-medium text-white/90 hover:text-amber-400 transition-colors"
                      >
                        {link.name}
                      </a>
                    ))}
                    <button
                      onClick={() => setIsLoginDialogOpen(true)}
                      className="text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      Login
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-slate-800 border-b border-slate-700">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm font-medium text-white/80 hover:text-amber-400 transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <div className="flex flex-col gap-2 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsLoginDialogOpen(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsSignupDialogOpen(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-900 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Login Role Selection Dialog */}
      {isLoginDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsLoginDialogOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <button
              onClick={() => setIsLoginDialogOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Login to CodeLab</h2>
              <p className="text-sm text-slate-500 mt-1">Please select your role to continue</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleStudentLogin}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <span className="font-semibold text-slate-900">Student</span>
                <span className="text-xs text-slate-500">Login or Sign Up</span>
              </button>
              <button
                onClick={handleTeacherLogin}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <UserCog className="w-8 h-8 text-amber-600" />
                </div>
                <span className="font-semibold text-slate-900">Teacher</span>
                <span className="text-xs text-slate-500">Login Only</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signup Dialog - Only for Students */}
      {isSignupDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsSignupDialogOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <button
              onClick={() => setIsSignupDialogOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Sign Up for CodeLab</h2>
              <p className="text-sm text-slate-500 mt-1">Student Registration Portal</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-blue-600" />
              </div>
              <p className="text-sm text-slate-500 text-center">
                Only students can create new accounts. Teachers are registered by the department administrator.
              </p>
              <button
                onClick={handleStudentSignup}
                className="w-full px-6 py-3 text-sm font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
              >
                Continue as Student
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ============ HERO SECTION ============
const HeroSection = () => {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const router = useRouter();


  const handleStudentLogin = () => {
    setIsLoginDialogOpen(false);
    router.push("/auth/student");
  };

  const handleTeacherLogin = () => {
    setIsLoginDialogOpen(false);
    router.push("/auth/teacher");
  };

  return (
    <>
      <section id="home" className="pt-28 pb-16 md:pt-36 md:pb-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 mb-8">
              <Code className="w-4 h-4 text-blue-900" />
              <span className="text-sm font-medium text-slate-600">
                Virtual Coding Laboratory
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
              CodeLab – Virtual Coding Lab
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-slate-600 mb-4 font-medium">
              A Centralized Platform for Coding Practicals and Assignments
            </p>

            {/* Description */}
            <p className="text-base text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Execute programming practicals online, submit assignments
              seamlessly, and track your academic progress. Designed for Computer
              Science students at Government College of Engineering, Chandrapur.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors group">
                <BookOpen className="w-5 h-5 mr-2" />
                View Assignments
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setIsLoginDialogOpen(true)}
                className="inline-flex items-center px-6 py-3 text-base font-medium text-slate-700 border-2 border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Login to Continue
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-slate-200 max-w-lg mx-auto">
              
              
              
            </div>
          </div>
        </div>
      </section>

      {/* Login Role Selection Dialog */}
      {isLoginDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsLoginDialogOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <button
              onClick={() => setIsLoginDialogOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Login to CodeLab</h2>
              <p className="text-sm text-slate-500 mt-1">Please select your role to continue</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleStudentLogin}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <span className="font-semibold text-slate-900">Student</span>
                <span className="text-xs text-slate-500">Login or Sign Up</span>
              </button>
              <button
                onClick={handleTeacherLogin}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <UserCog className="w-8 h-8 text-amber-600" />
                </div>
                <span className="font-semibold text-slate-900">Teacher</span>
                <span className="text-xs text-slate-500">Login Only</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ============ FEATURES SECTION ============
const FeaturesSection = () => {
  const features = [
    {
      icon: Code,
      title: "Online Coding Practicals",
      description:
        "Write, compile, and execute code directly in your browser. Support for multiple programming languages including C, C++, Java, and Python.",
    },
    {
      icon: FileText,
      title: "Assignment-Based Evaluation",
      description:
        "Submit assignments online with automatic deadline tracking. Teachers can review, grade, and provide feedback efficiently.",
    },
    {
      icon: Users,
      title: "Student & Teacher Dashboards",
      description:
        "Dedicated dashboards for students to track progress and for teachers to manage courses, assignments, and student submissions.",
    },
    {
      icon: Shield,
      title: "Secure Authentication",
      description:
        "Role-based access control ensures students and teachers have appropriate permissions. Secure login with institutional credentials.",
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-blue-900 tracking-wider uppercase">
            Platform Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
            Everything You Need for Virtual Labs
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            A comprehensive platform designed to facilitate online practical
            sessions and assignment management for engineering students.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-slate-50 border border-slate-200 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-900 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};



// ============ FOOTER COMPONENT ============
const Footer = () => {
  const quickLinks = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "Assignments", href: "#assignments" },
    { name: "About", href: "#about" },
  ];

  return (
    <footer id="about" className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* College Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight">
                  Government College of Engineering, Chandrapur
                </h3>
                <p className="text-sm text-amber-400">
                  Department of Computer Science & Engineering
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-6 max-w-xl">
              CodeLab is the official virtual coding laboratory platform for the CSE department,
              providing students with a comprehensive environment for programming practicals and assignments.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Chandrapur, Maharashtra 442401, India</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>cse@gcechandrapur.ac.in</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>+91 7172 252575</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-amber-400">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-slate-700 text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} CodeLab – Virtual Coding Lab. Government College of Engineering, Chandrapur. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// ============ MAIN PAGE COMPONENT ============
const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
     
      <Footer />
    </div>
  );
};

export default HomePage;
