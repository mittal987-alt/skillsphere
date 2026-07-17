import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { freelancerApi } from "../../api/freelancer";
import LoadingSpinner from "../../components/common/LoadingSpinner";

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
    </div>
  );
}