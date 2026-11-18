import type { Organization } from '../types/advisory'

// Sample manufacturers. In milestone 3 they come from the database.
export const organizations: Organization[] = [
  {
    slug: 'example-networks',
    name: 'Example Networks GmbH',
    description: 'Manufacturer of network gateways and firewalls for small and medium-sized businesses.',
    website: 'https://example.com',
    productType: 'hardware',
    securityContact: 'psirt@example.com',
    memberSince: '2026-03',
    verified: true,
  },
  {
    slug: 'thermo-devices',
    name: 'Thermo Devices AG',
    description: 'Smart heating controllers and building automation for homes and offices.',
    website: 'https://thermo-devices.example',
    productType: 'hardware',
    securityContact: 'security@thermo-devices.example',
    memberSince: '2026-05',
    verified: true,
  },
  {
    slug: 'fleetlink',
    name: 'Fleetlink Software GmbH',
    description: 'Fleet management software for logistics companies, as a cloud service and on premises.',
    website: 'https://fleetlink.example',
    productType: 'software',
    securityContact: 'psirt@fleetlink.example',
    memberSince: '2026-06',
    verified: true,
  },
  {
    slug: 'kessler',
    name: 'Kessler Maschinenbau KG',
    description: 'Packaging machines with their own HMI and OPC UA gateway for industrial plants.',
    website: 'https://kessler.example',
    productType: 'machinery',
    securityContact: 'product-security@kessler.example',
    memberSince: '2026-08',
    verified: true,
  },
]

export function findOrganization(slug: string | undefined): Organization | undefined {
  return organizations.find((organization) => organization.slug === slug)
}

export function findOrganizationByName(name: string | undefined): Organization | undefined {
  return organizations.find((organization) => organization.name === name)
}
