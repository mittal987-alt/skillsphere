import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { freelancerApi } from "../../api/freelancer";
import { reviewsApi } from "../../api/reviews";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StarRating from "../../components/common/StarRating";
import { type Review, type ClientProfile, type User } from "../../types";

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

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    defaultValues: {
      portfolio: [],
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
                      "{r.review}"
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