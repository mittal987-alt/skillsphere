import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";

import { freelancerApi } from "../../api/freelancer";
import { reviewsApi } from "../../api/reviews";
import { verificationApi } from "../../api/verification";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StarRating from "../../components/common/StarRating";
import { type Review } from "../../types";

interface ProfileForm {
  title: string;
  bio: string;
  skills: string;
  hourlyRate: number;
  experience: number;
  availability: string;
  languages: string;
  portfolio: {
    title: string;
    description?: string;
    projectUrl?: string;
  }[];
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
}

export default function MyProfile() {
  const queryClient = useQueryClient();

  const [success, setSuccess] = useState("");

  const {
    data: profile,
    isLoading,
  } = useQuery({
    queryKey: ["freelancer-profile"],
    queryFn: async () => {
      const res = await freelancerApi.getMyProfile();
      return res.data.data;
    },
    retry: false,
  });

  const { data: reviews } = useQuery({
    queryKey: ["freelancer-reviews", profile?._id],
    queryFn: () => reviewsApi.getFreelancerReviews(profile!._id),
    select: (r) => r.data.reviews as Review[],
    enabled: !!profile?._id,
  });

  const [resumeUrl, setResumeUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [idCardUrl, setIdCardUrl] = useState('');

  const { data: verificationData, refetch: refetchVerification } = useQuery({
    queryKey: ["verification-status"],
    queryFn: () => verificationApi.getStatus(),
    select: r => r.data,
    enabled: !!profile,
  });

  const submitVerificationMutation = useMutation({
    mutationFn: (data: { resumeUrl: string; portfolioUrl: string; idCardNumber: string; idCardUrl: string }) =>
      verificationApi.submit(data),
    onSuccess: () => {
      toast.success("Verification request submitted successfully!");
      refetchVerification();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit verification");
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    defaultValues: {
      portfolio: [],
      bankDetails: {
        accountNumber: "",
        ifscCode: "",
        accountHolderName: "",
        bankName: ""
      }
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "portfolio",
  });

  useEffect(() => {
    if (!profile) return;

    reset({
      title: profile.title || "",
      bio: profile.bio || "",
      skills: profile.skills?.join(", ") || "",
      hourlyRate: profile.hourlyRate || 0,
      experience: profile.experience || 0,
      availability: profile.availability || "Available",
      languages: profile.languages?.join(", ") || "",
      portfolio: profile.portfolio || [],
      bankDetails: profile.bankDetails || {
        accountNumber: "",
        ifscCode: "",
        accountHolderName: "",
        bankName: ""
      }
    });
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const payload = {
        ...data,
        skills: data.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),

        languages: data.languages
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (profile) {
        return freelancerApi.updateProfile(payload);
      }

      return freelancerApi.createProfile(payload);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["freelancer-profile"],
      });

      setSuccess("Profile saved successfully!");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    },
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="page-container" style={{ maxWidth: 760 }}>
      <h1 className="section-title">
        {profile ? "Edit Profile" : "Create Profile"}
      </h1>

      <p className="section-subtitle">
        Showcase your skills and experience
      </p>

      <div className="glass" style={{ padding: "2rem" }}>
        {success && (
          <div
            style={{
              background: "rgba(16,185,129,.1)",
              border: "1px solid rgba(16,185,129,.3)",
              borderRadius: 10,
              padding: "12px",
              marginBottom: "20px",
              color: "#10b981",
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
          <div className="form-group">
            <label className="label">
              Professional Title *
            </label>

            <input
              className="input"
              {...register("title", {
                required: true,
              })}
            />

            {errors.title && (
              <span className="error-text">
                Required
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="label">
              Bio
            </label>

            <textarea
              className="textarea"
              style={{ minHeight: 120 }}
              {...register("bio")}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div className="form-group">
              <label className="label">
                Hourly Rate
              </label>

              <input
                type="number"
                className="input"
                {...register("hourlyRate", {
                  required: true,
                })}
              />
            </div>

            <div className="form-group">
              <label className="label">
                Experience
              </label>

              <input
                type="number"
                className="input"
                {...register("experience", {
                  required: true,
                })}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div className="form-group">
              <label className="label">
                Skills
              </label>

              <input
                className="input"
                placeholder="React, Node, MongoDB"
                {...register("skills")}
              />
            </div>

            <div className="form-group">
              <label className="label">
                Languages
              </label>

              <input
                className="input"
                placeholder="English, Hindi"
                {...register("languages")}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">
              Availability
            </label>

            <select
              className="select"
              {...register("availability")}
            >
              <option value="Available">
                Available
              </option>

              <option value="Busy">
                Busy
              </option>

              <option value="Offline">
                Offline
              </option>
            </select>
          </div>

          <div style={{ marginTop: 25 }}>
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginBottom: 15,
              }}
            >
              <h3>Portfolio</h3>

              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  append({
                    title: "",
                    description: "",
                    projectUrl: "",
                  })
                }
              >
                + Add Item
              </button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                style={{
                  padding: 15,
                  border:
                    "1px solid rgba(255,255,255,.08)",
                  borderRadius: 10,
                  marginBottom: 15,
                }}
              >
                <input
                  className="input"
                  placeholder="Project Title"
                  {...register(
                    `portfolio.${index}.title`
                  )}
                />

                <input
                  className="input"
                  placeholder="Project URL"
                  style={{
                    marginTop: 10,
                  }}
                  {...register(
                    `portfolio.${index}.projectUrl`
                  )}
                />

                <textarea
                  className="textarea"
                  placeholder="Description"
                  style={{
                    marginTop: 10,
                  }}
                  {...register(
                    `portfolio.${index}.description`
                  )}
                />

                <button
                  type="button"
                  className="btn-danger"
                  style={{
                    marginTop: 10,
                  }}
                  onClick={() =>
                    remove(index)
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 25, paddingTop: 25, borderTop: "1px solid rgba(255,255,255,.08)" }}>
            <h3 style={{ marginBottom: 15 }}>Bank Details</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: 20 }}>
              Provide your bank details to receive payouts securely.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="label">Account Holder Name</label>
                <input className="input" {...register("bankDetails.accountHolderName")} />
              </div>
              <div className="form-group">
                <label className="label">Bank Name</label>
                <input className="input" {...register("bankDetails.bankName")} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="label">Account Number</label>
                <input className="input" type="password" {...register("bankDetails.accountNumber")} />
              </div>
              <div className="form-group">
                <label className="label">IFSC Code</label>
                <input className="input" {...register("bankDetails.ifscCode")} />
              </div>
            </div>
          </div>

          <button
            className="btn-primary"
            style={{
              width: "100%",
              marginTop: 25,
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? "Saving..."
              : "Save Profile"}
          </button>
        </form>
      </div>

      {/* Identity Verification Section */}
      {profile && (
        <div style={{ marginTop: '2.5rem' }}>
          <h2 className="section-title" style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>Identity & Credential Verification</h2>
          <div className="glass" style={{ padding: '1.5rem', borderLeft: profile.verified ? '4px solid #10b981' : '4px solid #f59e0b' }}>
            {profile.verified ? (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#10b981' }}>✓ Account Verified</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', margin: 0 }}>
                  Your credentials have been successfully approved by the SkillSphere administrators. A verification checkmark has been applied to your profile.
                </p>
              </div>
            ) : verificationData?.request?.status === 'Pending' ? (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#f59e0b' }}>⏳ Verification Pending</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', margin: 0 }}>
                  Your request is currently being reviewed by administrators. This usually takes 1-2 business days.
                </p>
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
                  <div><strong>ID Number:</strong> {verificationData.request.idCardNumber}</div>
                  <div><strong>Resume:</strong> <a href={verificationData.request.resumeUrl} target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}>View file</a></div>
                  <div><strong>Portfolio:</strong> <a href={verificationData.request.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}>View link</a></div>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#ef4444' }}>⚠️ Verification Required</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  Submit your resume, portfolio link, and government ID card details to obtain the **Verified badge** and increase client trust.
                </p>

                {verificationData?.request?.status === 'Rejected' && (
                  <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f43f5e', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    <strong>Last Attempt Rejected:</strong> {verificationData.request.rejectionReason || "Credentials did not match."}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="label">Resume / CV File URL</label>
                    <input type="text" className="input" placeholder="e.g. PDF link in Google Drive / Cloudinary" value={resumeUrl} onChange={e => setResumeUrl(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="label">Portfolio Link</label>
                    <input type="text" className="input" placeholder="e.g. Portfolio site, GitHub, Behance" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="label">Govt ID Number (e.g. PAN / Aadhaar / SSN)</label>
                      <input type="text" className="input" placeholder="Enter ID number" value={idCardNumber} onChange={e => setIdCardNumber(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="label">ID Card Document File URL</label>
                      <input type="text" className="input" placeholder="Link to scanned document copy" value={idCardUrl} onChange={e => setIdCardUrl(e.target.value)} />
                    </div>
                  </div>
                  <button className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }} disabled={submitVerificationMutation.isPending || !resumeUrl || !portfolioUrl || !idCardNumber || !idCardUrl} onClick={() => submitVerificationMutation.mutate({ resumeUrl, portfolioUrl, idCardNumber, idCardUrl })}>
                    {submitVerificationMutation.isPending ? 'Submitting...' : 'Submit Credentials'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      {profile && (
        <div style={{ marginTop: '3rem' }}>
          <h2 className="section-title" style={{ fontSize: '1.35rem', marginBottom: '1.5rem' }}>Client Reviews & Feedback</h2>
          
          {(!reviews || reviews.length === 0) ? (
            <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⭐</div>
              <h3 style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>No reviews yet</h3>
              <p>Complete gigs to start receiving feedback from clients.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((r) => {
                // @ts-ignore - Temporary bypass for nested populations
                const client = r.client && typeof r.client === 'object' ? r.client : null;
                const clientUser = client && client.user ? client.user : null;

                return (
                  <div key={r._id} className="glass" style={{ padding: '1.5rem', borderRadius: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0
                        }}>
                          {clientUser?.name?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem' }}>
                            {clientUser?.name || 'Client'}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                            {new Date(r.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <StarRating rating={r.rating} size={15} />
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                      "{r.comment}"
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}