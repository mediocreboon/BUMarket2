import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from "../../lib/supabase";

interface SignUpPageBuyerProps {
  onSignUp: (name: string) => void;
  onBackToLogin: () => void;
}

export function SignUpPageBuyer({
  onSignUp,
  onBackToLogin,
}: SignUpPageBuyerProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.department) {
      newErrors.department = 'Please select your department';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setServerError('');
    setSuccess(false);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // 1. SIGN UP USER (FIXED)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            fullName: formData.fullName,
          },
          emailRedirectTo: "http://localhost:5173",
        },
      });

      // 2. HANDLE ERROR
      if (signUpError) {
        const message = signUpError.message.toLowerCase();

        if (
          message.includes('already registered') ||
          message.includes('already exists')
        ) {
          setServerError('An account with this email already exists. Please log in instead.');
        } else {
          setServerError(signUpError.message);
        }

        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setServerError('Signup failed: No user returned.');
        setIsLoading(false);
        return;
      }

      // 3. CREATE PROFILE (FIX FOR LOGIN SYSTEM)
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: data.user.id,
          full_name: formData.fullName,
          student_id: formData.studentId,
          department: formData.department,
          phone: formData.phone,
          role: 'buyer',
          email: formData.email,
        },
      ]);

      if (profileError) {
        console.error(profileError);
        setServerError('Failed to create user profile.');
        setIsLoading(false);
        return;
      }

      // 4. SUCCESS STATE (UNCHANGED UI)
      setSuccess(true);

      setServerError(
        "Account created! Please check your email to confirm your account before logging in."
      );

      setTimeout(() => {
        onSignUp(formData.fullName);
      }, 500);

    } catch (err) {
      console.error('Unexpected error:', err);
      setServerError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }

    setServerError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">

        {/* Back Button (UNCHANGED) */}
        <button
          onClick={onBackToLogin}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Login
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* HEADER (UNCHANGED EXACTLY) */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-[36px]">
                <span className="font-bold text-black not-italic font-[Archivo_Black]">BU</span>
                <span className="font-bold text-blue-600 font-[Archivo_Black]">M</span>
                <span className="text-blue-600">arket</span>
              </h1>
            </div>
            <h2 className="text-gray-800 text-[20px] font-normal font-bold">
              Create Buyer Account
            </h2>
            <p className="text-gray-600 mt-2">
              Join our community and start shopping from verified student entrepreneurs
            </p>
          </div>

          {/* SERVER ERROR (UNCHANGED) */}
          {serverError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {serverError}
            </div>
          )}

          {/* SUCCESS (UNCHANGED) */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
              Account created! Please check your email to confirm your account before logging in.
            </div>
          )}

          {/* FORM (UNCHANGED UI STRUCTURE) */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Student ID */}
            <div>
              <label htmlFor="studentId" className="block text-sm text-gray-700 mb-2">
                Student ID *
              </label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                value={formData.studentId}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="e.g., 2024-12345"
              />
              {errors.studentId && (
                <p className="text-sm text-red-500 mt-1">{errors.studentId}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
                University Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="your.name@university.edu"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label htmlFor="department" className="block text-sm text-gray-700 mb-2">
                Department *
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select Department</option>
                <option value="computer_studies">Computer Studies Department</option>
                <option value="engineering">Engineering Department</option>
                <option value="teacher_education">Teacher Education Department</option>
                <option value="technology">Technology Department</option>
                <option value="nursing">Nursing Department</option>
                <option value="entrepreneurship">Entrepreneurship Department</option>
              </select>
              {errors.department && (
                <p className="text-sm text-red-500 mt-1">{errors.department}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="e.g., +63 912 345 6789"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 mb-2">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I agree to the Terms of Service and Privacy Policy. I confirm that I am a verified student
                  of the university and will use this platform responsibly.
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isLoading ? 'Creating Account…' : 'Create Buyer Account'}
            </button>

          </form>

          {/* Footer (UNCHANGED) */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              All sellers on BUMarket are verified student entrepreneurs. Your information is secure and
              will only be used for account verification purposes.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}