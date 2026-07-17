import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { authApi } from "../../api/auth";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const submitHandler = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const res = await authApi.resetPassword(
        token!,
        password
      );

      setMessage(res.data.message);

      toast.success("Password Updated Successfully");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err: any) {

      setError(
        err.response?.data?.message ||
        "Something went wrong"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="page-container">

      <div
        className="glass"
        style={{
          maxWidth: 450,
          margin: "80px auto",
          padding: "2rem",
        }}
      >

        <h2
          style={{
            color: "#fff",
            marginBottom: 20,
          }}
        >
          Reset Password
        </h2>

        {message && (
          <div
            style={{
              color: "#22c55e",
              marginBottom: 20,
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              color: "#ef4444",
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={submitHandler}>

          <div className="form-group">

            <label>New Password</label>

            <input
              type="password"
              className="form-input"
              placeholder="Enter new password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>

          <div className="form-group">

            <label>Confirm Password</label>

            <input
              type="password"
              className="form-input"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              required
            />

          </div>

          <button
            className="btn-primary"
            style={{
              width: "100%",
              marginTop: 20,
            }}
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : "Reset Password"}
          </button>

        </form>

        <div
          style={{
            marginTop: 20,
            textAlign: "center",
          }}
        >
          <Link
            to="/login"
            style={{
              color: "#8b5cf6",
            }}
          >
            Back to Login
          </Link>
        </div>

      </div>

    </div>
  );
}