import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import type { ProductType } from '../types/advisory'

interface RegistrationForm {
  orgName: string
  orgWebsite: string
  orgType: ProductType
  orgContact: string
  name: string
  email: string
  password: string
  passwordRepeat: string
  terms: boolean
}

const EMPTY_FORM: RegistrationForm = {
  orgName: '',
  orgWebsite: '',
  orgType: 'software',
  orgContact: '',
  name: '',
  email: '',
  password: '',
  passwordRepeat: '',
  terms: false,
}

export function RegisterPage() {
  useDocumentTitle('Register your organization')
  // One state object for the whole form; the `name` attribute of each field is the key.
  const [form, setForm] = useState<RegistrationForm>(EMPTY_FORM)
  const [submittedOrg, setSubmittedOrg] = useState<string | null>(null)

  const passwordsDiffer = form.passwordRepeat !== '' && form.password !== form.passwordRepeat

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = event.target
    const checked = type === 'checkbox' && (event.target as HTMLInputElement).checked
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (passwordsDiffer) return
    // Sending the registration to the server follows with the backend in milestone 3.
    setSubmittedOrg(form.orgName)
    setForm(EMPTY_FORM)
  }

  return (
    <main id="main" className="auth">
      <div className="container">
        <section className="form-card auth-card auth-card-wide" aria-labelledby="register-title">
          <h1 id="register-title">Register your organization</h1>
          <p className="auth-intro">
            A platform admin checks every new organization before its first advisory goes public.
            You become the organization manager and can invite publishers afterwards.
          </p>

          {submittedOrg && (
            <p className="notice notice-success" role="status">
              Thank you. The registration of {submittedOrg} is complete on this page; sending it to a platform admin
              follows with the backend.
            </p>
          )}

          <form className="form-stack" onSubmit={handleSubmit}>
            <fieldset>
              <legend>Organization</legend>
              <div className="field">
                <label htmlFor="org-name">Company name</label>
                <input type="text" id="org-name" name="orgName" autoComplete="organization" required
                  value={form.orgName} onChange={handleChange} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="org-website">Website</label>
                  <input type="url" id="org-website" name="orgWebsite" placeholder="https://" required
                    value={form.orgWebsite} onChange={handleChange} />
                </div>
                <div className="field">
                  <label htmlFor="org-type">Products</label>
                  <select id="org-type" name="orgType" value={form.orgType} onChange={handleChange}>
                    <option value="software">Software</option>
                    <option value="hardware">Hardware and IoT devices</option>
                    <option value="machinery">Machinery and industrial systems</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="org-contact">Security contact (PSIRT email)</label>
                <input type="email" id="org-contact" name="orgContact" placeholder="psirt@example.com"
                  value={form.orgContact} onChange={handleChange} />
              </div>
            </fieldset>

            <fieldset>
              <legend>Your account</legend>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="name">Full name</label>
                  <input type="text" id="name" name="name" autoComplete="name" required
                    value={form.name} onChange={handleChange} />
                </div>
                <div className="field">
                  <label htmlFor="reg-email">Work email</label>
                  <input type="email" id="reg-email" name="email" autoComplete="email" required
                    value={form.email} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="reg-password">Password</label>
                  <input type="password" id="reg-password" name="password" autoComplete="new-password" minLength={12}
                    required aria-describedby="password-hint" value={form.password} onChange={handleChange} />
                  <p id="password-hint" className="hint">At least 12 characters.</p>
                </div>
                <div className="field">
                  <label htmlFor="reg-password-repeat">Repeat password</label>
                  <input type="password" id="reg-password-repeat" name="passwordRepeat" autoComplete="new-password"
                    minLength={12} required aria-invalid={passwordsDiffer}
                    aria-describedby={passwordsDiffer ? 'password-repeat-error' : undefined}
                    value={form.passwordRepeat} onChange={handleChange} />
                  {passwordsDiffer && (
                    <p id="password-repeat-error" className="field-error">The passwords do not match.</p>
                  )}
                </div>
              </div>
            </fieldset>

            <div className="choice">
              <input type="checkbox" id="terms" name="terms" required checked={form.terms} onChange={handleChange} />
              <label htmlFor="terms">I am authorised to publish security advisories for this organization.</label>
            </div>

            <button className="button" type="submit" disabled={passwordsDiffer}>Register organization</button>
          </form>

          <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
        </section>
      </div>
    </main>
  )
}
