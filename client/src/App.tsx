import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { sampleAdvisories } from './data/advisories'
import { AdvisoriesPage } from './pages/AdvisoriesPage'
import { AdvisoryPage } from './pages/AdvisoryPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OrganizationPage } from './pages/OrganizationPage'
import { RegisterPage } from './pages/RegisterPage'
import { UploadPage } from './pages/UploadPage'
import type { Advisory } from './types/advisory'

export default function App() {
  // All advisories live here and are passed down as props. Until the backend exists (milestone 3),
  // uploads are only kept in this state and are gone after a reload.
  const [advisories, setAdvisories] = useState<Advisory[]>(sampleAdvisories)

  function publish(advisory: Advisory) {
    // A new revision replaces the published version with the same tracking ID.
    setAdvisories((current) => [advisory, ...current.filter((existing) => existing.id !== advisory.id)])
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage advisories={advisories} />} />
          <Route path="advisories" element={<AdvisoriesPage advisories={advisories} />} />
          <Route path="advisories/:id" element={<AdvisoryPage advisories={advisories} />} />
          <Route path="organizations/:slug" element={<OrganizationPage advisories={advisories} />} />
          <Route path="upload" element={<UploadPage advisories={advisories} onPublish={publish} />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
