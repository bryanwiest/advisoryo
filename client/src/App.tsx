import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { sampleAdvisories } from './data/advisories'
import { AdvisoriesPage } from './pages/AdvisoriesPage'
import { AdvisoryPage } from './pages/AdvisoryPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import type { Advisory } from './types/advisory'

export default function App() {
  // All advisories live here and are passed down as props.
  const [advisories] = useState<Advisory[]>(sampleAdvisories)

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage advisories={advisories} />} />
          <Route path="advisories" element={<AdvisoriesPage advisories={advisories} />} />
          <Route path="advisories/:id" element={<AdvisoryPage advisories={advisories} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
