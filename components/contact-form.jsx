"use client";

import { toast } from "@/components/dashboard-ui";
import { Send } from "lucide-react";

export function ContactForm() {
  return (
    <form
      className="card card-pad stack-lg"
      onSubmit={(e) => {
        e.preventDefault();
        toast("Message sent to the team", "success");
      }}
    >
      {["Name", "Email", "Company", "Subject"].map((field) => (
        <label className="form-field" key={field}>
          <span>{field}</span>
          <input className="input" placeholder={field} />
        </label>
      ))}
      <label className="form-field">
        <span>Message</span>
        <textarea className="textarea" placeholder="Tell us what you are building" />
      </label>
      <button className="btn btn-primary" type="submit"><Send size={18} /> Send Message</button>
    </form>
  );
}

export default ContactForm;
