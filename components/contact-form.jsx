"use client";

import { toast } from "@/components/dashboard-ui";
import { Send } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";

export function ContactForm() {
  const [sending, setSending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (sending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    setSending(true);
    try {
      await api.contact.send(payload);
      toast("Your message was sent successfully", "success");
      form.reset();
    } catch (error) {
      toast(error.message || "Unable to send your message. Please try again.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="card card-pad stack-lg" onSubmit={submit}>
      <div className="contact-form-heading"><h2>Send us a message</h2><p>We’ll get back to you as soon as we can.</p></div>
      <div className="contact-form-grid">
        <label className="form-field"><span>Name</span><input autoComplete="name" className="input" name="name" placeholder="Your name" required maxLength={80} /></label>
        <label className="form-field"><span>Email</span><input autoComplete="email" className="input" name="email" type="email" placeholder="you@example.com" required maxLength={254} /></label>
        <label className="form-field"><span>Company <small>Optional</small></span><input autoComplete="organization" className="input" name="company" placeholder="Your company" maxLength={120} /></label>
        <label className="form-field"><span>Subject</span><input className="input" name="subject" placeholder="How can we help?" required maxLength={160} /></label>
      </div>
      <label className="form-field">
        <span>Message</span>
        <textarea className="textarea" name="message" placeholder="Tell us a little more..." required minLength={10} maxLength={5000} />
      </label>
      <button className="btn btn-primary contact-submit" disabled={sending} type="submit"><Send size={16} />{sending ? "Sending..." : "Send Message"}</button>
    </form>
  );
}

export default ContactForm;
