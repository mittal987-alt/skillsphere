import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../../api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const submitHandler = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);

    setError("");

    setMessage("");

    try {
      const res = await authApi.forgotPassword(email);

      setMessage(res.data.message);

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
          Forgot Password
        </h2>

        <p
          style={{
            color: "#94a3b8",
            marginBottom: 20,
          }}
        >
          Enter your registered email address.
        </p>

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

            <label>Email</label>

            <input
              type="email"
              className="form-input"
              placeholder="Enter email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: "100%",
              marginTop: 20,
            }}
            disabled={loading}
          >
            {loading
              ? "Sending..."
              : "Send Reset Link"}
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