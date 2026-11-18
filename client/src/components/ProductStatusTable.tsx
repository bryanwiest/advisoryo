import type { ProductEntry } from '../types/advisory'
import { StatusLabel } from './StatusLabel'

interface ProductStatusTableProps {
  products: ProductEntry[]
  caption: string
}

export function ProductStatusTable({ products, caption }: ProductStatusTableProps) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Version</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map((entry) => (
            <tr key={`${entry.productId}-${entry.status}`}>
              <td>{entry.product}</td>
              <td>{entry.version || 'all'}</td>
              <td><StatusLabel status={entry.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
