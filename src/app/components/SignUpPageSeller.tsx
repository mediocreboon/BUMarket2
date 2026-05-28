import { useState } from 'react';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface SignUpPageSellerProps {
  onSignUp: (name: string) => void;
  onBackToLogin: () => void;
}

export function SignUpPageSeller({ onSignUp, onBackToLogin }: SignUpPageSellerProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: '',
    businessName: '',
    businessCategory: '',
    businessDescription: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [idVerification, setIdVerification] = useState<File | null>(null);
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

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.businessCategory) {
      newErrors.businessCategory = 'Please select a business category';
    }

    if (!formData.businessDescription.trim()) {
      newErrors.businessDescription = 'Business description is required';
    }

    if (!idVerification) {
      newErrors.idVerification = 'Student ID verification document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d3997a9b/auth/signup`;

      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          studentId: formData.studentId,
          role: 'seller',
          department: formData.department,
          phone: formData.phone,
          businessName: formData.businessName,
          businessCategory: formData.businessCategory,
          businessDescription: formData.businessDescription,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const msg = result.error || 'Registration failed. Please try again.';
        if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
          setServerError('An account with this email already exists. Please log in instead.');
        } else {
          setServerError(msg);
        }
        setIsLoading(false);
        return;
      }

      // Success
      setSuccess(true);
      setTimeout(() => {
        onSignUp(formData.fullName);
      }, 800);
    } catch (err) {
      console.error('Seller signup error:', err);
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    setServerError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdVerification(e.target.files[0]);
      if (errors.idVerification) {
        setErrors({ ...errors, idVerification: '' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <button
          onClick={onBackToLogin}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Login
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-[36px]" style={{ fontFamily: 'Archivo Black, sans-serif' }}>
                <span className="text-black">BU</span>
                <span className="text-blue-600">M</span>
                <span className="text-blue-600" style={{ fontFamily: 'sans-serif' }}>arket</span>
              </h1>
            </div>
            <h2 className="text-gray-800">Create Seller Account</h2>
            <p className="text-gray-600 mt-2">
              Start your student business journey and reach the campus community
            </p>
          </div>

          {/* Server-level error */}
          {serverError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {serverError}
            </div>
          )}

          {/* Success banner */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
              Seller account created successfully! Logging you in…
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-gray-800 mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
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
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
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
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                        errors.studentId ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 2024-12345"
                    />
                    {errors.studentId && (
                      <p className="text-sm text-red-500 mt-1">{errors.studentId}</p>
                    )}
                  </div>
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
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your.name@university.edu"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
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
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                        errors.department ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Department</option>
                      <option value="computer_studies">Computer Studies Department</option>
                      <option value="engineering">Engineering Department</option>
                      <option value="teacher_education">Teacher Education Department</option>
                      <option value="technology">Technology Department</option>
                      <option value="nursing">Nursing Department</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.department && (
                      <p className="text-sm text-red-500 mt-1">{errors.department}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="e.g., +63 912 345 6789"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
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
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
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
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information Section */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-gray-800 mb-4">Business Information</h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Business Name */}
                  <div>
                    <label htmlFor="businessName" className="block text-sm text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      value={formData.businessName}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                        errors.businessName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Your business name"
                    />
                    {errors.businessName && (
                      <p className="text-sm text-red-500 mt-1">{errors.businessName}</p>
                    )}
                  </div>

                  {/* Business Category */}
                  <div>
                    <label htmlFor="businessCategory" className="block text-sm text-gray-700 mb-2">
                      Business Category *
                    </label>
                    <select
                      id="businessCategory"
                      name="businessCategory"
                      value={formData.businessCategory}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                        errors.businessCategory ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Category</option>
                      <option value="food">Food & Snacks</option>
                      <option value="academic">Academic Materials</option>
                      <option value="apparel">Apparel</option>
                      <option value="services">Services</option>
                      <option value="electronics">Electronics</option>
                    </select>
                    {errors.businessCategory && (
                      <p className="text-sm text-red-500 mt-1">{errors.businessCategory}</p>
                    )}
                  </div>
                </div>

                {/* Business Description */}
                <div>
                  <label htmlFor="businessDescription" className="block text-sm text-gray-700 mb-2">
                    Business Description *
                  </label>
                  <textarea
                    id="businessDescription"
                    name="businessDescription"
                    value={formData.businessDescription}
                    onChange={handleChange}
                    disabled={isLoading}
                    rows={4}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none ${
                      errors.businessDescription ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Describe your business, products, or services..."
                  />
                  {errors.businessDescription && (
                    <p className="text-sm text-red-500 mt-1">{errors.businessDescription}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Section */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-gray-800 mb-4">Student Verification</h3>
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Upload Student ID or Verification Document *
                </label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  errors.idVerification ? 'border-red-500' : 'border-gray-300'
                }`}>
                  {idVerification ? (
                    <div className="flex items-center justify-center gap-3 text-green-600">
                      <CheckCircle className="w-6 h-6" />
                      <span>{idVerification.name}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, PNG, JPG (max. 5MB)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                    id="idVerification"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="idVerification"
                    className="inline-block mt-4 px-6 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    Choose File
                  </label>
                </div>
                {errors.idVerification && (
                  <p className="text-sm text-red-500 mt-1">{errors.idVerification}</p>
                )}
              </div>
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
                  I agree to the Terms of Service, Seller Agreement, and Privacy Policy. I confirm that I am 
                  a verified student and will comply with all marketplace policies and guidelines.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account…
                </>
              ) : (
                'Create Seller Account'
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Your application will be reviewed within 24-48 hours. You will receive an email notification 
              once your account is verified and approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}