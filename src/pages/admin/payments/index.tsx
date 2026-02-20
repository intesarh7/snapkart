import { useEffect, useState } from "react"

export default function AdminPayments() {

  const [payments, setPayments] = useState([])

  useEffect(() => {
    fetch("/api/admin/payments")
      .then(res => res.json())
      .then(setPayments)
  }, [])

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Payment Management
      </h1>

      <div className="bg-white shadow rounded-xl overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-4">Payment ID</th>
              <th className="p-4">User</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Reference</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>

          <tbody>

            {payments.map((p: any) => (
              <tr key={p.id} className="border-t">

                <td className="p-4">#{p.id}</td>
                <td className="p-4">{p.user?.name}</td>
                <td className="p-4">₹{p.amount}</td>

                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium 
                    ${p.status === "PAID" ? "bg-green-100 text-green-600" :
                      p.status === "REFUNDED" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-600"}`}>
                    {p.status}
                  </span>
                </td>

                <td className="p-4">
                  {p.referenceType} #{p.referenceId}
                </td>

                <td className="p-4">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>

              </tr>
            ))}

          </tbody>
        </table>

      </div>

    </div>
  )
}
